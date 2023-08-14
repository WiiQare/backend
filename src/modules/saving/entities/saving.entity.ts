import { BaseEntity } from 'src/db/base-entity';
import { OperationSaving } from 'src/modules/operation-saving/entities/operation.entity';
import { User } from 'src/modules/session/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export enum SavingType {
    PourMoi = 'MOI',
    Famille = 'FAMILLE',
    Enfant = 'ENFANT',
  }

  export enum SavingFrequency {
    day = 'DAY',
    week = 'WEEK',
    month = 'MONTH',
  }

@Entity()
export class Saving extends BaseEntity {
  
    @ManyToOne(() => User, user => user.savings)
    @JoinColumn({ name: 'idUser' })
    user: User;
  
    @Column({
        type: 'enum',
        enum: SavingType,
        default: SavingType.PourMoi,
    })
    type: SavingType;
  
    @Column()
    amount: number;
  
    @Column()
    currency: string;
  
    @Column({
        type: 'enum',
        enum: SavingFrequency,
        default: SavingFrequency.day,
    })
    frequency: SavingFrequency;

    @OneToMany(() => OperationSaving, operation => operation.saving, {nullable: true})
    operations: Saving[];
  }