import express from 'express';
import morgan from 'morgan';
import authParser from 'express-auth-parser';
import bodyParser from 'body-parser';

const GAS_AMOUNT = 500;

export default class Server {
  constructor(scriptRunner, { authToken } = {}) {
    this.scriptRunner = scriptRunner;
    this.authToken = authToken;
    this.app = this.createApp();
  }

  listen = (...args) => {
    this.app.listen(...args);
  }

  createApp = () => {
    const app = express();

    app.use(morgan('combined'));
    app.use(authParser);
    app.use(bodyParser.json());

    app.get('/', this.handleHeartbeat);
    app.get('/domains/:domain', this.handleFetch);

    app.use(this.authenticate);
    app.post('/domains', this.handleCreate);
    app.put('/domains/:domain', this.handleUpdate);
    app.delete('/domains/:domain', this.handleDelete);

    return app;
  }

  handleHeartbeat = (req, res) => {
    res.send('Registrar middleware is running!');
  }

  handleFetch = (req, res) => {
    const { domain } = req.params;

    this.safeRespond(res, () => this.scriptRunner.fetch(domain));
  }

  handleCreate = async (req, res) => {
    const { domain, target, owner } = req.body;

    const response = await this.safeRespond(res, () => {
      return this.scriptRunner.register(domain, target, owner);
    });

    if (!response || !owner) {
      return;
    }

    try {
      await this.scriptRunner.nextBlock();
      const { response: { result: success } } = await this.scriptRunner.sendGAS(GAS_AMOUNT, owner);

      if (!success) {
        throw new Error('Transaction unsuccessful.');
      }

      console.log(`Successfully sent GAS to ${owner}.`); // eslint-disable-line no-console
    } catch (err) {
      console.error('Failed to send GAS.', err); // eslint-disable-line no-console
    }
  }

  handleUpdate = (req, res) => {
    const { domain } = req.params;
    const { target } = req.body;

    this.safeRespond(res, () => this.scriptRunner.update(domain, target));
  }

  handleDelete = (req, res) => {
    const { domain } = req.params;

    this.safeRespond(res, () => this.scriptRunner.delete(domain));
  }

  safeRespond = async (res, callback) => {
    try {
      const response = await callback();
      res.json(response);
      return response;
    } catch (err) {
      console.error('Failed to process request.', err); // eslint-disable-line no-console
      res.status(400).json({ error: err.message });
      return null;
    }
  }

  authenticate = (req, res, next) => {
    if (!req.authorization || !this.authorized(req.authorization)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    next();
  }

  authorized = (authorization) => {
    const { scheme, credentials } = authorization;
    return scheme === 'Basic' && credentials === this.authToken;
  }
}
