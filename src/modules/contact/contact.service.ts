import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { _404 } from '../../common/constants/errors';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private readonly mailService: MailService,

  ) {}

  async add(contact: CreateContactDto): Promise<Contact> {
    
    const newWaiting = this.contactRepository.create({
      fullname: contact.fullname,
      email: contact.email,
      object: contact.object,
      message: contact.message
    });

    const contactSave = this.contactRepository.save(newWaiting);

    await this.mailService.receiveMailToWiiqare(
        contact.email, 
        contact.fullname, 
        contact.object, 
        contact.message
      );

    return contactSave
  }

}
