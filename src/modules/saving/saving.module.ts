import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module';
import { Saving } from './entities/saving.entity';
import { SavingController } from './saving.controller';
import { SavingService } from './saving.service';
import { User } from '../session/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Saving, User]),
    forwardRef(() => SessionModule),
  ],
  controllers: [SavingController],
  providers: [SavingService],
  exports: [SavingService],
})
export class SavingModule {}
