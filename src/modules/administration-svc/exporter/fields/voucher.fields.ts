export const voucherFields = [
  {
    label: 'Voucher ID',
    value: 'VoucherId',
  },
  {
    label: 'Purchased Date',
    value: 'purchasedDate',
  },
  {
    label: 'Voucher PayerID',
    value: 'payerId',
  },
  {
    label: 'Voucher OwnerID',
    value: 'voucherOwnerId',
  },
  {
    label: 'Voucher BeneficiaryID',
    value: 'beneficiaryId',
  },
  {
    label: 'Amount - Local Currency',
    value: (record) => record['amountInLocalCurrency'] || 0,
  },
  {
    label: 'Local Currency',
    value: 'localCurrency',
  },
  {
    label: 'Amount - Sender Currency',
    value: (record) => record['amountInSenderCurrency'] || 0,
  },
  {
    label: 'Sender Currency',
    value: 'senderCurrency',
  },
  {
    label: 'Voucher Status',
    value: (record) =>
      record.status === 'BURNED'
        ? 'burned'
        : record.status === 'CLAIMED'
        ? 'redeemed'
        : 'unredeemed',
  },
];
