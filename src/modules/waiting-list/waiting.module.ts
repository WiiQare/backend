import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module';
import { WaitingList } from './entities/waiting.entity';
import { WaitingController } from './waiting.controller';
import { WaitingService } from './waiting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitingList]),
    forwardRef(() => SessionModule),
  ],
  controllers: [WaitingController],
  providers: [WaitingService],
  exports: [WaitingService],
})
export class WaitingModule {}
