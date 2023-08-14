import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationSaving } from './entities/operation.entity';


@Injectable()
export class operationService {
  constructor(
    @InjectRepository(OperationSaving)
    private operationRepository: Repository<OperationSaving>,
  ) {}

}