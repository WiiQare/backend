import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConfigService } from '../../config/app-config.service';
import { Repository } from 'typeorm';
import { Patient } from '../patient-svc/entities/patient.entity';
import { Payer } from '../payer-svc/entities/payer.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    private readonly appConfigService: AppConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * This function is used to get transaction history
   * TODO: add pagination later!
   * @returns {Promise<any>}
   */
  async getAllTransactionHistory(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * This function is used to get transaction history from payer id
   * TODO: add pagination later!
   * @returns {Promise<any>}
   */
  async getTransactionHistoryBySenderId(
    senderId: string,
  ): Promise<Transaction[]> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndMapOne(
        'transaction.sender',
        Payer,
        'payer',
        'payer.user = transaction.senderId',
      )
      .leftJoinAndMapOne(
        'transaction.patient',
        Patient,
        'patient',
        'patient.id = transaction.ownerId',
      )
      .select([
        'transaction',
        'payer.firstName',
        'payer.lastName',
        'payer.country',
        'patient.firstName',
        'patient.lastName',
        'patient.phoneNumber',
      ])
      .where('transaction.senderId = :senderId', { senderId })
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
    return transactions;
  }
}
