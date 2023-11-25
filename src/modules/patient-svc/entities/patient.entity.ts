import { BaseEntity } from '../../../db/base-entity';
import { User } from '../../../modules/session/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Patient extends BaseEntity {
  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToOne(() => User, { cascade: ['insert', 'update'] })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  email?: string;

  @Column()
  homeAddress: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  addedBy?: string
}
