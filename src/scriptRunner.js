import { sc, u, rpc, api } from '@cityofzion/neon-js';

const { string, byteArray } = sc.ContractParam;

function reverseHex(scriptHash) {
  return u.reverseHex(scriptHash && scriptHash.replace(/^0x/, ''));
}

export default class ScriptRunner {
  constructor({ network = 'TestNet', address, scriptHash } = {}) {
    this.network = network;
    this.address = address;
    this.scriptHash = scriptHash;
  }

  register = (ownerScriptHash, domain, target) => {
    return this.execute('register', [
      byteArray(reverseHex(this.scriptHash)),
      string(domain),
      byteArray(reverseHex(ownerScriptHash)),
      string(target)
    ]);
  }

  update = (domain, target) => {
    return this.execute('update', [
      byteArray(reverseHex(this.scriptHash)),
      string(domain),
      string(target)
    ]);
  }

  delete = (domain) => {
    return this.execute('delete', [
      byteArray(reverseHex(this.scriptHash)),
      string(domain)
    ]);
  }

  execute = async (operation, args = []) => {
    return rpc.Query.invoke(
      this.scriptHash,
      string(operation),
      ...args
    ).execute(await this.getEndpoint());
  }

  getEndpoint = () => {
    return api.getRPCEndpointFrom({ net: this.network }, api.neoscan);
  }
}
