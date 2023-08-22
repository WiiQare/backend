import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { ApiTags } from '@nestjs/swagger';
import { createManagerDTO, createManagerReponseDTO } from './dto/manager.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../session/entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';
import { _409 } from 'src/common/constants/errors';

@ApiTags('admin/managers')
@Controller('managers')
export class ManagerController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly managerService: ManagerService,
  ) {}

  @Post()
  @Public()
  async createManagerAccount(
    @Body() createManagerDTO: createManagerDTO,
  ): Promise<createManagerReponseDTO> {
    // check if user doesn't exists!
    const userExists = await this.userRepository
      .createQueryBuilder('user')
      .where(`user.email = :email`, { email: createManagerDTO.email })
      .getOne();

    if (userExists) throw new ConflictException(_409.USER_ALREADY_EXISTS);

    const { id, email, status, role } =
      await this.managerService.registerNewManagerAccount(createManagerDTO);

    return {
      userId: id,
      email,
      status,
      userRole: role,
    } as createManagerReponseDTO;
  }
}
