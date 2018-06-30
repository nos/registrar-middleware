import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import ScriptRunner from './scriptRunner';

const DEFAULT_PORT = 3000;

export default class Server {
  constructor({ wif, address, scriptHash } = {}) {
    this.wif = wif;
    this.address = address;
    this.scriptHash = scriptHash;
    this.app = this.createApp();
    this.scriptRunner = new ScriptRunner({ address, scriptHash });
  }

  listen = (port = DEFAULT_PORT, ...args) => {
    this.app.listen(port, ...args);
  }

  createApp = () => {
    const app = express();

    app.use(morgan('dev'));
    app.use(bodyParser.json());

    app.get('/', this.handleHeartbeat);
    app.post('/domains', this.handleCreate);
    app.put('/domains/:domain', this.handleUpdate);
    app.delete('/domains/:domain', this.handleDelete);

    return app;
  }

  handleHeartbeat = (req, res) => {
    res.send('Registrar middleware is running!');
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

  safeRespond = (res, callback) => {
    try {
      callback();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.statusCode = 500;
      res.send(err.message);
    }
  }
}
