import { Test, TestingModule } from '@nestjs/testing';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { nodeProvider } from './smart-contract.providers';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AppConfigService } from '../../config/app-config.service';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';

describe('SmartContractService', () => {
  let smartContractService: SmartContractService;
  let transactionService: TransactionService;
  let appConfigService: AppConfigService;
  let web3Mock: Web3;
  let mockWiiqareContract: Contract;
  let mockWiiQareAccount: Account;

  beforeEach(async () => {
    const nodeProviderMock = {
      provide: 'WEB3',
      useFactory: () => {
        return {
          eth: {
            getGasPrice: jest.fn(),
            Contract: jest.fn(),
            accounts: {
              privateKeyToAccount: jest.fn().mockReturnValue({}),
            },
          },
        };
      },
    } as unknown as typeof nodeProvider;

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SmartContractService,
        TransactionService,
        {
          provide: AppConfigService,
          useValue: {},
        },
        nodeProviderMock,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {},
        },
      ],
    }).compile();

    smartContractService =
      moduleRef.get<SmartContractService>(SmartContractService);
    transactionService = moduleRef.get<TransactionService>(TransactionService);
    appConfigService = moduleRef.get<AppConfigService>(AppConfigService);

    mockWiiqareContract = {} as Contract;
    mockWiiQareAccount = {} as Account;
  });

  describe('getGasFees', () => {
    it('should return gas fees', async () => {
      const gasFees = { gasPrice: 1, safeLow: 1, standard: 1, fast: 1 };
      jest.spyOn(global, 'fetch').mockImplementation(
        () =>
          Promise.resolve({
            json: () => Promise.resolve(gasFees),
          }) as any,
      );
      const result = await smartContractService.getGasFees();
      expect(result).toEqual(gasFees);
    });
  });
});
