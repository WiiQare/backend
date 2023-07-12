import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getAllProvidersQueryBuilder } from './querybuilders/getAllProviders.qb';
import { ProviderDTO, ProviderSummaryDTO } from './dto/provider.dto';
import {
  getAllClaimedVouchersQueryBuilder,
  getAllRedeemedVouchersQueryBuilder,
  getAllUnclaimedVouchersQueryBuilder,
  getTotalBeneficiaryToProviderTransactionQueryBuilder,
  getNumberOfRegisteredProvidersQueryBuilder,
  getTotalBeneficiaryTransactionMadeWithinOneMonthQueryBuilder,
  getTotalBeneficiaryTransactionMadeWithinOneWeekQueryBuilder,
  getTotalBeneficiaryTransactionMadeWithinSixMonthsQueryBuilder,
  getTotalBeneficiaryTransactionMadeWithinThreeMonthsQueryBuilder,
  getTotalNumberOfUniqueBeneficiaryQueryBuilder,
} from './querybuilders/getProviderSummary.qb';

@Injectable()
export class ProviderService {
  constructor(private dataSource: DataSource) {}

  /**
   * Method used to get the list of all Providers
   * @param take number of records to select (for pagination)
   * @param skip number of records to skip (for pagination)
   * @returns
   */
  async findAllProviders(take = 10, skip = 0): Promise<Array<ProviderDTO>> {
    const providersRawData = await (
      await getAllProvidersQueryBuilder(this.dataSource)
    )
      .limit(take)
      .offset(skip)
      .orderBy(`"name"`)
      .getRawMany();

    const providersList: Array<ProviderDTO> = [];

    for (const {
      id,
      name,
      city,
      country,
      registrationDate,
      lastBeneficiaryProviderTransaction,
      totalNumberOfUniqueBeneficiaries,
      totalBeneficiaryProviderTransactionWithinOneWeek,
      totalBeneficiaryProviderTransactionWithinOneMonth,
      totalBeneficiaryProviderTransactionWithinThreeMonths,
      totalBeneficiaryProviderTransactionWithinSixMonths,
      totalBeneficiaryProviderTransaction,
      totalNumberOfReceivedVouchers,
      totalAmountOfReceivedVouchers,
      totalNumberOfUnclaimedVouchers,
      totalAmountOfUnclaimedVouchers,
      totalNumberOfClaimedVouchers,
      totalAmountOfClaimedVouchers,
      totalNumberOfRedeemedVouchers,
      totalAmountOfRedeemedVouchers,
    } of providersRawData) {
      const provider: ProviderDTO = {
        id,
        name,
        city,
        country,
        registrationDate,
        currency: 'EUR',
        lastBeneficiaryProviderTransaction:
          lastBeneficiaryProviderTransaction || '',
        totalNumberOfUniqueBeneficiaries: totalNumberOfUniqueBeneficiaries || 0,
        totalBeneficiaryProviderTransactionWithinOneWeek:
          totalBeneficiaryProviderTransactionWithinOneWeek || 0,
        totalBeneficiaryProviderTransactionWithinOneMonth:
          totalBeneficiaryProviderTransactionWithinOneMonth || 0,
        totalBeneficiaryProviderTransactionWithinThreeMonths:
          totalBeneficiaryProviderTransactionWithinThreeMonths || 0,
        totalBeneficiaryProviderTransactionWithinSixMonths:
          totalBeneficiaryProviderTransactionWithinSixMonths || 0,
        totalBeneficiaryProviderTransaction:
          totalBeneficiaryProviderTransaction || 0,
        receivedVouchers: {
          numberOfVouchers: totalNumberOfReceivedVouchers || 0,
          value: totalAmountOfReceivedVouchers || 0,
        },
        unclaimedVouchers: {
          numberOfVouchers: totalNumberOfUnclaimedVouchers || 0,
          value: totalAmountOfUnclaimedVouchers || 0,
        },
        claimedVouchers: {
          numberOfVouchers: totalNumberOfClaimedVouchers || 0,
          value: totalAmountOfClaimedVouchers || 0,
        },
        redeemedVouchers: {
          numberOfVouchers: totalNumberOfRedeemedVouchers || 0,
          value: totalAmountOfRedeemedVouchers || 0,
        },
      };

      providersList.push(provider);
    }

    return providersList;
  }
  /**
   * Gets global summary of all providers information
   * @returns
   */
  async getSummary() {
    const { numberOfRegisteredProviders } = await (
      await getNumberOfRegisteredProvidersQueryBuilder(this.dataSource)
    ).getRawOne();

    const {
      totalNumberOfBeneficiaryProviderTransactionWithinOneWeek,
      totalValueOfBeneficiaryProviderTransactionWithinOneWeek,
    } = await (
      await getTotalBeneficiaryTransactionMadeWithinOneWeekQueryBuilder(
        this.dataSource,
      )
    ).getRawOne();

    const {
      totalNumberOfBeneficiaryProviderTransactionWithinOneMonth,
      totalValueOfBeneficiaryProviderTransactionWithinOneMonth,
    } = await (
      await getTotalBeneficiaryTransactionMadeWithinOneMonthQueryBuilder(
        this.dataSource,
      )
    ).getRawOne();

    const {
      totalNumberOfBeneficiaryProviderTransactionWithinThreeMonths,
      totalValueOfBeneficiaryProviderTransactionWithinThreeMonths,
    } = await (
      await getTotalBeneficiaryTransactionMadeWithinThreeMonthsQueryBuilder(
        this.dataSource,
      )
    ).getRawOne();

    const {
      totalNumberOfBeneficiaryProviderTransactionWithinSixMonths,
      totalValueOfBeneficiaryProviderTransactionWithinSixMonths,
    } = await (
      await getTotalBeneficiaryTransactionMadeWithinSixMonthsQueryBuilder(
        this.dataSource,
      )
    ).getRawOne();

    const { totalBeneficiaryProviderTransaction } = await (
      await getTotalBeneficiaryToProviderTransactionQueryBuilder(
        this.dataSource,
      )
    ).getRawOne();

    const { totalNumberOfUniqueBeneficiaries } = await (
      await getTotalNumberOfUniqueBeneficiaryQueryBuilder(this.dataSource)
    ).getRawOne();

    const { totalNumberOfUnclaimedVouchers, totalAmountOfUnclaimedVouchers } =
      await (
        await getAllUnclaimedVouchersQueryBuilder(this.dataSource)
      ).getRawOne();

    const { totalNumberOfClaimedVouchers, totalAmountOfClaimedVouchers } =
      await (
        await getAllClaimedVouchersQueryBuilder(this.dataSource)
      ).getRawOne();

    const { totalNumberOfRedeemedVouchers, totalAmountOfRedeemedVouchers } =
      await (
        await getAllRedeemedVouchersQueryBuilder(this.dataSource)
      ).getRawOne();
    return {
      numberOfRegisteredProviders: numberOfRegisteredProviders || 0,
      totalBeneficiaryTransactionsWithinOneWeek: {
        numberOfTransactions:
          totalNumberOfBeneficiaryProviderTransactionWithinOneWeek || 0,
        value: totalValueOfBeneficiaryProviderTransactionWithinOneWeek || 0,
      },
      totalBeneficiaryTransactionsWithinOneMonth: {
        numberOfTransactions:
          totalNumberOfBeneficiaryProviderTransactionWithinOneMonth || 0,
        value: totalValueOfBeneficiaryProviderTransactionWithinOneMonth || 0,
      },
      totalBeneficiaryTransactionsWithinThreeMonths: {
        numberOfTransactions:
          totalNumberOfBeneficiaryProviderTransactionWithinThreeMonths || 0,
        value: totalValueOfBeneficiaryProviderTransactionWithinThreeMonths,
      },
      totalBeneficiaryTransactionsWithinSixMonths: {
        numberOfTransactions:
          totalNumberOfBeneficiaryProviderTransactionWithinSixMonths || 0,
        value: totalValueOfBeneficiaryProviderTransactionWithinSixMonths,
      },
      totalBeneficiaryProviderTransaction:
        totalBeneficiaryProviderTransaction || 0,
      totalNumberOfUniqueBeneficiaries: totalNumberOfUniqueBeneficiaries || 0,
      currency: 'EUR',
      unclaimedVouchers: {
        numberOfVouchers: totalNumberOfUnclaimedVouchers || 0,
        value: totalAmountOfUnclaimedVouchers || 0,
      },
      claimedVouchers: {
        numberOfVouchers: totalNumberOfClaimedVouchers || 0,
        value: totalAmountOfClaimedVouchers || 0,
      },
      redeemedVouchers: {
        numberOfVouchers: totalNumberOfRedeemedVouchers || 0,
        value: totalAmountOfRedeemedVouchers || 0,
      },
    } as ProviderSummaryDTO;
  }
}
