import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/enums';
import { Roles } from 'src/common/decorators/user-role.decorator';
import { ChartDTO } from './dto/chart.dto';

@ApiTags('admin/charts')
@Controller('charts')
export class ChartsController {
  constructor(private chartService: ChartsService) {}

  @Get('payers')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  @ApiOperation({
    summary:
      'API endpoint to get informations used for  payer chart on the homepage of dashboard',
    description:
      'Gathers information of countries with most registered and active payers per country',
  })
  async getPayersChartInfo(
    @Query('take', ParseIntPipe) take: number,
  ): Promise<ChartDTO[]> {
    return await this.chartService.findPayersChartInfo(take);
  }

  @Get('beneficiaries')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  @ApiOperation({
    summary:
      'API endpoint to get informations used for beneficiary chart on the homepage of dashboard',
    description:
      'Gathers information of countries with most registered and active payers and beneficiaries respectively',
  })
  async getBeneficiaryChartInfo(
    @Query('take', ParseIntPipe) take: number,
  ): Promise<ChartDTO[]> {
    return await this.chartService.findBeneficiariesChartInfo(take);
  }
}
