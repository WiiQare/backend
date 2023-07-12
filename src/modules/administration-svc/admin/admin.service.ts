import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createAdminAccountDTO } from './dto/admin.dto';
import { User } from '../../session/entities/user.entity';
import { UserRole, UserStatus } from 'src/common/constants/enums';
import { SALT_ROUNDS } from 'src/common/constants/constants';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}

  /**
   * Method use to create a new admin Account on Wiiqare
   * @param payload
   * @returns User
   */
  async registerNewAdminAccount(payload: createAdminAccountDTO): Promise<User> {
    const { email, password } = payload;

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const adminUserTobeCreated = {
      email,
      password: hashedPassword,
      role: UserRole.WIIQARE_ADMIN,
      status: UserStatus.ACTIVE,
    };

    return this.UserRepository.save(adminUserTobeCreated);
  }
}
