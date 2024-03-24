import { Repository } from 'typeorm';
import { SavingService } from './saving.service';
import { Saving, SavingFrequency, SavingType } from './entities/saving.entity';
import { User } from '../session/entities/user.entity';
import { SessionService } from '../session/session.service';
import { CreateSavingDto } from './dto/saving.dto';

describe('SavingService', () => {
  let service: SavingService;
  let userService: SessionService;
  let savingRepository: Repository<Saving>;
  let userRepository: Repository<User>;
  let mockSaving: CreateSavingDto = {
    user: 'ca415c08-1bf1-4b67-b9d4-a2838fcd671b',
    type: SavingType.PourMoi,
    amount: 200,
    currency: 'USD',
    frequency: SavingFrequency.day,
    operations: undefined,
  };

  beforeEach(async () => {
    savingRepository = {
      create: jest.fn().mockReturnValue(mockSaving),
      save: jest.fn().mockReturnValue(mockSaving),
      findOne: jest.fn().mockReturnValue(mockSaving),
      createQueryBuilder: jest.fn().mockReturnValue({}),
    } as unknown as Repository<Saving>;
    service = new SavingService(savingRepository, userRepository);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
