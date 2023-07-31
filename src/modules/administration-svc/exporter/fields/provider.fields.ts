import { getCountryNameFromCode } from '../../_helpers_/index';
export const providerFields = [
  {
    label: 'Provider ID',
    value: 'id',
  },
  {
    label: 'Name',
    value: 'name',
  },
  {
    label: 'City',
    value: 'city',
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
    label: 'Last Beneficiary-Provider transaction',
    value: 'lastBeneficiaryProviderTransactionOn',
  },
  {
    label: 'Number Of Unique Beneficiaries',
    value: (record) => record['totalNumberOfUniqueBeneficiaries'] || 0,
  },
  {
    label: 'Total Transactions Within 1 week',
    value: (record) =>
      record['totalBeneficiaryProviderTransactionWithinOneWeek'] || 0,
  },
  {
    label: 'Total Transactions Within 1 Month',
    value: (record) =>
      record['totalBeneficiaryProviderTransactionWithinOneMonth'],
  },
  {
    label: 'Total Transactions Within 3 Month',
    value: (record) =>
      record['totalBeneficiaryProviderTransactionWithinThreeMonth'] || 0,
  },
  {
    label: 'Total Transactions Within 6 Month',
    value: (record) =>
      record['totalBeneficiaryProviderTransactionWithinSixMonths'] || 0,
  },
  {
    label: 'Total Beneficiary-Provider Transaction',
    value: (record) => record['totalBeneficiaryProviderTransaction'] || 0,
  },
  {
    label: 'Number Of Received Vouchers',
    value: (record) => record['totalNumberOfReceivedVouchers'] || 0,
  },
  {
    label: 'Amount Of Received Vouchers',
    value: (record) => record['totalAmountOfReceivedVouchers'] || 0,
  },
  {
    label: 'Number Of Unclaimed Vouchers',
    value: (record) => record['totalNumberOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Total Amount of Unclaimed Vouchers',
    value: (record) => record['totalAmountOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Number Of Claimed Vouchers',
    value: (record) => record['totalNumberOfClaimedVouchers'] || 0,
  },
  {
    label: 'Total Amount Of Claimed Vouchers',
    value: (record) => record['totalAmountOfClaimedVouchers'] || 0,
  },
  {
    label: 'Number Of Redeemed Vouchers',
    value: (record) => record['totalNumberOfRedeemedVouchers'] || 0,
  },
  {
    label: 'Amount Of Redeemed Vouchers',
    value: (record) => record['totalAmountOfRedeemedVouchers'] || 0,
  },
];
