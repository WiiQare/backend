import { BusinessType } from 'src/common/constants/enums';
import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ContactPersonDto } from '../dto/provider.dto';
import { Package } from './package.entity';
import { Service } from './service.entity';

@Entity()
export class Provider extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @Column()
  nationalId: string;

  @Column({ comment: 'Registered company number' })
  businessRegistrationNo: number;

  @Column({ type: 'enum', enum: BusinessType })
  businessType: BusinessType;

  @Column()
  logoLink: string;

  @Column({ type: 'json', nullable: true })
  contactPerson?: ContactPersonDto;

  //TODO: refactor these relationships!
  @OneToMany(() => Package, (pkg) => pkg.provider)
  packages?: Package[];

  @OneToMany(() => Service, (service) => service.provider)
  services?: Service[];
}
