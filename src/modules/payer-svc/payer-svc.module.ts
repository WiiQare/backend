import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { Patient } from '../patient-svc/entities/patient.entity';
import { PatientSvcModule } from '../patient-svc/patient-svc.module';
import { User } from '../session/entities/user.entity';
import { SessionModule } from '../session/session.module';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { SMSModule } from '../sms/sms.module';
import { Payer } from './entities/payer.entity';
import { PayerSvcController } from './payer-svc.controller';
import { PayerService } from './payer.service';
import { Voucher } from '../smart-contract/entities/voucher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payer, User, Patient, Transaction, Voucher]),
    forwardRef(() => SessionModule),
    MailModule,
    PatientSvcModule,
    SMSModule,
  ],
  controllers: [PayerSvcController],
  providers: [PayerService],
  exports: [PayerService],
})
export class PayerSvcModule {}
