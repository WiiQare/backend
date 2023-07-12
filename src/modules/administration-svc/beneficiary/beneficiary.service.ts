import { Injectable } from '@nestjs/common';
import { getCountryNameFromCode } from '../_common_';
import { DataSource } from 'typeorm';
import { BeneficiaryDTO, BeneficiarySummaryDTO } from './dto/beneficiary.dto';
import { getAllBeneficiariesQueryBuilder } from './querybuilders/getAllbeneficiary.qb';
import {
  getActiveBeneficiariesQueryBuilder,
  getBeneficiaryToProviderTransactionsQueryBuilder,
  getNumberOfRegisteredBeneficiariesQueryBuilder,
  getPendingVouchersForAllBeneficiariesQueryBuilder,
  getRedeemedVouchersForAllBeneficiariesQueryBuilder,
} from './querybuilders/getBeneficiarySummary.qb';

@Injectable()
export class BeneficiaryService {
  constructor(private dataSource: DataSource) {}

  /**
   * Method used to get a list of All beneficiaries
   * @param take number of records to select (for pagination)
   * @param skip  number of records to skip (for pagination)
   * @returns
   */
  async findAllBeneficiaries(
    take = 10,
    skip = 0,
  ): Promise<Array<BeneficiaryDTO>> {
    const beneficiariesRawData = await (
      await getAllBeneficiariesQueryBuilder(this.dataSource)
    )
      .orderBy('"name"')
      .limit(take)
      .offset(skip)
      .getRawMany();

    const beneficiaries: Array<BeneficiaryDTO> = [];

    for (const {
      id,
      name,
      country,
      registrationDate,
      totalNumberOfDistinctPayers,
      totalNumberOfDistinctProviders,
      totalPayment,
      totalPaymentCount,
      numberOfActiveVouchers,
      totalAmountOfActiveVouchers,
      numberOfPendingVouchers,
      totalAmountOfPendingVouchers,
      numberOfUnclaimedVouchers,
      totalAmountOfUnclaimedVouchers,
      numberOfRedeemedVouchers,
      totalAmountOfRedeemedVouchers,
    } of beneficiariesRawData) {
      const beneficiary: BeneficiaryDTO = {
        id,
        name,
        country: getCountryNameFromCode(country) || '',
        registrationDate,
        lastActivityOn: '',
        totalNumberOfDistinctPayers: totalNumberOfDistinctPayers || 0,
        totalNumberOfDistinctProviders: totalNumberOfDistinctProviders || 0,
        currency: 'EUR',
        totalPayment: {
          numberOfPayments: totalPaymentCount || 0,
          value: totalPayment || 0,
        },
        activeVouchers: {
          numberOfVouchers: numberOfActiveVouchers || 0,
          value: totalAmountOfActiveVouchers || 0,
        },
        pendingVouchers: {
          numberOfVouchers: numberOfPendingVouchers || 0,
          value: totalAmountOfPendingVouchers || 0,
        },
        unclaimedVouchers: {
          numberOfVouchers: numberOfUnclaimedVouchers || 0,
          value: totalAmountOfUnclaimedVouchers || 0,
        },
        redeemedVouchers: {
          numberOfVouchers: numberOfRedeemedVouchers || 0,
          value: totalAmountOfRedeemedVouchers || 0,
        },
      };
      beneficiaries.push(beneficiary);
    }

    return beneficiaries;
  }

  /**
   * Method used to get a global summary of all beneficiaries information
   * @returns
   */
  async getSummary(): Promise<BeneficiarySummaryDTO> {
    const { numberOfRegisteredBeneficiaries } = await (
      await getNumberOfRegisteredBeneficiariesQueryBuilder(this.dataSource)
    ).getRawOne();

    const { numberOfPendingVouchers, totalAmountOfPendingVouchers } = await (
      await getPendingVouchersForAllBeneficiariesQueryBuilder(this.dataSource)
    ).getRawOne();

    const { numberOfRedeemedVouchers, totalAmountOfRedeemedVouchers } = await (
      await getRedeemedVouchersForAllBeneficiariesQueryBuilder(this.dataSource)
    ).getRawOne();
    const { numberOfProviderTransactions, totalAmountOfProviderTransactions } =
      await (
        await getBeneficiaryToProviderTransactionsQueryBuilder(this.dataSource)
      ).getRawOne();
    const { numberOfActiveBeneficiaries } = await (
      await getActiveBeneficiariesQueryBuilder(this.dataSource)
    ).getRawOne();

    return {
      numberOfRegisteredBeneficiaries: numberOfRegisteredBeneficiaries || 0,
      pendingVouchers: {
        numberOfVouchers: numberOfPendingVouchers || 0,
        value: totalAmountOfPendingVouchers || 0,
      },
      redeemedVouchers: {
        numberOfVouchers: numberOfRedeemedVouchers || 0,
        value: totalAmountOfRedeemedVouchers || 0,
      },
      totalProviderTransactions: {
        numberOfPayments: numberOfProviderTransactions || 0,
        value: totalAmountOfProviderTransactions || 0,
      },
      numberOfActiveBeneficiaries: numberOfActiveBeneficiaries || 0,
      voucherCurrencies: 'EUR',
    } as BeneficiarySummaryDTO;
  }
}
