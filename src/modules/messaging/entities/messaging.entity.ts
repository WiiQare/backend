import { BaseEntity } from '../../../db/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Messaging extends BaseEntity {
  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column()
  recipientName: string;

  @Column()
  senderName: string;

  @Column()
  message: string;

  @Column({ default: true })
  isFromUser: boolean;
}
