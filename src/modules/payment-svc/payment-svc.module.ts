import { Module } from '@nestjs/common';
import { PaymentService } from './payment-svc.service';
import { StripeModule } from 'nestjs-stripe';

@Module({
  imports: [
    StripeModule.forRoot({
      // NOTICE: no keys we are using so far only webhooks!
      apiKey: 'my_secret_key',
      apiVersion: '2022-11-15',
    }),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentSvcModule {}
