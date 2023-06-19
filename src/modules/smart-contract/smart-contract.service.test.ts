import { Test } from '@nestjs/testing';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { AppConfigService } from '../../config/app-config.service';
import { AbiItem } from 'web3-utils';

import abi from './abi/abi.json';

import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';

describe('SmartContractService', () => {
  let smartContractService: SmartContractService;
  let transactionService: TransactionService;
  let appConfigService: AppConfigService;
  let web3: Web3;
  let mockWiiqareContract: Contract;
  let mockWiiQareAccount: Account;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SmartContractService,
        TransactionService,
        AppConfigService,
        { provide: 'WEB3', useValue: web3 },
      ],
    }).compile();
    smartContractService =
      moduleRef.get<SmartContractService>(SmartContractService);
    transactionService = moduleRef.get<TransactionService>(TransactionService);
    appConfigService = moduleRef.get<AppConfigService>(AppConfigService);

    web3 = moduleRef.get<Web3>('WEB3');
    mockWiiqareContract = {} as Contract;
    mockWiiQareAccount = {} as Account;
  });
});
