import { subMonths } from 'date-fns';
import { Patient } from 'src/modules/patient-svc/entities/patient.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export function getNumberOfRegisteredBeneficiariesQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Patient> {
  return dataSource
    .createQueryBuilder()
    .from(Patient, 'patient')
    .addSelect('COUNT(patient.id)::integer', 'numberOfRegisteredBeneficiaries');
}

export function getPendingVouchersForAllBeneficiariesQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect('COUNT(transaction.voucher)::integer', 'numberOfPendingVouchers')
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfPendingVouchers')
    .where("transaction.status='PENDING'")
    .andWhere("transaction.ownerType='PATIENT'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export function getRedeemedVouchersForAllBeneficiariesQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
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

export function getBeneficiaryToProviderTransactionsQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
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

export function getActiveBeneficiariesQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Patient> {
  return dataSource
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
