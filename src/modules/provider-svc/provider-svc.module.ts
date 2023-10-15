import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { ObjectStorageModule } from '../object-storage/object-storage.module';
import { Patient } from '../patient-svc/entities/patient.entity';
import { User } from '../session/entities/user.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { SMSModule } from '../sms/sms.module';
import { Package } from './entities/package.entity';
import { Provider } from './entities/provider.entity';
import { Service } from './entities/service.entity';
import { ProviderController } from './provider-svc.controller';
import { ProviderService } from './provider-svc.service';
import { Voucher } from '../smart-contract/entities/voucher.entity';
import { SmartContractService } from '../smart-contract/smart-contract.service';
import { SmartContractModule } from '../smart-contract/smart-contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      User,
      Transaction,
      Patient,
      Package,
      Service,
      Voucher,
    ]),
    ObjectStorageModule,
    MailModule,
    SMSModule,
    SmartContractModule
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderSvcModule {}
