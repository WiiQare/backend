import { Provider } from '../../../provider-svc/entities/provider.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

export function getAllProviderPaymentQueryBuilder(dataSource: DataSource) {
  return (
    dataSource
      .createQueryBuilder()
      .from(Transaction, 'transaction')
      .leftJoin(Provider, 'provider', 'provider.id = transaction.ownerId')
      .addSelect('transaction.id', 'id')
      .addSelect(
        `to_char(transaction.updatedAt,'dd/mm/yyyy')`,
        'transactionDate',
      )
      .addSelect('provider.name', 'providerName')
      .addSelect('provider.id', 'providerId')
      .addSelect('provider.city', 'providerCity')
      //.addSelect('transaction.status','')
      .addSelect('transaction.amount', 'amountInLocalCurrency')
      .addSelect('transaction.senderAmount', 'amountInSenderCurrency')
      .addSelect("provider.contact_person->>'country'", 'providerCountry')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'UNCLAIMED'",
      )
  );
}
