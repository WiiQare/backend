import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { getCountryNameFromCode } from '../_common_';
import { ChartDTO } from './dto/chart.dto';
import { getBeneficiariesChartInfoQueryBuilder } from './querybuilders/beneficiariesChart.qb';
import be from 'date-fns/esm/locale/be/index.js';
import { getPayersChartInfoQueryBuilder } from './querybuilders/payersChart.qb';

@Injectable()
export class ChartsService {
  constructor(private dataSource: DataSource) {}

  /**
   * Method used to retrieve list of active  payers ,total number of registered payers per country, and sorts them in descending order
   * @param take number of records
   * @returns
   */
  async findPayersChartInfo(take: number) {
    const payersChartRawData = await getPayersChartInfoQueryBuilder(
      this.dataSource,
    )
      .orderBy(`"registeredCount"`, 'DESC')
      .addOrderBy(`"activeCount"`, 'DESC')
      .limit(take)
      .getRawMany();

    return this.transformChartDTO(payersChartRawData) as Array<ChartDTO>;
  }

  /**
   * Method used to retrieve list of active beneficiaries ,total number of registered beneficiaries per country, and sorts them in descending order
   * @param take number of records
   * @returns
   */
  async findBeneficiariesChartInfo(take: number) {
    const beneficiaryChartRawData = await getBeneficiariesChartInfoQueryBuilder(
      this.dataSource,
    )
      .orderBy(`"registeredCount"`, 'DESC')
      .addOrderBy(`"activeCount"`, 'DESC')
      .limit(take)
      .getRawMany();
    return this.transformChartDTO(beneficiaryChartRawData) as Array<ChartDTO>;
  }

  /**
   * Transforms country code to its country name and set null active,registered count to zero
   */
  private transformChartDTO(chartRawData: Array<any>) {
    const transformedChartData = [];
    for (const { country, registeredCount, activeCount } of chartRawData) {
      transformedChartData.push({
        country: getCountryNameFromCode(country),
        registeredCount: registeredCount || 0,
        activeCount: activeCount || 0,
      });
    }
    return transformedChartData;
  }
}
