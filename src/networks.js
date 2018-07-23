import { rpc, settings } from '@cityofzion/neon-js';

settings.addNetwork(new rpc.Network({
  name: 'nOSLocal',
  extra: {
    neoscan: 'http://localhost:4000/api/main_net'
  }
}));

settings.addNetwork(new rpc.Network({
  name: 'nOSNet',
  extra: {
    neoscan: 'http://neoscan-testnet.nos.io:4000/api/main_net'
  }
}));
