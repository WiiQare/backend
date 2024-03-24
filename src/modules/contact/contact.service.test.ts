import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { ContactService } from './contact.service';
import { MailService } from '../mail/mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('ContactService', () => {
  let service: ContactService;
  let contactRepository: Repository<Contact>;
  let mailService: MailService;
  let mailerService: MailerService;
  const mockContact: Contact = {
    fullname: 'test name',
    email: 'test@gg.com',
    object: 'no',
    message: 'not much to say',
    id: 'ca415c08-1bf1-4b67-b9d4-a2838fcd671b',
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    contactRepository = {
      create: jest.fn().mockReturnValue(mockContact),
      save: jest.fn().mockReturnValue(mockContact),
      findOne: jest.fn().mockReturnValue(mockContact),
      createQueryBuilder: jest.fn().mockReturnValue({}),
    } as unknown as Repository<Contact>;

    service = new ContactService(contactRepository, mailService);
    mailService = new MailService(mailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('mail service should be defined', () => {
    expect(mailService).toBeDefined();
  });
  // it('add a new contact', async () => {
  //   const result = await service.add(mockContact);
  //   expect(result).toEqual(mockContact);
  // });
});
