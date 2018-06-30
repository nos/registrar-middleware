/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv';

import './networks';
import Server from './server';
import ScriptRunner from './scriptRunner';

['.env.local', '.env'].forEach((filename) => {
  dotenv.config({ path: path.resolve(__dirname, '..', filename) });
});

const port = parseInt(process.env.PORT, 10);

const scriptRunner = new ScriptRunner({
  network: process.env.NETWORK,
  wif: process.env.CONTRACT_WIF,
  address: process.env.CONTRACT_ADDRESS,
  scriptHash: process.env.CONTRACT_SCRIPTHASH
});

const server = new Server(scriptRunner, {
  authToken: process.env.AUTH_TOKEN
});

server.listen(port, () => console.log(`Listening on port ${port}.`));
