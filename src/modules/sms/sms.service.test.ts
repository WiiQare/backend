import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '../../config/app-config.service';
import { EnvironmentVariables } from '../../config/dto/environment-variables.dto';
import { SmsService } from './sms.service';

describe('AppConfigService', () => {
  let service: SmsService;
  beforeEach(async () => {
    const appConfigService = new AppConfigService(
      new ConfigService<EnvironmentVariables>({
        SMS_API_KEY: 'key',
      }),
    );
    service = new SmsService(appConfigService);
    console.log = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.messageBird).toBeDefined();
  });

  it('should send an SMS', async () => {
    const params = {
      originator: 'WiiQare',
      recipients: ['+243979544127'],
      body: `Vous avez été invité par ${'names'} pour rejoindre WiiQare. Merci de vous inscrire avec le lien suivant https://wiiqare-app.com/register?referralCode=${'referralCode'}`,
    };
    const messageBird = {
      messages: {
        create: jest.fn().mockImplementation((params, callback) => {
          callback(null, {});
        }),
      },
    };
    service.messageBird = messageBird as any;
    const result = await service.sendSmsTOFriend(
      ['+243979544127'],
      'names',
      'referralCode',
    );
    expect(result).toBeUndefined();
    expect(messageBird.messages.create).toHaveBeenCalledWith(
      params,
      expect.any(Function),
    );
  });

  it('should send a voucher as an SMS', async () => {
    const params = {
      originator: 'WiiQare',
      recipients: ['+243979544127'],
      body: `
      Vous avez reçu le pass de santé de ${'senderName'} d'une valeur de 100 USD de pass santé WiiQare.
      \n Votre code pass santé et ${'shortenHash'}. \n\n pour plus d'info contactez : +243 979 544 127
      `,
    };
    const messageBird = {
      messages: {
        create: jest.fn().mockImplementation((params, callback) => {
          callback(null, {});
        }),
      },
    };
    service.messageBird = messageBird as any;
    const result = await service.sendVoucherAsAnSMS(
      'shortenHash',
      '+243979544127',
      'senderName',
      100,
      'USD',
    );
    expect(result).toBeUndefined();
    expect(messageBird.messages.create).toHaveBeenCalledWith(
      params,
      expect.any(Function),
    );
  });

  it('should send transaction verification token as an SMS', async () => {
    const token = '123456';
    const params = {
      originator: 'WiiQare',
      recipients: ['+243979544127'],
      body: `Votre code the verification de pass santé WiiQare est ${token}.`,
    };
    const messageBird = {
      messages: {
        create: jest.fn().mockImplementation((params, callback) => {
          callback(null, {});
        }),
      },
    };
    service.messageBird = messageBird as any;
    const result =
      await service.sendTransactionVerificationTokenBySmsToAPatient(
        token,
        '+243979544127',
        100,
      );
    expect(result).toBeUndefined();
    expect(messageBird.messages.create).toHaveBeenCalledWith(
      params,
      expect.any(Function),
    );
  });
});
