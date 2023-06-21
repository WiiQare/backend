import { Provider } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import Web3 from 'web3';

export const nodeProvider: Provider = {
  provide: 'WEB3',
  useFactory: (appConfigService: AppConfigService) => {
    const uri = appConfigService.blockChainNodeURI;
    return new Web3(uri);
  },
  inject: [AppConfigService],
};
