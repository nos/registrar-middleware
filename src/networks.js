import { rpc, settings } from '@cityofzion/neon-js';

settings.addNetwork(new rpc.Network({
  name: 'nOSLocal',
  extra: {
    neoscan: 'http://localhost:4000/api/main_net'
  }
}));
