import { User } from 'src/modules/session/entities/user.entity';
import { ManagerService } from './manager.service';
import { Repository } from 'typeorm';

describe('ManagerService', () => {
  it('should be defined', () => {
    const userRepo: Repository<User> = {} as Repository<User>;
    const service = new ManagerService(userRepo);
    expect(service).toBeDefined();
  });
});
