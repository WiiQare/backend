import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { _404 } from '../../common/constants/errors';
import { WaitingList } from './entities/waiting.entity';
import { CreateWaitingDto } from './dto/waiting.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WaitingService {
  constructor(
    @InjectRepository(WaitingList)
    private waitingRepository: Repository<WaitingList>,
    private readonly mailService: MailService,

  ) { }

  async add(waiting: CreateWaitingDto): Promise<WaitingList> {

    const newWaiting = this.waitingRepository.create({
      fullname: waiting.fullname,
      email: waiting.email,
      phone: waiting.phone,
      country: waiting.country
    });

    const waitingSave = this.waitingRepository.save(newWaiting);

    await this.mailService.sendConfirmationEmailForWaiting(
      waiting.email,
      waiting.fullname
    );

    return waitingSave
  }

}
