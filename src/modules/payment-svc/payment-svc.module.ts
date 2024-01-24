import { Module } from '@nestjs/common';
import { StripeModule } from 'nestjs-stripe';
// import { PaymentSwapService } from './payment-swap-svc.service';
import { PaymentService } from './payment-svc.service';

export class GenericPaymentService extends PaymentService {}

@Module({
  imports: [
    StripeModule.forRoot({
      // NOTICE: no keys we are using so far only webhooks!
      apiKey: 'my_secret_key',
      apiVersion: '2022-11-15',
    }),
  ],
  providers: [GenericPaymentService],
  exports: [GenericPaymentService],
})
export class PaymentSvcModule {}
