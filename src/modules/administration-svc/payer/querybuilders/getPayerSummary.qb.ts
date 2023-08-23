import { subMonths } from 'date-fns';
import { Payer } from '../../../payer-svc/entities/payer.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export async function getNumberOfRegisteredPayersQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Payer>> {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payers')
    .addSelect('COUNT(payers.id)::integer', 'numberOfRegisteredPayers');
}

export async function getAllPayersPurchasedVouchersInfoQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfPurchasedVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalValueOfPurchasedVouchers')
    .where("transaction.senderCurrency IN ('eur','EUR')");
}
export async function getAllPayersPendingVouchersInfoQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfPendingVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalValueOfPendingVouchers')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere("transaction.ownerType='PATIENT'")
    .andWhere("transaction.status='PENDING'");
}
export async function getAllPayersRedeemedVouchersInfoQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfRedeemedVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalValueOfRedeemedVouchers')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status='BURNED'");
}

export async function getNumberOfActivePayersQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Payer, 'payers')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payers.id')
    .addSelect('COUNT(payers.id)::integer', 'numberOfActivePayers')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.createdAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 6),
    });
}
