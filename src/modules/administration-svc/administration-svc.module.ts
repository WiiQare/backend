import { Module } from '@nestjs/common';

import { Payer } from '../payer-svc/entities/payer.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../session/entities/user.entity';

import { PayerService } from './payer/payer.service';
import { PayerController } from './payer/payer.controller';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { PaymentService } from './payment/payment.service';
import { PaymentController } from './payment/payment.controller';
import { BeneficiaryService } from './beneficiary/beneficiary.service';
import { BeneficiaryController } from './beneficiary/beneficiary.controller';
import { Patient } from '../patient-svc/entities/patient.entity';
import { Provider } from '../provider-svc/entities/provider.entity';
import { ProviderController } from './provider/provider.controller';
import { VoucherController } from './voucher/voucher.controller';
import { VoucherService } from './voucher/voucher.service';
import { ProviderService } from './provider/provider.service';
import { ChartsService } from './charts/charts.service';
import { ChartsController } from './charts/charts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payer, Transaction, User, Patient, Provider]),
  ],
  providers: [
    PayerService,
    AdminService,
    BeneficiaryService,
    PaymentService,
    VoucherService,
    ProviderService,
    ChartsService,
  ],
  controllers: [
    PayerController,
    AdminController,
    BeneficiaryController,
    PaymentController,
    ProviderController,
    VoucherController,
    ChartsController,
  ],
})
export class AdministrationSvcModule {}
