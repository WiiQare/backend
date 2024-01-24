import { Injectable } from '@nestjs/common';
import { MessageBirdService } from './messagebird.service';

@Injectable()
export class SmsService {
  //swap messageBirdService with SmsSwapService - platform independence
  constructor(public smsSender: MessageBirdService) {}

  /**
   * This method sends an SMS Invite to friends during registration
   *
   * @param phoneNumbers
   * @param names
   * @param referralCode
   */
  async sendSmsTOFriend(
    phoneNumbers: string[],
    names: string,
    referralCode: string,
  ): Promise<void> {
    const params = {
      originator: 'WiiQare',
      recipients: phoneNumbers,
      body: `Vous avez été invité par ${names} pour rejoindre WiiQare. Merci de vous inscrire avec le lien suivant https://app.wiiqare.com/register?referralCode=${referralCode}`,
    };

    this.smsSender.sendMessage(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });
    return;
  }

  /**
   * This method sends  voucher as an SMS to a patient
   *
   * @param shortenHash
   * @param phoneNumber
   * @param senderName
   * @param amount
   */
  async sendVoucherAsAnSMS(
    shortenHash: string,
    phoneNumber: string,
    senderName: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    const params = {
      originator: 'WiiQare',
      recipients: [phoneNumber],
      body: `
      Vous avez reçu le pass de santé de ${senderName} d'une valeur de ${amount} ${currency} de pass santé WiiQare.
      \n Votre code pass santé et ${shortenHash}. \n\n pour plus d'info contactez : +243 979 544 127
      `,
    };

    this.smsSender.sendMessage(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });
    return;
  }

  /**
   * This method sends transaction verification Token by SMS to a patient
   *
   * @param token
   * @param phoneNumber
   * @param amount
   */
  async sendTransactionVerificationTokenBySmsToAPatient(
    token: string,
    phoneNumber: string,
    amount: number,
  ): Promise<void> {
    const params = {
      originator: 'WiiQare',
      recipients: [phoneNumber],
      body: `Votre code the verification de pass santé WiiQare est ${token}.`,
    };

    this.smsSender.sendMessage(params, function (err, response) {
      if (err) {
        return console.log(err);
      }
      console.log(response);
    });
    return;
  }
}
