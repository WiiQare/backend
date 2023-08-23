import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PayerPaymentsDTO,
  ProviderPaymentsDTO,
  PaymentSummaryDTO,
} from './dto/payment.dto';
import { UserRole } from '../../../common/constants/enums';
import { Roles } from '../../../common/decorators/user-role.decorator';

@ApiTags('admin/payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('summary')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  @ApiOperation({
    summary: 'API endpoint to get summary list of all Payments informations',
  })
  getSummary(): Promise<PaymentSummaryDTO> {
    return this.paymentService.getSummary();
  }

  @Get('payers')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  @ApiOperation({
    summary: 'This API is used retrieve list of payments received from payer.',
  })
  async getPaymentsFromPayer(
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ): Promise<PayerPaymentsDTO[]> {
    return await this.paymentService.getPaymentsFromPayer(take, skip);
  }

  @Get('providers')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  // @Public()
  @ApiOperation({
    summary: 'This API is used retrieve list of payments due to provider.',
  })
  async getPaymentsDueProvider(
    @Query('take', ParseIntPipe) take: number,
    @Query('skip', ParseIntPipe) skip: number,
  ): Promise<ProviderPaymentsDTO[]> {
    return await this.paymentService.getPaymentsDueProvider(take, skip);
  }
}
