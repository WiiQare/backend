import { Injectable, StreamableFile } from '@nestjs/common';
import { getAllPayersQueryBuilder } from '../payer/querybuilders/getAllPayers.qb';
import { DataSource } from 'typeorm';
import { getAllBeneficiariesQueryBuilder } from '../beneficiary/querybuilders/getAllbeneficiary.qb';
import { AsyncParser, ParserOptions } from '@json2csv/node';
import { PageName } from '../_common_';
import { getAllProvidersQueryBuilder } from '../provider/querybuilders/getAllProviders.qb';
import { getAllVouchersQueryBuilder } from '../voucher/querybuilders/getAllVouchers.qb';
import { getAllPayerPaymentsQueryBuilder } from '../payment/querybuilders/getPaymentsFromPayer.qb';
import { getAllProviderPaymentQueryBuilder } from '../payment/querybuilders/getPaymentsDueProvider.qb';
import { beneficiaryFields } from './fields/beneficiary.fields';
import { payerFields } from './fields/payer.fields';
import { providerFields } from './fields/provider.fields';
import { voucherFields } from './fields/voucher.fields';
import { payerPaymentFields } from './fields/payer_payments.fields';
import { providerPaymentFields } from './fields/provider_payments.fields';

@Injectable()
export class ExporterService {
  constructor(private dataSource: DataSource) {}
  private getQueryBuilder(pageName: string) {
    switch (pageName) {
      case PageName.BENEFICIARY:
        return getAllBeneficiariesQueryBuilder(this.dataSource).orderBy(
          '"name"',
        );
      case PageName.PAYER:
        return getAllPayersQueryBuilder(this.dataSource).orderBy('"name"');
      case PageName.PROVIDER:
        return getAllProvidersQueryBuilder(this.dataSource).orderBy('"name"');
      case PageName.VOUCHER:
        return getAllVouchersQueryBuilder(this.dataSource).orderBy(
          '"VoucherId"',
        );
      case PageName.PAYER_PAYMENT:
        return getAllPayerPaymentsQueryBuilder(this.dataSource);
      case PageName.PROVIDER_PAYMENT:
        return getAllProviderPaymentQueryBuilder(this.dataSource);
    }
  }

  private getFields(pageName) {
    switch (pageName) {
      case PageName.BENEFICIARY:
        return beneficiaryFields;
      case PageName.PAYER:
        return payerFields;
      case PageName.PROVIDER:
        return providerFields;
      case PageName.VOUCHER:
        return voucherFields;
      case PageName.PAYER_PAYMENT:
        return payerPaymentFields;
      case PageName.PROVIDER_PAYMENT:
        return providerPaymentFields;
    }
  }

  async getFile(pageName: string): Promise<StreamableFile> {
    const opts: ParserOptions = {
      fields: this.getFields(pageName),
    };
    const Json2CsvParser = new AsyncParser(opts);
    const csvDataStream = await Json2CsvParser.parse(
      await this.getQueryBuilder(pageName).getRawMany(),
    );
    return new StreamableFile(csvDataStream);
  }
}
