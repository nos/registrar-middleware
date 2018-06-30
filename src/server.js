import express from 'express';

const DEFAULT_PORT = 3000;

export default class Server {
  constructor({ wif, address, scriptHash } = {}) {
    this.wif = wif;
    this.address = address;
    this.scriptHash = scriptHash;
    this.app = this.createApp();
  }

  listen = (port = DEFAULT_PORT, ...args) => {
    this.app.listen(port, ...args);
  }

  createApp = () => {
    const app = express();

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
    // TODO accept `domain`, `target`, & owner `address` params
    res.send('TODO: Register on name-service SC');
  }

  handleUpdate = (req, res) => {
    // TODO accept `domain` & `target` params
    res.send('TODO: Update on name-service SC');
  }

  handleDelete = (req, res) => {
    // TODO accept `domain` param
    res.send('TODO: Remove from name-service SC');
  }
}
