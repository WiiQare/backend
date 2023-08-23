import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../../smart-contract/entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import {
  PayerPaymentsDTO,
  ProviderPaymentsDTO,
  PaymentSummaryDTO,
} from './dto/payment.dto';

import { subMonths, subWeeks } from 'date-fns';
import {
  getCountPayerPaymentsQueryBuilder,
  getCountProviderPaymentsQueryBuilder,
} from './querybuilders/getCount.qb';
import { getCountryNameFromCode } from '../_helpers_';
import { getAllProviderPaymentQueryBuilder } from './querybuilders/getPaymentsDueProvider.qb';
import { getAllPayerPaymentsQueryBuilder } from './querybuilders/getPaymentsFromPayer.qb';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * This method is used to get global summary of payments
   * @returns
   */
  async getSummary(): Promise<PaymentSummaryDTO> {
    // total number of payer payments received within one week
    const payerPaymentsInOneWeek = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subWeeks(Date.now(), 1),
      })
      .getRawOne();
    // total number of payer payments received within one month
    const payerPaymentsInOneMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 1),
      })
      .getRawOne();
    // total number of payer payments received within three month
    const payerPaymentsInThreeMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 3),
      })
      .getRawOne();
    // total number of payer payments received within six months
    const payerPaymentsInSixMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 6),
      })
      .getRawOne();
    // total number of payer payments max
    const payerPaymentsMax = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .getRawOne();
    // total claimed vouchers
    const payerClaimedVouchers = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'CLAIMED'",
      )
      .getRawOne();

    // total provider payments
    const providerPayments = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.voucher)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'BURNED'",
      )
      .getRawOne();

    const { numberOfPayerPayments } = await getCountPayerPaymentsQueryBuilder(
      this.dataSource,
    ).getRawOne();

    const { numberOfProviderPayments } =
      await getCountProviderPaymentsQueryBuilder(this.dataSource).getRawOne();

    return {
      numberOFPayerPayments: numberOfPayerPayments || 0,
      numberOfProviderPayments: numberOfProviderPayments || 0,
      payerPaymentsInOneWeek: {
        numberOfPayments: payerPaymentsInOneWeek.number,
        value: payerPaymentsInOneWeek.value || 0,
      },
      payerPaymentsInOneMonth: {
        numberOfPayments: payerPaymentsInOneMonth.number,
        value: payerPaymentsInOneMonth.value || 0,
      },
      payerPaymentsInThreeMonths: {
        numberOfPayments: payerPaymentsInThreeMonth.number,
        value: payerPaymentsInThreeMonth.value || 0,
      },
      payerPaymentsInSixMonths: {
        numberOfPayments: payerPaymentsInSixMonth.number,
        value: payerPaymentsInSixMonth.value || 0,
      },
      payerPaymentsMax: {
        numberOfPayments: payerPaymentsMax.number,
        value: payerPaymentsMax.value || 0,
      },
      claimedVouchers: {
        numberOfPayments: payerClaimedVouchers.number,
        value: payerClaimedVouchers.value || 0,
      },

      totalProviderPayments: {
        numberOfPayments: providerPayments.number || 0,
        value: providerPayments.value || 0,
      },

      //TODO: to do later
      totalRevenue: 0,
    } as PaymentSummaryDTO;
  }

  /**
   * This method is used to retrieve list of payments received from payer
   * @returns
   */
  async getPaymentsFromPayer(take = 10, skip = 0): Promise<PayerPaymentsDTO[]> {
    const paymentsFromPayers = await getAllPayerPaymentsQueryBuilder(
      this.dataSource,
    )
      .limit(take)
      .offset(skip)
      .getRawMany();

    return paymentsFromPayers.map((payment) => {
      return {
        transactionId: payment.id,
        transactionDate: payment.transactionDate,
        paymentValue: payment.senderAmount || 0,
        payerCountry: getCountryNameFromCode(payment.payerCountry) || '',
        beneficiaryCountry:
          getCountryNameFromCode(payment.patientCountry) || '',
      };
    }) as PayerPaymentsDTO[];
  }

  /**
   * This method is used to retrieve list of payments due to provider.
   * @returns
   */
  async getPaymentsDueProvider(
    take = 10,
    skip = 0,
  ): Promise<ProviderPaymentsDTO[]> {
    const paymentsDueProvider = await getAllProviderPaymentQueryBuilder(
      this.dataSource,
    )
      .limit(take)
      .offset(skip)
      .getRawMany();

    return paymentsDueProvider.map((payment) => {
      return {
        transactionId: payment.id,
        transactionDate: payment.transactionDate,
        providerName: payment.providerName,
        providerId: payment.providerId,
        providerCity: payment.providerCity,
        providerCountry: getCountryNameFromCode(payment.providerCountry) || '',
        //TODO : to do later
        //transactionStatus: payment.transaction_status === 'CLAIMED',
        voucherAmountInLocalCurrency: payment.amountInLocalCurrency,
        voucherAmountInSenderCurrency: payment.amountInSenderCurrency,
      };
    }) as ProviderPaymentsDTO[];
  }
}
