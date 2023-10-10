import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { _404 } from '../../common/constants/errors';
import { WaitingList } from './entities/waiting.entity';
import { CreateWaitingDto } from './dto/waiting.dto';

@Injectable()
export class WaitingService {
  constructor(
    @InjectRepository(WaitingList)
    private waitingRepository: Repository<WaitingList>
  ) {}

  async add(waiting: CreateWaitingDto): Promise<WaitingList> {
    
    const newSaving = this.waitingRepository.create({
      fullname: waiting.fullname,
      email: waiting.email,
      phone: waiting.phone
    });

    return this.waitingRepository.save(newSaving);
  }

}
