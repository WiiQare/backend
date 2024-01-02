import Stripe from 'stripe';

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

//change this to true to enable stripe completion
type useStripe = true;

type ConditionalType<T, S> = useStripe extends null ? S : T;

export type PaymentGateway = ConditionalType<
  Stripe,
  GenericPaymentGatewaySignature
>;
export type PaymentGatewayEvent = ConditionalType<
  Stripe.Event,
  GenericPaymentGatewayEvent
>;
