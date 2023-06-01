import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { UserRole, UserStatus } from '../../../common/constants/enums';
import { BaseEntity } from '../../../db/base-entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column()
  referralCode: string;

  @Column({ nullable: true })
  referredBy: string;
}
