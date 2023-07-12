import { Payer } from 'src/modules/payer-svc/entities/payer.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

/**
 * QueryBuilder used to get payers Id,full Name, country code and registration date
 */
async function getPayerInfoQueryBuilder(
  dataSource: DataSource,
): Promise<SelectQueryBuilder<Payer>> {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .addSelect('payer.id::text', 'payerId')
    .addSelect("concat_ws(' ',payer.first_name, payer.last_name)", 'name')
    .addSelect('payer.country', 'country')
    .addSelect("to_char(payer.created_at,'dd/mm/yyyy')", 'registrationDate');
}

async function getUniqueBeneficiaryCountPerPayerQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('payer.id::text', 'payerId')
    .addSelect(
      "COUNT(DISTINCT transaction.voucher->>'patientId')::integer",
      'uniqueBeneficiaryCount',
    )
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy('"payerId"');
}

async function getPurchasedVouchersPerPayerQueryBuilder(
  dataSource: DataSource,
) {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('payer.id::text', 'payerId')
    .addSelect('COUNT(transaction.voucher)', 'totalNumberOfPurchasedVouchers')
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalAmountOfPurchasedVouchers',
    )
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy('"payerId"');
}

async function getPendingVouchersPerPayerQueryBuilder(dataSource: DataSource) {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('payer.id::text', 'payerId')
    .addSelect('COUNT(transaction.voucher)', 'totalNumberOfPendingVouchers')
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfPendingVouchers')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere("transaction.ownerType='PATIENT'")
    .andWhere("transaction.status='PENDING'")
    .groupBy('"payerId"');
}
async function getUnclaimedVouchersPerPayerQueryBuilder(
  dataSource: DataSource,
) {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('payer.id::text', 'payerId')
    .addSelect('COUNT(transaction.voucher)', 'totalNumberOfUnclaimedVouchers')
    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalAmountOfUnclaimedVouchers',
    )
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status='UNCLAIMED'")
    .groupBy('"payerId"');
}
async function getRedeemedVouchersPerPayerQueryBuilder(dataSource: DataSource) {
  return await dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('payer.id::text', 'payerId')
    .addSelect('COUNT(transaction.voucher)', 'totalNumberOfRedeemedVouchers')
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfRedeemedVouchers')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.status='BURNED'")
    .groupBy('"payerId"');
}

export async function getAllPayersQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .addCommonTableExpression(
      await getPayerInfoQueryBuilder(dataSource),
      'PayerTable',
    )
    .addCommonTableExpression(
      await getUniqueBeneficiaryCountPerPayerQueryBuilder(dataSource),
      'uniqueBeneficiaryCountPerPayerTable',
    )
    .addCommonTableExpression(
      await getPurchasedVouchersPerPayerQueryBuilder(dataSource),
      'purchasedVouchersPerPayerTable',
    )
    .addCommonTableExpression(
      await getPendingVouchersPerPayerQueryBuilder(dataSource),
      'pendingVouchersPerPayerTable',
    )
    .addCommonTableExpression(
      await getUnclaimedVouchersPerPayerQueryBuilder(dataSource),
      'unclaimedVouchersPerPayerTable',
    )
    .addCommonTableExpression(
      await getRedeemedVouchersPerPayerQueryBuilder(dataSource),
      'redeemedVouchersPerPayerTable',
    )
    .from('PayerTable', 'p')
    .leftJoin(
      'uniqueBeneficiaryCountPerPayerTable',
      'ubcp',
      `"ubcp"."payerId"="p"."payerId"`,
    )
    .leftJoin(
      'purchasedVouchersPerPayerTable',
      'pvp',
      `"pvp"."payerId"="p"."payerId"`,
    )
    .leftJoin(
      'pendingVouchersPerPayerTable',
      'pvp2',
      `"pvp2"."payerId"="p"."payerId"`,
    )
    .leftJoin(
      'unclaimedVouchersPerPayerTable',
      'uvp',
      `"uvp"."payerId"="p"."payerId"`,
    )
    .leftJoin(
      'redeemedVouchersPerPayerTable',
      'rvp',
      `"rvp"."payerId"="p"."payerId"`,
    )
    .addSelect(`"p"."payerId"`, 'id')
    .addSelect(`"p"."name"`, 'name')
    .addSelect(`"p"."country"`, 'country')
    .addSelect(`"p"."registrationDate"`, 'registrationDate')
    .addSelect(`"ubcp"."uniqueBeneficiaryCount"`, 'uniqueBeneficiaryCount')
    .addSelect(
      `"pvp"."totalNumberOfPurchasedVouchers"::integer`,
      'totalNumberOfPurchasedVouchers',
    )
    .addSelect(
      `"pvp"."totalAmountOfPurchasedVouchers"`,
      'totalAmountOfPurchasedVouchers',
    )
    .addSelect(
      `"pvp2"."totalNumberOfPendingVouchers"::integer`,
      'totalNumberOfPendingVouchers',
    )
    .addSelect(
      `"pvp2"."totalAmountOfPendingVouchers"`,
      'totalAmountOfPendingVouchers',
    )
    .addSelect(
      `"uvp"."totalNumberOfUnclaimedVouchers"::integer`,
      'totalNumberOfUnclaimedVouchers',
    )
    .addSelect(
      `"uvp"."totalAmountOfUnclaimedVouchers"`,
      'totalAmountOfUnclaimedVouchers',
    )
    .addSelect(
      `"rvp"."totalNumberOfRedeemedVouchers"::integer`,
      'totalNumberOfRedeemedVouchers',
    )
    .addSelect(
      `"rvp"."totalAmountOfRedeemedVouchers"`,
      'totalAmountOfRedeemedVouchers',
    );
}
