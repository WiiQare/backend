import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Provider } from './provider.entity';
import { Service } from './service.entity';

@Entity()
export class Package extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Provider, (provider) => provider.packages)
  provider: Provider;

  @ManyToMany(() => Service, (service) => service.packages)
  @JoinTable()
  services: Service[];
}
