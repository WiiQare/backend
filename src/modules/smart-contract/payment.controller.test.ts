import { PaymentController } from './payment.controller';
import { Stripe } from 'stripe';
import { Transaction } from './entities/transaction.entity';
import { AppConfigService } from 'src/config/app-config.service';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { Repository } from 'typeorm';
import {
  UserRole,
  UserStatus,
  UserType,
  VoucherStatus,
} from '../../common/constants/enums';

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockStripe: Partial<Stripe>;
  let mockAppConfigService: Partial<AppConfigService>;
  let mockSmartContractService: Partial<SmartContractService>;
  let mockTransactionRepository: Partial<Repository<Transaction>>;
  let mockTransactionService: Partial<TransactionService>;

  const mockTransaction: Transaction = {
    id: 'txId',
    createdAt: new Date(),
    updatedAt: new Date(),
    senderId: '1',
    ownerId: '1',
    amount: 100,
    currency: 'USD',
    senderAmount: 100,
    senderCurrency: 'FD',
    conversionRate: 1,
    transactionHash: 'txHash',
    shortenHash: 'shortenHash',
    ownerType: UserType.PAYER,
    status: VoucherStatus.PENDING,
    stripePaymentId: 'stripePaymentId',
    voucher: { id: '1' },
  };

  const mockJwtClaimsDTO = {
    sub: 'uuid',
    type: UserRole.PAYER,
    phoneNumber: '1234567890',
    names: 'John Doe',
    status: UserStatus.ACTIVE,
  };

  beforeEach(() => {
    // Mock dependencies
    mockStripe = {};

    mockTransactionRepository = {};

    mockTransactionService = {
      getTransactionHistoryBySenderId: jest
        .fn()
        .mockResolvedValue([mockTransaction]),
      getAllTransactionHistory: jest.fn().mockResolvedValue([mockTransaction]),
    };

    mockSmartContractService = {};

    mockAppConfigService = {};

    // Instantiate the controller with the mocks
    controller = new PaymentController(
      mockStripe as Stripe,
      mockAppConfigService as AppConfigService,
      mockSmartContractService as SmartContractService,
      mockTransactionRepository as Repository<Transaction>,
      mockTransactionService as TransactionService,
    );
  });

  describe('getPaymentHistory', () => {
    it('should return all transactions for a payer', async () => {
      const result = await controller.getPaymentHistory(mockJwtClaimsDTO);
      expect(
        mockTransactionService.getTransactionHistoryBySenderId,
      ).toBeCalledWith(mockJwtClaimsDTO.sub);
      expect(result).toEqual([mockTransaction]);
    });

    it('should return the transaction history for a manager/admin', async () => {
      const mockAdminJwtClaimsDTO = {
        ...mockJwtClaimsDTO,
        type: UserRole.WIIQARE_ADMIN,
      };

      const result = await controller.getPaymentHistory(mockAdminJwtClaimsDTO);
      expect(mockTransactionService.getAllTransactionHistory).toBeCalled();
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('handlePaymentWebhookEvent', () => {});

  describe('retrieveVoucherByPaymentId', () => {});
});
