import { BaseEntity } from 'src/db/base-entity';
import { AfterLoad, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Provider } from './provider.entity';
import { PackageService } from './packageservice.entity';

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

  @OneToMany(() => PackageService, (PackageService) => PackageService.package)
  packageServices: PackageService[];

  @AfterLoad() // TypeORM lifecycle hook
  get services() {
    return this.packageServices?.map(
      (packageService) => packageService.service,
    );
  }
}
