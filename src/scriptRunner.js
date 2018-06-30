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

  register = (ownerAddress, domain, target) => {
    return this.execute('RegisterDomain', [
      byteArray(this.address, 'address'),
      string(domain),
      byteArray(ownerAddress, 'address'),
      string(target)
    ]);
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
      script: new sc.ScriptBuilder(this.scriptHash, operation, args).str
    }, api.neoscan);

    return response;
  }

  getEndpoint = () => {
    return api.getRPCEndpointFrom({ net: this.network }, api.neoscan);
  }
}
