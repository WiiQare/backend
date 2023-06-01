import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Patient extends BaseEntity {
  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  homeAddress: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  city?: string;
}
