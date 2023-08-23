import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationSaving } from './entities/operation.entity';
import { CreateOperationDto } from './dto/operation.dto';
import { Saving } from '../saving/entities/saving.entity';
import { _404 } from 'src/common/constants/errors';


@Injectable()
export class operationService {
  constructor(
    @InjectRepository(OperationSaving)
    private operationRepository: Repository<OperationSaving>,
    @InjectRepository(Saving)
    private savingRepository: Repository<Saving>
  ) {}


  async paymentSaving(operation: CreateOperationDto): Promise<OperationSaving> {
    const saving = await this.savingRepository.findOne({ where: { id: operation.saving } });

    if (!saving) throw new NotFoundException(_404.USER_NOT_FOUND);

    const newOperation = this.operationRepository.create({
      saving,
      amount: operation.amount,
      currency: operation.currency,
      type: operation.type
    })

    return this.operationRepository.save(newOperation)
  }

}