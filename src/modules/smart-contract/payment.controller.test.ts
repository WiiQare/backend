import { PaymentController } from './payment.controller';
import { Stripe } from 'stripe';
import { Transaction } from './entities/transaction.entity';
import { AppConfigService } from 'src/config/app-config.service';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { Repository } from 'typeorm';

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockStripe: Partial<Stripe>;
  let mockAppConfigService: Partial<AppConfigService>;
  let mockSmartContractService: Partial<SmartContractService>;
  let mockTransactionRepository: Partial<Repository<Transaction>>;
  let mockTransactionService: Partial<TransactionService>;

  beforeEach(() => {
    // Mock dependencies
    mockStripe = {};

    mockTransactionRepository = {};

    mockTransactionService = {};

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

  describe('getPaymentHistory', () => {});

  describe('handlePaymentWebhookEvent', () => {});

  describe('retrieveVoucherByPaymentId', () => {});
});
