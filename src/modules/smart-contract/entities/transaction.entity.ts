import { BaseEntity } from '../../../db/base-entity';
import { Column, Entity } from 'typeorm';
// import { UserType, VoucherStatus } from '../../../common/constants/enums';
import {
  ReceiverType,
  TransactionStatus,
} from '../../../common/constants/enums';

@Entity()
export class Transaction extends BaseEntity {
  @Column({
    type: 'double precision',
    comment: 'Sent amount before conversion',
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

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment:
      'This is the uuid of who current own the voucher for this transaction',
  })
  ownerId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment:
      'This is the uuid of who current own the voucher for this transaction',
  })
  hospitalId: string;

  @Column({
    type: 'enum',
    enum: ReceiverType,
    nullable: true,
    default: ReceiverType.PATIENT,
  })
  ownerType: ReceiverType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column()
  stripePaymentId: string;

  @Column({ type: 'jsonb' })
  voucher: Record<string, any>;
}
