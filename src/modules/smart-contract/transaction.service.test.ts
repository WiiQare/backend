import { TransactionService } from './transaction.service';
import { AppConfigService } from 'src/config/app-config.service';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { UserType, VoucherStatus } from '../../common/constants/enums';

describe('TransactionService', () => {
  // Mock transaction service
  let service: TransactionService;

  // Mock services
  const mockAppConfigService = {} as unknown as AppConfigService;

  // Mock entities
  const mockTransaction1: Transaction = {
    id: 'id',
    createdAt: new Date('2023-06-20T10:00:00Z'),
    updatedAt: new Date('2023-06-20T10:01:00Z'),
    senderId: '216fefae-c968-4f2a-b5a3-40eb621e2e71',
    ownerId: '7a11095d-ec42-4f9a-9fb1-3261b047c524',
    senderAmount: 1,
    senderCurrency: 'USD',
    amount: 1,
    conversionRate: 1,
    currency: 'FC',
    ownerType: UserType.PATIENT,
    status: VoucherStatus.UNCLAIMED,
    transactionHash: 'transactionHash1',
    shortenHash: 'shortenHash1',
    stripePaymentId: 'stripePaymentId1',
    voucher: { voucher: 'voucher1' },
  };

  const mockTransaction2: Transaction = {
    id: 'id',
    createdAt: new Date('2023-06-19T10:00:00Z'),
    updatedAt: new Date('2023-06-19T10:01:00Z'),
    senderId: 'e4c30d3f-4c89-4a65-b83c-5db9821e6a81',
    ownerId: '9b48d780-74b5-4e26-89f9-eb89f4d3b0e7',
    senderAmount: 1,
    senderCurrency: 'USD',
    amount: 1,
    conversionRate: 1,
    currency: 'FC',
    ownerType: UserType.PATIENT,
    status: VoucherStatus.UNCLAIMED,
    transactionHash: 'transactionHash2',
    shortenHash: 'shortenHash2',
    stripePaymentId: 'stripePaymentId2',
    voucher: { voucher: 'voucher2' },
  };

  // Mock repositories
  let mockTransactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock repositories
    mockTransactionRepository = {
      find: jest.fn().mockResolvedValue([mockTransaction1, mockTransaction2]),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndMapOne: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTransaction1]),
      }),
    } as unknown as Repository<Transaction>;

    // Initialize mock transaction service
    service = new TransactionService(
      mockAppConfigService,
      mockTransactionRepository,
    );
  });

  describe('getAllTransactionHistory', () => {
    it('should return all transaction history', async () => {
      const result = await service.getAllTransactionHistory();

      expect(mockTransactionRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockTransaction1, mockTransaction2]);
    });

    it('should return null if no transaction history found', async () => {
      jest.spyOn(mockTransactionRepository, 'find').mockResolvedValueOnce(null);

      const result = await service.getAllTransactionHistory();

      expect(mockTransactionRepository.find).toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });

  describe('getTransactionHistoryBySenderId', () => {
    it('should return transaction history by sender id', async () => {
      const result = await service.getTransactionHistoryBySenderId(
        '216fefae-c968-4f2a-b5a3-40eb621e2e71',
      );

      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([mockTransaction1]);
    });

    it('should return null if no transaction history found', async () => {
      jest
        .spyOn(mockTransactionRepository, 'createQueryBuilder')
        .mockReturnValueOnce({
          leftJoinAndMapOne: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(null),
        } as any);

      const result = await service.getTransactionHistoryBySenderId(
        'someSenderId',
      );

      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(null);
    });
  });
});
