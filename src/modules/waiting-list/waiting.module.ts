import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitingList } from './entities/waiting.entity';
import { WaitingController } from './waiting.controller';
import { WaitingService } from './waiting.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitingList]),
    MailModule,
  ],
  controllers: [WaitingController],
  providers: [WaitingService],
  exports: [WaitingService], 
})
export class WaitingModule {}
