import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PackageService } from './packageservice.entity';
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

  @OneToMany(() => PackageService, (packageService) => packageService.service)
  packageServices: PackageService[];
}
