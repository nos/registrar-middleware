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

  register = async (ownerScriptHash, domain, target) => {
    return rpc.Query.invoke(
      this.scriptHash,
      string('register'),
      byteArray(reverseHex(this.scriptHash)),
      string(domain),
      byteArray(reverseHex(ownerScriptHash)),
      string(target)
    ).execute(await this.getEndpoint());
  }

  update = async (domain, target) => {
    return rpc.Query.invoke(
      this.scriptHash,
      string('update'),
      byteArray(reverseHex(this.scriptHash)),
      string(domain),
      string(target)
    ).execute(await this.getEndpoint());
  }

  delete = async (domain) => {
    return rpc.Query.invoke(
      this.scriptHash,
      string('delete'),
      byteArray(reverseHex(this.scriptHash)),
      string(domain)
    ).execute(await this.getEndpoint());
  }

  getEndpoint = () => {
    return api.getRPCEndpointFrom({ net: this.network }, api.neoscan);
  }
}
