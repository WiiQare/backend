import { BaseEntity } from '../../../db/base-entity';
import { Column, Entity } from 'typeorm';
import { UserType, VoucherStatus } from '../../../common/constants/enums';

@Entity()
export class Transaction extends BaseEntity {
  @Column({
    type: 'double precision',
    comment: 'sent amount before conversion',
  })
  senderAmount: number;

  @Column()
  senderCurrency: string;

  @Column({
    type: 'double precision',
    comment: 'This is the actual amount in local currency patient receives',
  })
  amount: number;

  @Column({
    type: 'double precision',
    comment: 'This rate of exchange at the time of the transaction',
  })
  conversionRate: number;

  @Column({ comment: 'local currency' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment:
      'This is the uuid of who current own the voucher for this transaction',
  })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
    default: UserType.PATIENT,
  })
  ownerType: UserType;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.UNCLAIMED,
  })
  status: VoucherStatus;

  @Column()
  transactionHash: string;

  //TODO: @remove nullable later!
  @Column({ nullable: true })
  shortenHash: string;

  @Column()
  stripePaymentId: string;

  @Column({ type: 'jsonb' })
  voucher: Record<string, any>;
}
