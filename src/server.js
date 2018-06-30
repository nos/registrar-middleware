import express from 'express';
import morgan from 'morgan';
import authParser from 'express-auth-parser';
import bodyParser from 'body-parser';

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

    app.use(morgan('dev'));
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

    this.safeRespond(res, async () => {
      res.json(await this.scriptRunner.fetch(domain));
    });
  }

  handleCreate = (req, res) => {
    const { domain, target, owner } = req.body;

    this.safeRespond(res, async () => {
      res.json(await this.scriptRunner.register(domain, target, owner));
    });
  }

  handleUpdate = (req, res) => {
    const { domain } = req.params;
    const { target } = req.body;

    this.safeRespond(res, async () => {
      res.json(await this.scriptRunner.update(domain, target));
    });
  }

  handleDelete = (req, res) => {
    const { domain } = req.params;

    this.safeRespond(res, async () => {
      res.json(await this.scriptRunner.delete(domain));
    });
  }

  safeRespond = async (res, callback) => {
    try {
      await callback();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.status(400).json({ error: err.message });
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
