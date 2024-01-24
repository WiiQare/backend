import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { SmartContractController } from './smart-contract.controller';
import { nodeProvider } from './smart-contract.providers';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { Voucher } from './entities/voucher.entity';
import { OperationSaving } from '../operation-saving/entities/operation.entity';
import { Saving } from '../saving/entities/saving.entity';
import { operationService } from '../operation-saving/operation.service';
import { PaymentService } from '../payment-svc/payment-svc.service';
import { GenericPaymentService } from '../payment-svc/payment-svc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Voucher, OperationSaving, Saving]),
  ],
  controllers: [SmartContractController, PaymentController],
  providers: [
    PaymentService,
    SmartContractService,
    TransactionService,
    nodeProvider,
    GenericPaymentService,
  ],
  exports: [SmartContractService],
})
export class SmartContractModule {}
