import { SmartContractService } from './smart-contract.service';
import { AppConfigService } from '../../config/app-config.service';
import Web3 from 'web3';
import { MintVoucherDto } from './dto/mint-voucher.dto';
import * as helpers from '../../helpers/common.helper';

describe('SmartContractService', () => {
  // Mock services
  const mockAppConfigService = {
    smartContractPrivateKey:
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    smartContractAddress: '0xabcdef0123456789abcdef0123456789abcdef01234567',
  } as unknown as AppConfigService;

  const mockWeb3 = {
    eth: {
      getGasPrice: jest.fn(),
      Contract: jest.fn().mockReturnValue({
        methods: {
          mintVoucher: jest.fn().mockReturnValue({
            send: jest.fn().mockResolvedValue({
              transactionHash: '0x123',
            }),
          }),
          vouchers: jest.fn().mockReturnValue({
            call: jest.fn().mockResolvedValue({
              owner: '0x123',
              patient: '0x456',
              amount: 1,
              currency: 'USD',
              status: 1,
              createdAt: 1234567890,
              updatedAt: 1234567890,
            }),
          }),
        },
      }),
      accounts: {
        privateKeyToAccount: jest.fn().mockReturnValue({
          address: '0x1234567890abcdef1234567890abcdef12345678',
        }),
        wallet: {
          add: jest.fn(),
        },
      },
    },
    Contract: jest.fn().mockReturnValue({
      methods: {
        mintVoucher: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue({
            transactionHash: '0x123',
          }),
        }),
      },
    }),
  } as unknown as Web3;

  let smartContractService: SmartContractService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Initialize smartContractService
    smartContractService = new SmartContractService(
      mockAppConfigService,
      mockWeb3,
    );
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

  describe('mintVoucher', () => {
    const mintVoucherDto: MintVoucherDto = {
      amount: 1,
      currency: 'USD',
      ownerId: '0x123',
      patientId: '0x456',
    };

    it('should mint a voucher', async () => {
      const gasFees = { gasPrice: 1, safeLow: 1, standard: 1, fast: 1 };

      smartContractService.getGasFees = jest.fn().mockResolvedValue(gasFees);

      const response = await smartContractService.mintVoucher(mintVoucherDto);

      expect(smartContractService.getGasFees).toBeCalledTimes(1);
      expect(response).toEqual({
        transactionHash: '0x123',
      });
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
      // The implementation of this method is still in progress, so this
      // test is just a placeholder for now.
      await smartContractService.getVoucherById(voucherId);

      expect(mockWeb3.eth.Contract).toBeCalledTimes(1);
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
});
