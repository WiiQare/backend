import { Transaction } from '../../../smart-contract/entities/transaction.entity';
import { DataSource } from 'typeorm';

export function getAllVouchersQueryBuilder(dataSource: DataSource) {
  return dataSource
    .createQueryBuilder()
    .from(Transaction, 'transaction')
    .addSelect("transaction.voucher->>'id'", 'VoucherId')
    .addSelect('transaction.amount', 'amountInLocalCurrency')
    .addSelect('transaction.senderAmount', 'amountInSenderCurrency')
    .addSelect('transaction.senderCurrency', 'senderCurrency')
    .addSelect('transaction.currency', 'localCurrency')
    .addSelect('transaction.senderId', 'payerId')
    .addSelect('transaction.ownerId', 'voucherOwnerId')
    .addSelect('transaction.status', 'status')
    .addSelect(`to_char(transaction.createdAt,'dd/mm/yyyy')`, 'purchasedDate')
    .addSelect("transaction.voucher->>'patientId'", 'beneficiaryId')
    .where("transaction.senderCurrency IN ('eur','EUR')");
}
