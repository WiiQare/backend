import { getCountryNameFromCode } from '../../_helpers_';

export const beneficiaryFields = [
  {
    label: 'Beneficiary Id',
    value: 'id',
  },
  {
    label: 'Full Name',
    value: 'name',
  },
  {
    label: 'Country',
    value: (record) => getCountryNameFromCode(record['country']),
  },
  {
    label: 'Registration Date',
    value: 'registrationDate',
  },
  {
    label: 'Number of Distinct Payers',
    value: (record) => record['totalNumberOfDistinctPayers'] || 0,
  },
  {
    label: 'Number of Distinct Providers',
    value: (record) => record['totalNumberOfDistinctProviders'] || 0,
  },
  {
    label: 'Number of Payments ',
    value: (record) => record['totalPaymentCount'] || 0,
  },
  {
    label: 'Total Amount of Payments',
    value: (record) => record['totalPayment'] || 0,
  },
  {
    label: 'Number of Active Vouchers',
    value: (record) => record['numberOfActiveVouchers'] || 0,
  },
  {
    label: 'Total Amount of Active Vouchers',
    value: (record) => record['totalAmountOfActiveVouchers'] || 0,
  },
  {
    label: 'Number of Pending Vouchers',
    value: (record) => record['numberOfPendingVouchers'] || 0,
  },
  {
    label: 'Total Amount of Pending Vouchers',
    value: (record) => record['totalAmountOfPendingVouchers'] || 0,
  },
  {
    label: 'Number Of Unclaimed Vouchers',
    value: (record) => record['numberOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Total Amount of Unclaimed Vouchers',
    value: (record) => record['totalAmountOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Number Of Redeemed Vouchers',
    value: (record) => record['numberOfRedeemedVouchers'] || 0,
  },
  {
    label: 'Total Amount of Redeemed Vouchers',
    value: (record) => record['totalAmountOfRedeemedVouchers'] || 0,
  },
];
