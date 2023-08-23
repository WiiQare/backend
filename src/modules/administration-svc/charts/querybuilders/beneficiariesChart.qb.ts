import { subMonths } from 'date-fns';
import { Patient } from 'src/modules/patient-svc/entities/patient.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

function getNumberOfRegisteredBeneficiariesPerCountryQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Patient, 'patient')
    .addSelect('COUNT(patient.id)::integer', 'registeredBeneficiariesCount')
    .addSelect('lower(patient.country)', 'country')
    .groupBy('"country"');
}

function getActiveBeneficiariesPerCountryQueryBuilder(dataSource: DataSource) {
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
      'activeBeneficiariesCount',
    )
    .addSelect('lower(patient.country)', 'country')

    .where('transaction.updatedAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 6),
    })
    .andWhere("transaction.senderCurrency IN ('eur','EUR')")
    .groupBy('"country"');
}

export function getBeneficiariesChartInfoQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .addCommonTableExpression(
      getNumberOfRegisteredBeneficiariesPerCountryQueryBuilder(dataSource),
      'registeredBeneficiariesPerCountryTable',
    )
    .addCommonTableExpression(
      getActiveBeneficiariesPerCountryQueryBuilder(dataSource),
      'activeBeneficiariesPerCountryTable',
    )
    .from('registeredBeneficiariesPerCountryTable', 'rbpc')
    .leftJoin(
      'activeBeneficiariesPerCountryTable',
      'abpc',
      `"rbpc"."country"="abpc"."country"`,
    )
    .addSelect(`"rbpc"."country"`, 'country')
    .addSelect(`"rbpc"."registeredBeneficiariesCount"`, 'registeredCount')
    .addSelect(`"abpc"."activeBeneficiariesCount"`, 'activeCount');
}
