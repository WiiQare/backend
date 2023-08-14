import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module';
import { OperationSaving } from './entities/operation.entity';
import { OperationController } from './saving.controller';
import { operationService } from './saving.service';

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
