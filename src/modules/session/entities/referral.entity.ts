import { Column, Entity, Index } from 'typeorm';
import { ReferralStatus } from '../../../common/constants/enums';
import { BaseEntity } from '../../../db/base-entity';

@Entity()
@Index('UNIQUE_REFERRAL', ['referralCode', 'referred'], { unique: true })
export class Referral extends BaseEntity {
  @Column()
  referralCode: string;

  @Column()
  referred: string;

  @Column({ type: 'double precision' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.NOT_REDEEMED,
  })
  status: ReferralStatus;
}
