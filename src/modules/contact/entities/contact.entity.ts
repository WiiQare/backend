import { BaseEntity } from '../../../db/base-entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Contact extends BaseEntity {

  @Column({nullable: false})
  fullname: string;

  @Column({nullable: false})
  email: string;

  @Column({nullable: false})
  object: string;

  @Column({nullable: false})
  message: string;

}
