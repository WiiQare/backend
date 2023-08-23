import { Payer } from '../../../payer-svc/entities/payer.entity';
import { Provider } from '../../../provider-svc/entities/provider.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

export function getCountProviderPaymentsQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .from(Provider, 'provider')
    .leftJoin(Transaction, 'transaction', 'provider.id=transaction.ownerId')
    .addSelect('COUNT(transaction.id)::integer', 'numberOfProviderPayments')
    .where("transaction.senderCurrency IN ('eur','EUR')")
    .andWhere(
      "transaction.ownerType = 'PROVIDER' AND transaction.status = 'UNCLAIMED'",
    );
}

export function getCountPayerPaymentsQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .from(Payer, 'payer')
    .leftJoin(Transaction, 'transaction', 'payer.user=transaction.senderId')
    .addSelect('COUNT(transaction.id)::integer', 'numberOfPayerPayments')
    .where("transaction.senderCurrency IN ('eur','EUR')");
}
