import { Patient } from '../../../patient-svc/entities/patient.entity';
import { Payer } from '../../../payer-svc/entities/payer.entity';
import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

export function getAllPayerPaymentsQueryBuilder(dataSource: DataSource) {
  return dataSource

    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .leftJoin(Payer, 'payer', 'payer.user = transaction.senderId')
    .leftJoin(
      Patient,
      'patient',
      "patient.id = uuid((transaction.voucher)->>'patientId')",
    )
    .addSelect('transaction.id', 'id')
    .addSelect(`to_char(transaction.createdAt,'dd/mm/yyyy')`, 'transactionDate')
    .addSelect('transaction.senderAmount', 'senderAmount')
    .addSelect('payer.country', 'payerCountry')
    .addSelect('patient.country', 'patientCountry')
    .where("transaction.senderCurrency IN ('eur','EUR')");
}
