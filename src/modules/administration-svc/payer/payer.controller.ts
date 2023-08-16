import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { PayerService } from './payer.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
//import { Public } from 'src/common/decorators/public.decorator';
import { PayerDTO, PayerSummaryDTO } from './dto/payers.dto';
import { UserRole } from 'src/common/constants/enums';
import { Roles } from 'src/common/decorators/user-role.decorator';

@ApiTags('admin/payers')
@Controller('payers')
export class PayerController {
  constructor(private readonly payerService: PayerService) {}

  @Get('summary')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  //@Public()
  @ApiOperation({
    summary: 'API endpoint to get summary list of all Payers informations',
  })
  getSummary(): Promise<PayerSummaryDTO> {
    return this.payerService.getSummary();
  }

  @Get()
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  // @Public()
  @ApiOperation({
    summary: 'This API is used retrieve Migrant Payers List.',
  })
  async getAllPayers(
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ): Promise<PayerDTO[]> {
    return await this.payerService.findAllPayers(take, skip);
  }
}
