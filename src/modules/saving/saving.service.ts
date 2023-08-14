import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Saving } from './entities/saving.entity';
import { CreateSavingDto } from './dto/saving.dto';
import { _404 } from 'src/common/constants/errors';
import { User } from '../session/entities/user.entity';


@Injectable()
export class SavingService {
  constructor(
    @InjectRepository(Saving)
    private savingRepository: Repository<Saving>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async add(saving: CreateSavingDto): Promise<Saving> {
    const user = await this.userRepository.findOne({ where: { id: saving.user } });

    if (!user) throw new NotFoundException(_404.USER_NOT_FOUND);

    const newSaving = this.savingRepository.create({
      user,
      type: saving.type,
      amount: saving.amount,
      currency: saving.currency,
      frequency: saving.frequency
    })

    return this.savingRepository.save(newSaving)

  }

  async retrieving (userId: string) : Promise<Saving[]> {
    const savings = await this.savingRepository
    .createQueryBuilder('saving')
    .leftJoinAndSelect('saving.operations', 'operation')
    .where('saving.user = :userId', { userId: userId })
    .getMany();

    return savings
  }
}