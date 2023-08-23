import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from 'nestjs-stripe';
import { Transaction } from './entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { SmartContractController } from './smart-contract.controller';
import { nodeProvider } from './smart-contract.providers';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { operationService } from '../operation-saving/operation.service';
import { OperationSaving } from '../operation-saving/entities/operation.entity';
import { Saving } from '../saving/entities/saving.entity';

@Module({
  imports: [
    StripeModule.forRoot({
      // NOTICE: no keys we are using so far only webhooks!
      apiKey: 'my_secret_key',
      apiVersion: '2022-11-15',
    }),
    TypeOrmModule.forFeature([Transaction, OperationSaving, Saving]),
  ],
  controllers: [SmartContractController, PaymentController],
  providers: [SmartContractService, TransactionService, nodeProvider, operationService],
})
export class SmartContractModule {}
