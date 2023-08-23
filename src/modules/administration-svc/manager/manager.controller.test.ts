import { User } from 'src/modules/session/entities/user.entity';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { Repository } from 'typeorm';

describe('ManagerController', () => {
  it('should be defined', () => {
    const userRepo: Repository<User> = {} as Repository<User>;
    const service = new ManagerService(userRepo);
    const controller = new ManagerController(userRepo, service);
    expect(controller).toBeDefined();
  });
});
