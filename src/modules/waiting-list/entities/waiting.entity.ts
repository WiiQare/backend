import { BaseEntity } from '../../../db/base-entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class WaitingList extends BaseEntity {

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: true })
  country: string;

}
