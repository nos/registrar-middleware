/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv';

import Server from './server';

['.env', '.env.local'].forEach((filename) => {
  dotenv.config({ path: path.resolve(__dirname, '..', filename) });
});

const port = parseInt(process.env.PORT, 10);

const server = new Server({
  wif: process.env.CONTRACT_WIF,
  address: process.env.CONTRACT_ADDRESS,
  scriptHash: process.env.CONTRACT_SCRIPTHASH
});

server.listen(port, () => console.log(`Listening on port ${port}.`));
