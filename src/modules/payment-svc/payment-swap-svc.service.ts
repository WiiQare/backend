import { Injectable } from '@nestjs/common';

import {
  GenericPaymentGatewayEvent,
  GenericPaymentGatewayIntent,
  PaymentGatewayEvent,
} from './payment-svc.types';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentSwapService {
  constructEvent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: string | Buffer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    header: string | Buffer | string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    secret: string,
  ): GenericPaymentGatewayEvent {
    return {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: randomUUID(),
          amount: 0,
          currency: '',
          metadata: {
            senderId: randomUUID(),
            patientId: randomUUID(),
            currencyPatientAmount: 100,
            currencyPatient: 'CDF',
            currencyRate: 1.0,
          },
        },
      },
    };
  }

  getVerifiedEventData(verifiedEvent: GenericPaymentGatewayEvent) {
    return verifiedEvent.data.object as GenericPaymentGatewayIntent;
  }
}
