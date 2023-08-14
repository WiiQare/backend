import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionsFilter } from './common/filters/global-exception.filter';
import { JWTAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { TypeOrmConfigService } from './db/typeorm-config.service';
import { AdministrationSvcModule } from './modules/administration-svc/adminstration-svc.module';
import { CachingModule } from './modules/caching/caching.module';
import { MailModule } from './modules/mail/mail.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ObjectStorageModule } from './modules/object-storage/object-storage.module';
import { PatientSvcModule } from './modules/patient-svc/patient-svc.module';
import { PayerSvcModule } from './modules/payer-svc/payer-svc.module';
import { ProviderSvcModule } from './modules/provider-svc/provider-svc.module';
import { SessionModule } from './modules/session/session.module';
import { SmartContractModule } from './modules/smart-contract/smart-contract.module';
import { SMSModule } from './modules/sms/sms.module';
import { SavingModule } from './modules/saving/saving.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
      extraProviders: [ConfigService, AppConfigService],
    }),
    CachingModule,
    MailModule,
    AuthModule,
    SessionModule,
    AdministrationSvcModule,
    PatientSvcModule,
    PayerSvcModule,
    SavingModule,
    ProviderSvcModule,
    CommonModule,
    SmartContractModule,
    MessagingModule,
    SMSModule,
    ObjectStorageModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
    { provide: APP_GUARD, useClass: JWTAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
