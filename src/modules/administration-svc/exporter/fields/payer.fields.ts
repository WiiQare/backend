import { getCountryNameFromCode } from '../../_helpers_';

export const payerFields = [
  {
    label: 'Payer ID',
    value: 'id',
  },
  {
    label: 'Full Name',
    value: 'name',
  },
  {
    label: 'Country',
    value: (record) => getCountryNameFromCode(record.country),
  },
  {
    label: 'Registration Date',
    value: 'registrationDate',
  },
  {
    label: 'Last Activity On',
    value: '',
  },
  {
    label: 'Number Of Unique Beneficiaries ',
    value: (record) => record['uniqueBeneficiaryCount'] || 0,
  },
  {
    label: 'Number Of Purchased Vouchers',
    value: (record) => record['totalNumberOfPurchasedVouchers'] || 0,
  },
  {
    label: 'Total Amount Of Purchased Vouchers',
    value: (record) => record['totalAmountOfPurchasedVouchers'] || 0,
  },
  {
    label: 'Number of Pending Vouchers',
    value: (record) => record['totalNumberOfPendingVouchers'] || 0,
  },
  {
    label: 'Total Amount Of Pending Vouchers',
    value: (record) => record['totalAmountOfPendingVouchers'] || 0,
  },
  {
    label: 'Number Of Unclaimed Vouchers',
    value: (record) => record['totalNumberOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Total Amount Of Unclaimed Vouchers',
    value: (record) => record['totalAmountOfUnclaimedVouchers'] || 0,
  },
  {
    label: 'Number Of Redeemed Vouchers',
    value: (record) => record['totalNumberOfRedeemedVouchers'] || 0,
  },
  {
    label: 'Total Amount Of Redeemed Vouchers',
    value: (record) => record['totalAmountOfRedeemedVouchers'] || 0,
  },
];
