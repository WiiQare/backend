import { BaseEntity } from 'src/db/base-entity';
import { Saving } from 'src/modules/saving/entities/saving.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum OperationType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Entity('operation_savings')
export class OperationSaving extends BaseEntity {

  @ManyToOne(() => Saving, saving => saving.operations)
  @JoinColumn({ name: 'idSaving' })
  saving: Saving;

  @Column({
    type: 'enum',
    enum: OperationType,
  })
  type: OperationType;

  @Column()
  amount: number;

  @Column()
  currency: string;
  
}