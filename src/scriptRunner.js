import { sc, api, wallet } from '@cityofzion/neon-js';

const { string, byteArray } = sc.ContractParam;

export default class ScriptRunner {
  constructor({ network = 'TestNet', address, scriptHash, wif } = {}) {
    this.network = network;
    this.address = address;
    this.scriptHash = scriptHash;
    this.privateKey = new wallet.Account(wif).privateKey;
  }

  fetch = (domain) => {
    return this.execute('GetDomain', [
      byteArray(this.address, 'address'),
      string(domain)
    ]);
  }

  register = (domain, target, ownerAddress = null) => {
    const args = [
      byteArray(this.address, 'address'),
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
      byteArray(this.address, 'address'),
      string(domain),
      string(target)
    ]);
  }

  delete = (domain) => {
    return this.execute('DeleteDomain', [
      byteArray(this.address, 'address'),
      string(domain)
    ]);
  }

  execute = async (operation, args = []) => {
    const { response } = await api.doInvoke({
      gas: 0,
      net: this.network,
      address: this.address,
      privateKey: this.privateKey,
      script: this.buildScript(operation, args)
    }, api.neoscan);

    if (response && !response.result) {
      throw new Error('Invocation failed.');
    }

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
