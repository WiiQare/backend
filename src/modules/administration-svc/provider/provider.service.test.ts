import { DataSource } from 'typeorm';
import { ProviderService } from './provider.service';
import * as ProviderSummary from './querybuilders/getProviderSummary.qb';

describe('ProviderService', () => {
  let service: ProviderService;

  beforeEach(async () => {
    const dataSource: DataSource = {} as DataSource;
    service = new ProviderService(dataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return provider summary', async () => {
    jest
      .spyOn(
        ProviderSummary,
        'getTotalBeneficiaryTransactionMadeWithinOneWeekQueryBuilder',
      )
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(
        ProviderSummary,
        'getTotalBeneficiaryTransactionMadeWithinOneMonthQueryBuilder',
      )
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(
        ProviderSummary,
        'getTotalBeneficiaryTransactionMadeWithinThreeMonthsQueryBuilder',
      )
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(
        ProviderSummary,
        'getTotalBeneficiaryToProviderTransactionQueryBuilder',
      )
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getTotalNumberOfUniqueBeneficiaryQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getAllUnclaimedVouchersQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getAllClaimedVouchersQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getAllRedeemedVouchersQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getNumberOfRegisteredProvidersQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(
        ProviderSummary,
        'getTotalBeneficiaryTransactionMadeWithinSixMonthsQueryBuilder',
      )
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);

    jest
      .spyOn(ProviderSummary, 'getTotalVouchersQueryBuilder')
      .mockReturnValue({
        getRawOne: jest.fn().mockResolvedValue({}),
      } as any);
    const summary = await service.getSummary();
    expect(summary).toBeDefined();
  });
});
