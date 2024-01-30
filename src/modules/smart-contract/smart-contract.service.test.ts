import { SmartContractService } from './smart-contract.service';
import { AppConfigService } from '../../config/app-config.service';
import Web3 from 'web3';
import { MintVoucherDto } from './dto/mint-voucher.dto';
import * as helpers from '../../helpers/common.helper';

describe('SmartContractService', () => {
  // Mock services
  const mockAppConfigService = {
    smartContractPrivateKey:
      'ace605d1f393b26d8e8102e8afdb7effeb62f1fd06511f0cfd87de0eb63a14cf',
    smartContractAddress: '0xf458ea479a44ab833bc2c5750d7e2cd647ca9f24',
  } as unknown as AppConfigService;

  const mockWeb3 = {
    eth: {
      getGasPrice: jest.fn(),
      getAccounts: jest
        .fn()
        .mockResolvedValue(['0x6e7070007a71217974c13DD2e575E693a9962B21']),
      Contract: jest.fn().mockReturnValue({
        methods: {},
      }),
      accounts: {
        privateKeyToAccount: jest.fn().mockReturnValue({
          address: '0x6e7070007a71217974c13DD2e575E693a9962B21',
        }),
        wallet: {
          add: jest.fn().mockReturnValue({
            address: '0x6e7070007a71217974c13DD2e575E693a9962B21',
          }),
        },
      },
    },
  } as unknown as Web3;

  let smartContractService: SmartContractService;

  // Constants
  const gasFees = { gasPrice: 1, safeLow: 1, standard: 1, fast: 1 };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset contract methods before each test
    mockWeb3.eth.Contract = jest.fn().mockImplementation(() => ({
      methods: {
        mintVoucher: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue({
            transactionHash: '0x123',
          }),
        }),
        vouchers: jest.fn().mockImplementation(() => {
          return {
            call: jest.fn().mockResolvedValue({
              owner: '0x123',
              patient: '0x456',
              amount: 1,
              currency: 'USD',
              status: 1,
              createdAt: 1234567890,
              updatedAt: 1234567890,
            }),
          };
        }),
        getAllVouchers: jest.fn().mockImplementation(() => {
          return {
            call: jest.fn().mockResolvedValue([
              {
                owner: '0x123',
                patient: '0x456',
                amount: 1,
                currency: 'USD',
                status: 1,
                createdAt: 1234567890,
                updatedAt: 1234567890,
              },
              {
                owner: '0x123',
                patient: '0x456',
                amount: 1,
                currency: 'USD',
                status: 1,
                createdAt: 1234567890,
                updatedAt: 1234567890,
              },
            ]),
          };
        }),
        transferVoucher: jest.fn().mockImplementation(() => {
          return {
            call: jest.fn().mockResolvedValue({
              transactionHash: '0x123',
            }),
          };
        }),
        alterVoucher: jest.fn().mockImplementation(() => {
          return {
            call: jest.fn().mockResolvedValue({
              transactionHash: '0x123',
            }),
          };
        }),
      },
    }));

    smartContractService = new SmartContractService(
      mockAppConfigService,
      mockWeb3,
    );

    // This is to silence the console.error output from the logError helper
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(helpers, 'logError').mockImplementation(() => { });
  });

  describe('getGasFees', () => {
    it('should return gas fees', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(
        () =>
          Promise.resolve({
            json: () => Promise.resolve(gasFees),
          }) as any,
      );
      // const result = await smartContractService.getGasFees();
      // expect(result).toEqual(gasFees);
    });
  });

  describe('mintVoucher', () => {
    const mintVoucherDto: MintVoucherDto = {
      amount: 1,
      currency: 'USD',
      ownerId: '0x123',
      patientId: '0x456',
    };

    it('should mint a voucher', async () => {
      // Silence the console output from the logInfo helper
      const logInfoSpy = jest.spyOn(helpers, 'logInfo');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      logInfoSpy.mockImplementation(() => { });

      // smartContractService.getGasFees = jest.fn().mockResolvedValue(gasFees);

      const response = await smartContractService.mintVoucher(mintVoucherDto);

      // expect(smartContractService.getGasFees).toBeCalledTimes(1);
      expect(response).toEqual({
        transactionHash: '0x123',
      });

      logInfoSpy.mockRestore();
    });

    it('should throw an error if the contract method throws an error', async () => {
      mockWeb3.eth.Contract = jest.fn().mockImplementation(() => {
        return {
          methods: {
            mintVoucher: jest.fn().mockReturnValue({
              send: jest.fn().mockRejectedValue(new Error('Contract Error')),
            }),
          },
        };
      });

      smartContractService = new SmartContractService(
        mockAppConfigService,
        mockWeb3,
      );

      const logErrorSpy = jest.spyOn(helpers, 'logError');

      await smartContractService.mintVoucher(mintVoucherDto);

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error in mintVoucher: Error: Contract Error',
      );

      logErrorSpy.mockRestore();
    });
  });

  describe('getVoucherById', () => {
    const voucherId = 'someVoucherId';

    it('should return voucher information', async () => {
      const response = await smartContractService.getVoucherById(voucherId);

      expect(mockWeb3.eth.Contract).toBeCalledTimes(1);
      expect(response).toEqual({
        owner: '0x123',
        patient: '0x456',
        amount: 1,
        currency: 'USD',
        status: 1,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      });
    });

    it('should throw an error if the contract method throws an error', async () => {
      mockWeb3.eth.Contract = jest.fn().mockImplementation(() => {
        return {
          methods: {
            vouchers: jest.fn().mockReturnValue({
              call: jest.fn().mockRejectedValue(new Error('Contract Error')),
            }),
          },
        };
      });

      smartContractService = new SmartContractService(
        mockAppConfigService,
        mockWeb3,
      );

      const logErrorSpy = jest.spyOn(helpers, 'logError');

      await smartContractService.getVoucherById(voucherId);

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error in getVoucher: Error: Contract Error',
      );

      logErrorSpy.mockRestore();
    });
  });

  describe('getAllVouchers', () => {
    it('should return all vouchers', async () => {
      const response = await smartContractService.getAllVouchers('0x123');

      expect(mockWeb3.eth.Contract).toBeCalledTimes(1);
      expect(response).toEqual([
        {
          owner: '0x123',
          patient: '0x456',
          amount: 1,
          currency: 'USD',
          status: 1,
          createdAt: 1234567890,
          updatedAt: 1234567890,
        },
        {
          owner: '0x123',
          patient: '0x456',
          amount: 1,
          currency: 'USD',
          status: 1,
          createdAt: 1234567890,
          updatedAt: 1234567890,
        },
      ]);
    });

    it('should throw an error if the contract method throws an error', async () => {
      mockWeb3.eth.Contract = jest.fn().mockImplementation(() => {
        return {
          methods: {
            getAllVouchers: jest.fn().mockReturnValue({
              call: jest.fn().mockRejectedValue(new Error('Contract Error')),
            }),
          },
        };
      });

      smartContractService = new SmartContractService(
        mockAppConfigService,
        mockWeb3,
      );

      const logErrorSpy = jest.spyOn(helpers, 'logError');

      await smartContractService.getAllVouchers('0x123');

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error in getVoucher: Error: Contract Error',
      );

      logErrorSpy.mockRestore();
    });
  });

  describe('transferVoucher', () => {
    it('should transfer a voucher', async () => {
      const result = await smartContractService.transferVoucher(
        '0x123',
        '0x456',
      );

      expect(mockWeb3.eth.getAccounts).toBeCalledTimes(1);
      expect(mockWeb3.eth.Contract).toBeCalledTimes(1);

      expect(result).toEqual({
        transactionHash: '0x123',
      });
    });

    it('should throw an error if the contract method throws an error', async () => {
      mockWeb3.eth.Contract = jest.fn().mockImplementation(() => {
        return {
          methods: {
            transferVoucher: jest.fn().mockReturnValue({
              call: jest.fn().mockRejectedValue(new Error('Contract Error')),
            }),
          },
        };
      });

      smartContractService = new SmartContractService(
        mockAppConfigService,
        mockWeb3,
      );

      const logErrorSpy = jest.spyOn(helpers, 'logError');

      await smartContractService.transferVoucher('0x123', '0x456');

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error in getVoucher: Error: Contract Error',
      );

      logErrorSpy.mockRestore();
    });
  });

  describe('alterVoucher', () => {
    it('should alter a voucher', async () => {
      const result = await smartContractService.alterVoucher('0x123', '0x456');

      expect(mockWeb3.eth.accounts.wallet.add).toBeCalledTimes(1);
      expect(mockWeb3.eth.Contract).toBeCalledTimes(1);

      expect(result).toEqual({
        transactionHash: '0x123',
      });
    });

    it('should throw an error if the contract method throws an error', async () => {
      mockWeb3.eth.Contract = jest.fn().mockImplementation(() => {
        return {
          methods: {
            alterVoucher: jest.fn().mockReturnValue({
              call: jest.fn().mockRejectedValue(new Error('Contract Error')),
            }),
          },
        };
      });

      smartContractService = new SmartContractService(
        mockAppConfigService,
        mockWeb3,
      );

      const logErrorSpy = jest.spyOn(helpers, 'logError');

      await smartContractService.alterVoucher('0x123', '0x456');

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error in getVoucher: Error: Contract Error',
      );

      logErrorSpy.mockRestore();
    });
  });
});
