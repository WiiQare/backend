import Stripe from 'stripe';
import { GenericPaymentService } from './payment-svc.module';
import { PaymentService } from './payment-svc.service';

export type GenericPaymentMetadata = {
  senderId: string;
  patientId: string;
  currencyPatientAmount: number;
  currencyPatient: string;
  currencyRate: number;
};
export type GenericPaymentGatewayIntent = {
  id: string;
  amount: number;
  currency: string;
  metadata?: GenericPaymentMetadata;
};
export type GenericPaymentGatewayEvent = {
  type: string;
  data: {
    object: GenericPaymentGatewayIntent;
  };
};

type GenericPaymentGatewayWebhooks = {
  constructEvent: (
    payload: string | Buffer,
    header: string | Buffer | string[],
    secret: string,
  ) => GenericPaymentGatewayEvent;
};
export type GenericPaymentGatewaySignature = {
  webhooks: GenericPaymentGatewayWebhooks;
};

type ConditionalType<T, S> = GenericPaymentService extends PaymentService
  ? S
  : T;

export type PaymentGateway = ConditionalType<
  Stripe,
  GenericPaymentGatewaySignature
>;
export type PaymentGatewayEvent = ConditionalType<
  Stripe.Event,
  GenericPaymentGatewayEvent
>;
export type PaymentGatewayIntent = ConditionalType<
  Stripe.PaymentIntent,
  GenericPaymentGatewayIntent
>;
