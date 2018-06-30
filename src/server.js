import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

export default class Server {
  constructor(scriptRunner) {
    this.scriptRunner = scriptRunner;
    this.app = this.createApp();
  }

  listen = (...args) => {
    this.app.listen(...args);
  }

  createApp = () => {
    const app = express();

    app.use(morgan('dev'));
    app.use(bodyParser.json());

    app.get('/', this.handleHeartbeat);
    app.get('/domains/:domain', this.handleFetch);
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
    const { owner, domain, target } = req.body;

    this.safeRespond(res, async () => {
      res.json(await this.scriptRunner.register(owner, domain, target));
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
      res.statusCode = 400;
      res.send(err.message);
    }
  }
}
