import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module';
import { OperationSaving } from './entities/operation.entity';
import { OperationController } from './operation.controller';
import { operationService } from './operation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationSaving]),
    forwardRef(() => SessionModule),
  ],
  controllers: [OperationController],
  providers: [operationService],
  exports: [operationService],
})
export class OperationModule {}
