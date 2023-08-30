import { subMonths } from 'date-fns';
import { Payer } from '../../../payer-svc/entities/payer.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

function getNumberOfRegisteredPayersPerCountryQueryBuilder(
  dataSource: DataSource,
) {
  return dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .addSelect('COUNT(payer.id)::integer', 'registeredPayersCount')
    .addSelect('payer.country', 'country')
    .groupBy('"country"')
    .orderBy('COUNT(payer.id)', 'DESC');
}

function getNumberOfActivePayersPerCountryQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'transaction.senderId=payer.id')
    .addSelect('COUNT(payer.id)::integer', 'activePayersCount')
    .addSelect('payer.country', 'country')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere('transaction.createdAt >= :datePrior', {
      datePrior: subMonths(Date.now(), 6),
    })
    .groupBy('"country"')
    .orderBy('COUNT(payer.id)', 'DESC');
}

export function getPayersChartInfoQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .addCommonTableExpression(
      getNumberOfRegisteredPayersPerCountryQueryBuilder(dataSource),
      'registeredPayersPerCountryTable',
    )
    .addCommonTableExpression(
      getNumberOfActivePayersPerCountryQueryBuilder(dataSource),
      'activePayersPerCountryTable',
    )
    .from('registeredPayersPerCountryTable', 'rppc')
    .leftJoin(
      'activePayersPerCountryTable',
      'appc',
      `"rppc"."country"="appc"."country"`,
    )
    .addSelect(`"rppc"."country"`, 'country')
    .addSelect(`"rppc"."registeredPayersCount"`, 'registeredCount')
    .addSelect(`"appc"."activePayersCount"`, 'activeCount');
}
