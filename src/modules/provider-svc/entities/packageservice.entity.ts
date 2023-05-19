import { BaseEntity } from 'src/db/base-entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Package } from './package.entity';
import { Service } from './service.entity';

@Entity()
export class PackageService extends BaseEntity {
  @ManyToOne(() => Package, (pkg) => pkg.packageServices)
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @ManyToOne(() => Service, (service) => service.packageServices)
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}
