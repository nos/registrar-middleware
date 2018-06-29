/* eslint-disable no-console */
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';

['.env', '.env.local'].forEach((filename) => {
  dotenv.config({ path: path.resolve(__dirname, '..', filename) });
});

const app = express();
const port = parseInt(process.env.PORT, 10);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractWIF = process.env.CONTRACT_WIF;

if (!contractAddress) {
  console.error('The `CONTRACT_ADDRESS` environment variable is not set.');
  process.exit(1);
}

if (!contractWIF) {
  console.error('The `CONTRACT_WIF` environment variable is not set.');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Registrar middleware is running!');
});

app.post('/domains', (req, res) => {
  // TODO accept `domain`, `target`, & owner `address` params
  res.send('TODO: Register on name-service SC');
});

app.put('/domains/:domain', (req, res) => {
  // TODO accept `domain` & `target` params
  res.send('TODO: Update on name-service SC');
});

app.delete('/domains/:domain', (req, res) => {
  // TODO accept `domain` param
  res.send('TODO: Remove from name-service SC');
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}.`));
