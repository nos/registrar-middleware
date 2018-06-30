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

  handleCreate = async (req, res) => {
    const { owner, domain, target } = req.body;

    try {
      res.json(await this.scriptRunner.register(owner, domain, target));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.send(err.message);
    }
  }

  handleUpdate = async (req, res) => {
    const { domain } = req.params;
    const { target } = req.body;

    try {
      res.json(await this.scriptRunner.update(domain, target));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.send(err.message);
    }
  }

  handleDelete = async (req, res) => {
    const { domain } = req.params;

    try {
      res.json(await this.scriptRunner.delete(domain));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.send(err.message);
    }
  }
}
