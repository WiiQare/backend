import { Exclude } from 'class-transformer';
import { UserRole, UserStatus } from '../../../common/constants/enums';
import { BaseEntity } from '../../../db/base-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Saving } from 'src/modules/saving/entities/saving.entity';

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

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Saving, saving => saving.user, {nullable: true})
  savings: Saving[];
}
