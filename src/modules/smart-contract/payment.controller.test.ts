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
import * as helpers from '../../helpers/common.helper';

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
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn(),
      } as any,
    };

    mockTransactionRepository = {};

    mockTransactionService = {
      getTransactionHistoryBySenderId: jest
        .fn()
        .mockResolvedValue([mockTransaction]),
      getAllTransactionHistory: jest.fn().mockResolvedValue([mockTransaction]),
    };

    mockSmartContractService = {
      mintVoucher: jest.fn(),
    };

    mockAppConfigService = {
      stripeWebHookSecret: 'stripeWebHookSecret',
    };

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

  describe('handlePaymentWebhookEvent', () => {
    // Mock Stripe event
    const mockEvent = {
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'paymentIntent_1',
          amount: 10000, // in cents
          currency: 'usd',
          metadata: {
            senderId: 'sender_1',
            patientId: 'patient_1',
            currencyPatientAmount: 100,
            currencyPatient: 'usd',
            currencyRate: 1,
          },
        },
      },
    } as any;

    // Mock voucher data
    const mockVoucherData = {
      events: {
        mintVoucherEvent: {
          returnValues: {
            0: 'voucher_1',
            1: [
              100,
              'usd',
              'patient_1',
              'hospital_1',
              'patient_1',
              VoucherStatus.UNCLAIMED,
            ],
          },
          transactionHash: 'transactionHash_1',
        },
      },
    };

    // Mock request
    const mockSignature = 'signature';
    const mockRawBodyRequest = {
      rawBody: JSON.stringify(mockEvent) as any,
    } as any;

    it('should handle payment_intent.succeeded event', async () => {
      // Mock functions
      mockStripe.webhooks.constructEvent = jest.fn().mockReturnValue(mockEvent);
      mockSmartContractService.mintVoucher = jest
        .fn()
        .mockResolvedValue(mockVoucherData);
      mockTransactionRepository.create = jest
        .fn()
        .mockImplementation((data) => data);
      mockTransactionRepository.save = jest.fn();

      // Call the method
      await controller.handlePaymentWebhookEvent(
        mockSignature,
        mockEvent,
        mockRawBodyRequest,
      );

      // Check that the mocked functions were called as expected
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRawBodyRequest.rawBody,
        mockSignature,
        mockAppConfigService.stripeWebHookSecret,
      );
      expect(mockSmartContractService.mintVoucher).toHaveBeenCalledWith({
        amount: Math.round(
          mockEvent.data.object.metadata.currencyPatientAmount,
        ),
        ownerId: mockEvent.data.object.metadata.patientId,
        currency: mockEvent.data.object.metadata.currencyPatient,
        patientId: mockEvent.data.object.metadata.patientId,
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        senderAmount: mockEvent.data.object.amount / 100,
        senderCurrency: mockEvent.data.object.currency.toUpperCase(),
        amount: Math.round(
          mockEvent.data.object.metadata.currencyPatientAmount,
        ),
        currency: mockEvent.data.object.metadata.currencyPatient,
        conversionRate: mockEvent.data.object.metadata.currencyRate,
        senderId: mockEvent.data.object.metadata.senderId,
        ownerId: mockEvent.data.object.metadata.patientId,
        stripePaymentId: mockEvent.data.object.id,
        transactionHash:
          mockVoucherData.events.mintVoucherEvent.transactionHash,
        shortenHash:
          mockVoucherData.events.mintVoucherEvent.transactionHash.slice(0, 8),
        voucher: {
          id: mockVoucherData.events.mintVoucherEvent.returnValues[0],
          amount: mockVoucherData.events.mintVoucherEvent.returnValues[1][0],
          currency: mockVoucherData.events.mintVoucherEvent.returnValues[1][1],
          ownerId: mockVoucherData.events.mintVoucherEvent.returnValues[1][2],
          hospitalId:
            mockVoucherData.events.mintVoucherEvent.returnValues[1][3],
          patientId: mockVoucherData.events.mintVoucherEvent.returnValues[1][4],
          status: mockVoucherData.events.mintVoucherEvent.returnValues[1][5],
        },
        status: VoucherStatus.UNCLAIMED,
      });
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should handle payment failed event type', async () => {
      const mockErrorEvent = {
        ...mockEvent,
        type: 'payment_intent.payment_failed',
      };

      // Mock functions
      mockStripe.webhooks.constructEvent = jest
        .fn()
        .mockReturnValue(mockErrorEvent);
      mockSmartContractService.mintVoucher = jest
        .fn()
        .mockResolvedValue(mockVoucherData);
      mockTransactionRepository.create = jest
        .fn()
        .mockImplementation((data) => data);
      mockTransactionRepository.save = jest.fn();

      // Call the method
      await controller.handlePaymentWebhookEvent(
        mockSignature,
        mockErrorEvent,
        mockRawBodyRequest,
      );

      // It should do nothing, since there is no handling yet for this event type
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRawBodyRequest.rawBody,
        mockSignature,
        mockAppConfigService.stripeWebHookSecret,
      );
    });

    it('should handle other event types', async () => {
      const mockSomeEvent = {
        ...mockEvent,
        type: 'some_event',
      };

      // Mock functions
      mockStripe.webhooks.constructEvent = jest
        .fn()
        .mockReturnValue(mockSomeEvent);
      mockSmartContractService.mintVoucher = jest
        .fn()
        .mockResolvedValue(mockVoucherData);
      mockTransactionRepository.create = jest
        .fn()
        .mockImplementation((data) => data);
      mockTransactionRepository.save = jest.fn();

      // Should just call log info helper and display the event type
      const logInfoSpy = jest
        .spyOn(helpers, 'logInfo')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      // Call the method
      await controller.handlePaymentWebhookEvent(
        mockSignature,
        mockSomeEvent,
        mockRawBodyRequest,
      );

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRawBodyRequest.rawBody,
        mockSignature,
        mockAppConfigService.stripeWebHookSecret,
      );

      expect(logInfoSpy).toHaveBeenCalledWith(
        `Unhandled Stripe event type: ${mockSomeEvent.type}`,
      );
    });

    it('should handle error thrown by stripe', async () => {
      // Mock functions
      mockStripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
        throw new Error('Some error');
      });

      // Should just call log error helper and display the error message
      const logErrorSpy = jest
        .spyOn(helpers, 'logError')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      // Call the method
      const response = await controller.handlePaymentWebhookEvent(
        mockSignature,
        mockEvent,
        mockRawBodyRequest,
      );

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRawBodyRequest.rawBody,
        mockSignature,
        mockAppConfigService.stripeWebHookSecret,
      );

      expect(logErrorSpy).toHaveBeenCalledWith(
        'Error processing webhook event: Error: Some error',
      );
      expect(response).toEqual({
        error: 'Failed to process webhook event : ' + 'Error: Some error',
      });
    });
  });

  describe('retrieveVoucherByPaymentId', () => {});
});
