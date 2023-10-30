import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    MailModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService], 
})
export class ContactModule {}
