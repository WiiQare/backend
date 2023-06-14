import { BusinessType } from '../../../common/constants/enums';
import { BaseEntity } from '../../../db/base-entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../session/entities/user.entity';
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

  @OneToOne(() => User, { cascade: ['insert', 'update'], nullable: true })
  @JoinColumn()
  user?: User;

  @Column({ comment: 'registered company number' })
  businessRegistrationNo: number;

  @Column({ type: 'enum', enum: BusinessType })
  businessType: BusinessType;

  @Column()
  logoLink: string;

  @Column({ type: 'json', nullable: true })
  contactPerson?: ContactPersonDto;

  @OneToMany(() => Package, (pkg) => pkg.provider)
  packages?: Package[];

  @OneToMany(() => Service, (service) => service.provider)
  services?: Service[];
}
