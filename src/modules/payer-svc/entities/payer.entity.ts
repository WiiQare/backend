import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Payer extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  homeAddress?: string;

  @Column({ nullable: true })
  province?: string;

  @Column({ nullable: true })
  city?: string;
}
