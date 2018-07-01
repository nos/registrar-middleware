import { sc, api, rpc, wallet } from '@cityofzion/neon-js';

import poll from './poll';

const { string, byteArray } = sc.ContractParam;

export default class ScriptRunner {
  constructor({ network = 'TestNet', scriptHash, wif } = {}) {
    this.network = network;
    this.scriptHash = scriptHash;
    this.account = new wallet.Account(wif);
  }

  fetch = (domain) => {
    return this.execute('GetDomain', [
      byteArray(this.account.address, 'address'),
      string(domain)
    ]);
  }

  register = (domain, target, ownerAddress = null) => {
    const args = [
      byteArray(this.account.address, 'address'),
      string(domain),
      string(target)
    ];

    if (ownerAddress) {
      args.push(byteArray(ownerAddress, 'address'));
    }

    return this.execute('RegisterDomain', args);
  }

  update = (domain, target) => {
    return this.execute('SetDomainTarget', [
      byteArray(this.account.address, 'address'),
      string(domain),
      string(target)
    ]);
  }

  delete = (domain) => {
    return this.execute('DeleteDomain', [
      byteArray(this.account.address, 'address'),
      string(domain)
    ]);
  }

  nextBlock = async () => {
    const endpoint = await api.getRPCEndpointFrom({ net: this.network }, api.neoscan);
    const client = new rpc.RPCClient(endpoint);
    const startHeight = await client.getBlockCount();

    await poll(async () => {
      const currentHeight = await client.getBlockCount();

      if (currentHeight === startHeight) {
        throw new Error('Waiting for next block took too long.');
      }
    }, { attempts: 50, frequency: 1000 });
  }

  sendGAS = (amount, recipient) => {
    return this.send(api.makeIntent({ GAS: amount }, recipient));
  }

  send = (intents) => {
    return api.sendAsset({
      net: this.network,
      address: this.account.address,
      privateKey: this.account.privateKey,
      intents
    }, api.neoscan);
  }

  execute = async (operation, args = []) => {
    const { response } = await api.doInvoke({
      gas: 0,
      net: this.network,
      address: this.account.address,
      privateKey: this.account.privateKey,
      script: this.buildScript(operation, args)
    }, api.neoscan);

    return response;
  }

  buildScript = (operation, args) => {
    const builder = new sc.ScriptBuilder();
    builder.emitAppCall(this.scriptHash, operation, args);
    return builder.str;
  }

  getEndpoint = () => {
    return api.getRPCEndpointFrom({ net: this.network }, api.neoscan);
  }
}
