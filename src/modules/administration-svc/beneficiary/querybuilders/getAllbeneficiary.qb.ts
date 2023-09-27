import { Patient } from '../../../patient-svc/entities/patient.entity';
import { Payer } from '../../../payer-svc/entities/payer.entity';
import { Provider } from '../../../provider-svc/entities/provider.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { SelectQueryBuilder, ObjectLiteral, DataSource } from 'typeorm';

/**
 * QueryBuilder used to get patients Id,full Name, country code and registration date
 */
function getPatientInfoQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Patient> {
  return dataSource
    .createQueryBuilder()
    .from(Patient, 'patient')
    .addSelect('patient.id::text', 'patientId')
    .addSelect("concat_ws(' ',patient.first_name, patient.last_name)", 'name')
    .addSelect('patient.country', 'country')
    .addSelect("to_char(patient.created_at,'dd/mm/yyyy')", 'registrationDate')
    .addSelect('patient.created_at', 'createdAt');
}
function getUniqueProviderCountPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(DISTINCT provider.id)', 'totalNumberOfDistinctProviders')
    .leftJoin(Provider, 'provider', 'transaction.ownerId = provider.user')
    .groupBy(`"patientId"`);
}

function getUniquePayerCountPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect('patient.id::text', 'patientId')
    .addSelect('COUNT(DISTINCT payer.id)', 'totalNumberOfPayers')
    .leftJoin(Payer, 'payer', 'payer.user = transaction.senderId')
    .leftJoin(
      Patient,
      'patient',
      "patient.id::text = transaction.voucher->>'patientId'",
    )
    .groupBy(`"patientId"`);
}

function getTotalPaymentPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(transaction.senderAmount)', 'totalPaymentCount')
    .addSelect('SUM(transaction.senderAmount)', 'totalPayment')
    .where(
      "((transaction.status ='PENDING' AND transaction.ownerType ='PATIENT')",
    )
    .orWhere(
      "(transaction.status IN ('SUCCESSFUL','PAID_OUT') AND transaction.ownerType='PROVIDER'))",
    )
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy(`"patientId"`);
}

function getActiveVoucherPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(transaction.voucher)', 'numberOfActiveVouchers')
    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfActiveVouchers')
    .where(
      "(transaction.status ='PENDING' AND transaction.ownerType ='PATIENT')",
    )
    .orWhere(
      "(transaction.status IN ('SUCCESSFUL','PAID_OUT') AND transaction.ownerType='PROVIDER')",
    )
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy(`"patientId"`);
}

function getPendingVoucherPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(transaction.voucher)', 'numberOfPendingVouchers')

    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfPendingVouchers')

    .where("transaction.status='PENDING'")
    .andWhere("transaction.ownerType='PATIENT'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy(`"patientId"`);
}

function getUnclaimedVoucherPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(transaction.voucher)', 'numberOfUnclaimedVouchers')

    .addSelect(
      'SUM(transaction.senderAmount)',
      'totalAmountOfUnclaimedVouchers',
    )
    .where("transaction.status='SUCCESSFUL'")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy(`"patientId"`);
}

function getRedeemedVoucherPerPatientQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<Transaction> {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'patientId'", 'patientId')
    .addSelect('COUNT(transaction.voucher)', 'numberOfRedeemedVouchers')

    .addSelect('SUM(transaction.senderAmount)', 'totalAmountOfRedeemedVouchers')
    .where("transaction.status='PAID_OUT'")
    .andWhere("transaction.ownerType='PROVIDER'")
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy(`"patientId"`);
}

export function getAllBeneficiariesQueryBuilder(
  dataSource: DataSource,
): SelectQueryBuilder<ObjectLiteral> {
  return (
    dataSource
      .createQueryBuilder()
      .addCommonTableExpression(
        getPatientInfoQueryBuilder(dataSource),
        'patientTable',
      )
      .addCommonTableExpression(
        getUniquePayerCountPerPatientQueryBuilder(dataSource),
        'payerCountTable',
      )
      .addCommonTableExpression(
        getUniqueProviderCountPerPatientQueryBuilder(dataSource),
        'providerCountTable',
      )
      .addCommonTableExpression(
        getTotalPaymentPerPatientQueryBuilder(dataSource),
        'totalPaymentTable',
      )
      .addCommonTableExpression(
        getActiveVoucherPerPatientQueryBuilder(dataSource),
        'activeVoucherTable',
      )
      .addCommonTableExpression(
        getPendingVoucherPerPatientQueryBuilder(dataSource),
        'pendingVoucherTable',
      )
      .addCommonTableExpression(
        getUnclaimedVoucherPerPatientQueryBuilder(dataSource),
        'unclaimedVoucherTable',
      )
      .addCommonTableExpression(
        getRedeemedVoucherPerPatientQueryBuilder(dataSource),
        'redeemedVoucherTable',
      )
      .from('patientTable', 'p')
      .leftJoin('payerCountTable', 'pc', `"p"."patientId"="pc"."patientId"`)
      .leftJoin(
        'providerCountTable',
        'pdc',
        `"p"."patientId"="pdc"."patientId"`,
      )
      .leftJoin('totalPaymentTable', 'tp', `"p"."patientId"="tp"."patientId"`)
      .leftJoin('activeVoucherTable', 'av', `"p"."patientId"="av"."patientId"`)
      .leftJoin('pendingVoucherTable', 'pv', `"p"."patientId"="pv"."patientId"`)
      .leftJoin(
        'unclaimedVoucherTable',
        'uv',
        `"p"."patientId"="uv"."patientId"`,
      )
      .leftJoin(
        'redeemedVoucherTable',
        'rv',
        `"p"."patientId"="rv"."patientId"`,
      )
      .addSelect(`"p"."patientId"`, 'id')
      .addSelect(`"p"."name"`, 'name')
      .addSelect(`"p"."country"`, 'country')
      .addSelect(`"p"."registrationDate"`, 'registrationDate')
      .addSelect(
        `"pc"."totalNumberOfPayers"::integer`,
        'totalNumberOfDistinctPayers',
      )
      .addSelect(
        `"pdc"."totalNumberOfDistinctProviders"::integer`,
        'totalNumberOfDistinctProviders',
      )
      //.addSelect(`"tp"."senderCurrency"`, 'currency')
      .addSelect(`"tp"."totalPayment"::real`, 'totalPayment')
      .addSelect(`"tp"."totalPaymentCount"::integer`, 'totalPaymentCount')
      .addSelect(
        `"av"."numberOfActiveVouchers"::integer`,
        'numberOfActiveVouchers',
      )
      .addSelect(
        `"av"."totalAmountOfActiveVouchers"::real`,
        'totalAmountOfActiveVouchers',
      )
      .addSelect(
        `"pv"."numberOfPendingVouchers"::integer`,
        'numberOfPendingVouchers',
      )
      .addSelect(
        `"pv"."totalAmountOfPendingVouchers"::real`,
        'totalAmountOfPendingVouchers',
      )
      .addSelect(
        `"uv"."numberOfUnclaimedVouchers"::integer`,
        'numberOfUnclaimedVouchers',
      )
      .addSelect(
        `"uv"."totalAmountOfUnclaimedVouchers"::real`,
        'totalAmountOfUnclaimedVouchers',
      )
      .addSelect(
        `"rv"."numberOfRedeemedVouchers"::integer`,
        'numberOfRedeemedVouchers',
      )
      .addSelect(
        `"rv"."totalAmountOfRedeemedVouchers"::real`,
        'totalAmountOfRedeemedVouchers',
      )
  );
}
