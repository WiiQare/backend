import { Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import {
  GenericPaymentGatewayIntent,
  PaymentGateway,
  PaymentGatewayEvent,
} from './payment-svc.types';

@Injectable()
export class PaymentService {
  constructor(@InjectStripe() private readonly payg: PaymentGateway) {}

  constructEvent(
    payload: string | Buffer,
    header: string | Buffer | string[],
    secret: string,
  ): PaymentGatewayEvent {
    return this.payg.webhooks.constructEvent(payload, header, secret);
  }

  getVerifiedEventData(
    verifiedEvent: PaymentGatewayEvent,
  ): GenericPaymentGatewayIntent {
    return verifiedEvent.data.object as GenericPaymentGatewayIntent;
  }
}
