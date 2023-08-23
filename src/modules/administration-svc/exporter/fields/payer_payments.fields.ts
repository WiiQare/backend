import { getCountryNameFromCode } from '../../_helpers_';

export const payerPaymentFields = [
  {
    label: 'Transaction ID',
    value: 'id',
  },
  {
    label: 'Transaction Date',
    value: 'transactionDate',
  },
  {
    label: 'Payment Amount',
    value: (record) => record['senderAmount'] || 0,
  },
  {
    label: "Payer's Country",
    value: (record) => getCountryNameFromCode(record['payerCountry']),
  },
  {
    label: "Patient's Country",
    value: (record) => getCountryNameFromCode(record['patientCountry']),
  },
];
