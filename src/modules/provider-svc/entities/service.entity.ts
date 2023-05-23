import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Package } from './package.entity';
import { Provider } from './provider.entity';

@Entity()
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => Provider, (provider) => provider.services)
  provider: Provider;

  @ManyToMany(() => Package, (pkg) => pkg.services)
  packages: Package[];
}
