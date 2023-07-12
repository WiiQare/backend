import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PayerDTO, PayerSummaryDTO } from './dto/payers.dto';
import {
  getAllPayersPendingVouchersInfoQueryBuilder,
  getAllPayersPurchasedVouchersInfoQueryBuilder,
  getAllPayersRedeemedVouchersInfoQueryBuilder,
  getNumberOfActivePayersQueryBuilder,
  getNumberOfRegisteredPayersQueryBuilder,
} from './querybuilders/getPayerSummary.qb';
import { getAllPayersQueryBuilder } from './querybuilders/getAllPayers.qb';
import { getCountryNameFromCode } from '../_common_';

@Injectable()
export class PayerService {
  constructor(private dataSource: DataSource) {}
  /**
   * This method is used to get global summary of payers related vouchers information
   * @returns
   */
  async getSummary(): Promise<PayerSummaryDTO> {
    // total number of registered payers
    const { numberOfRegisteredPayers } = await (
      await getNumberOfRegisteredPayersQueryBuilder(this.dataSource)
    ).getRawOne();
    //number of purchased vouchers
    const { totalNumberOfPurchasedVouchers, totalValueOfPurchasedVouchers } =
      await (
        await getAllPayersPurchasedVouchersInfoQueryBuilder(this.dataSource)
      ).getRawOne();

    //total number of pending vouchers
    const { totalNumberOfPendingVouchers, totalValueOfPendingVouchers } =
      await (
        await getAllPayersPendingVouchersInfoQueryBuilder(this.dataSource)
      ).getRawOne();

    // total Number of redeemed vouchers
    const { totalNumberOfRedeemedVouchers, totalValueOfRedeemedVouchers } =
      await (
        await getAllPayersRedeemedVouchersInfoQueryBuilder(this.dataSource)
      ).getRawOne();
    // Total number of Active Payers

    const { numberOfActivePayers } = await (
      await getNumberOfActivePayersQueryBuilder(this.dataSource)
    ).getRawOne();

    return {
      numberOfActivePayers: numberOfActivePayers || 0,
      numberOfRegisteredPayers: numberOfRegisteredPayers || 0,
      pendingVouchers: {
        numberOfVouchers: totalNumberOfPendingVouchers || 0,
        value: totalValueOfPendingVouchers || 0,
      },
      purchasedVouchers: {
        numberOfVouchers: totalNumberOfPurchasedVouchers || 0,
        value: totalValueOfPurchasedVouchers || 0,
      },
      redeemedVouchers: {
        numberOfVouchers: totalNumberOfRedeemedVouchers || 0,
        value: totalValueOfRedeemedVouchers || 0,
      },
      currency: 'EUR',
    } as PayerSummaryDTO;
  }

  /**
   * This method is used to get all recap of all payers like name, country, all beneficiaries of every payer, etc
   * @returns
   */
  async findAllPayers(take = 10, skip = 0): Promise<PayerDTO[]> {
    const payerRawData = await (await getAllPayersQueryBuilder(this.dataSource))
      .orderBy(`"name"`)
      .limit(take)
      .offset(skip)
      .getRawMany();

    const payersList: PayerDTO[] = [];

    for (const {
      id,
      name,
      country,
      registrationDate,
      uniqueBeneficiaryCount,
      totalNumberOfPurchasedVouchers,
      totalAmountOfPurchasedVouchers,
      totalNumberOfPendingVouchers,
      totalAmountOfPendingVouchers,
      totalNumberOfUnclaimedVouchers,
      totalAmountOfUnclaimedVouchers,
      totalNumberOfRedeemedVouchers,
      totalAmountOfRedeemedVouchers,
    } of payerRawData) {
      const payer: PayerDTO = {
        id,
        name,
        country: getCountryNameFromCode(country) || '',
        registrationDate,
        lastActivityOn: '',
        uniqueBeneficiaryCount: uniqueBeneficiaryCount || 0,
        currency: 'EUR',
        purchasedVouchers: {
          numberOfVouchers: totalNumberOfPurchasedVouchers || 0,
          value: totalAmountOfPurchasedVouchers || 0,
        },
        pendingVouchers: {
          numberOfVouchers: totalNumberOfPendingVouchers || 0,
          value: totalAmountOfPendingVouchers || 0,
        },
        unclaimedVouchers: {
          numberOfVouchers: totalNumberOfUnclaimedVouchers || 0,
          value: totalAmountOfUnclaimedVouchers || 0,
        },
        redeemedVouchers: {
          numberOfVouchers: totalNumberOfRedeemedVouchers || 0,
          value: totalAmountOfRedeemedVouchers || 0,
        },
        vouchersNotSent: {
          numberOfVouchers: 0,
          value: 0,
        },
      };

      payersList.push(payer);
    }
    return payersList;
  }
}
