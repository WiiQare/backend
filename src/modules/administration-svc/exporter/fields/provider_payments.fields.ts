export const providerPaymentFields = [
  {
    label: 'Transaction ID',
    value: 'id',
  },
  {
    label: 'Transaction Date',
    value: 'transactionDate',
  },
  {
    label: 'Provider ID',
    value: 'providerId',
  },
  {
    label: "Provider's Name",
    value: 'providerName',
  },
  {
    label: "Provider's City",
    value: 'providerCity',
  },
  {
    label: "Provider's Country",
    value: 'providerCountry',
  },
  {
    label: 'Amount - Local Currency',
    value: (record) => record['amountInLocalCurrency'] || 0,
  },
  {
    label: 'Amount - Sender Currency',
    value: (record) => record['amountInSenderCurrency'] || 0,
  },
];
