import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  it('should be defined', () => {
    const mailerService: MailerService = {} as MailerService;
    const service = new MailService(mailerService);
    expect(service).toBeDefined();
  });
});
