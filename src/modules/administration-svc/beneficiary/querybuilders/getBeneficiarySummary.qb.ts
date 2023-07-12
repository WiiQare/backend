import { subMonths } from 'date-fns';
import { Patient } from 'src/modules/patient-svc/entities/patient.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export async function getNumberOfRegisteredBeneficiariesQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Patient>> {
  return await dataSource
    .createQueryBuilder()
    .from(Patient, 'patient')
    .addSelect('COUNT(patient.id)::integer', 'numberOfRegisteredBeneficiaries');
}

export async function getPendingVouchersForAllBeneficiariesQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect('COUNT(transaction.voucher)::integer', 'numberOfPendingVouchers')
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfPendingVouchers')
    .where("transaction.status='PENDING'")
    .andWhere("transaction.ownerType='PATIENT'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export async function getRedeemedVouchersForAllBeneficiariesQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'numberOfRedeemedVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfRedeemedVouchers')
    .where("transaction.status='BURNED'")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export async function getBeneficiaryToProviderTransactionsQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Transaction>> {
  return await dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect('COUNT(transaction.id)::integer', 'numberOfProviderTransactions')
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalAmountOfProviderTransactions',
    )
    .where("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export async function getActiveBeneficiariesQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Patient>> {
  return await dataSource
    .createQueryBuilder()
    .from(Patient, 'patient')
    .leftJoin(
      Transaction,
      'transaction',
      `patient.id::text = transaction.voucher->>'patientId'`,
    )
    .addSelect(
      `COUNT(DISTINCT transaction.voucher->>'patientId')::integer`,
      'numberOfActiveBeneficiaries',
    )
    .where('transaction.updatedAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 6),
    })
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}
