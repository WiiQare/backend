import { subMonths, subWeeks } from 'date-fns';
import { Provider } from 'src/modules/provider-svc/entities/provider.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export function getNumberOfRegisteredProvidersQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Provider> {
  return dataSource
    .createQueryBuilder()
    .from(Provider, 'provider')
    .addSelect('COUNT(provider.id)::integer', 'numberOfRegisteredProviders');
}

export function getTotalBeneficiaryTransactionMadeWithinOneWeekQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.senderAmount)::integer',
      'totalNumberOfBeneficiaryProviderTransactionWithinOneWeek',
    )
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalValueOfBeneficiaryProviderTransactionWithinOneWeek',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.updatedAt >= :datePrior', {
      datePrior: subWeeks(Date.now(), 1),
    });
}
export function getTotalBeneficiaryTransactionMadeWithinOneMonthQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.senderAmount)::integer',
      'totalNumberOfBeneficiaryProviderTransactionWithinOneMonth',
    )
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalValueOfBeneficiaryProviderTransactionWithinOneMonth',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.updatedAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 1),
    });
}
export function getTotalBeneficiaryTransactionMadeWithinThreeMonthsQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.senderAmount)::integer',
      'totalNumberOfBeneficiaryProviderTransactionWithinThreeMonths',
    )
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalValueOfBeneficiaryProviderTransactionWithinThreeMonths',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.updatedAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 3),
    });
}
export function getTotalBeneficiaryTransactionMadeWithinSixMonthsQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.senderAmount)::integer',
      'totalNumberOfBeneficiaryProviderTransactionWithinSixMonths',
    )
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalValueOfBeneficiaryProviderTransactionWithinSixMonths',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.updatedAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 6),
    });
}

export function getTotalBeneficiaryToProviderTransactionQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'sum(transaction.senderAmount)::real',
      'totalBeneficiaryProviderTransaction',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export function getTotalNumberOfUniqueBeneficiaryQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      `COUNT(DISTINCT transaction.voucher->>'patientId')::integer`,
      'totalNumberOfUniqueBeneficiaries',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status IN ('UNCLAIMED','CLAIMED','BURNED')")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}

export function getAllUnclaimedVouchersQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfUnclaimedVouchers',
    )
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalAmountOfUnclaimedVouchers',
    )
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status ='UNCLAIMED'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}
export function getAllClaimedVouchersQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfClaimedVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfClaimedVouchers')
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status = 'CLAIMED'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}
export function getAllRedeemedVouchersQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Provider, 'provider', 'transaction.ownerId=provider.id')
    .addSelect(
      'COUNT(transaction.voucher)::integer',
      'totalNumberOfRedeemedVouchers',
    )
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfRedeemedVouchers')
    .where("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status ='BURNED'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')");
}
