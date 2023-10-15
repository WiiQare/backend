import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import {
  ReceiverType,
  SenderType,
  VoucherStatus,
} from '../../../common/constants/enums';
import { Transaction } from './transaction.entity';
import { BaseEntity } from './../../../db/base-entity';

@Entity()
export class Voucher extends BaseEntity {
  @Column( { nullable: true })
  vid: number;
  
  @Column()
  voucherHash: string;

  @Column()
  shortenHash: string;

  @Column({ type: 'double precision' })
  value: number;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'enum', enum: SenderType })
  senderType: SenderType;

  @Column()
  receiverId: string;

  @Column({ type: 'enum', enum: ReceiverType })
  receiverType: ReceiverType;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.UNCLAIMED,
  })
  status: VoucherStatus;

  @OneToOne(() => Transaction, (transaction) => transaction.id, {
    nullable: true,
  })
  @JoinColumn()
  transaction?: Transaction;
}
