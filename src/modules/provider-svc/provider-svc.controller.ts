import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Provider,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../common/constants/enums';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/user-role.decorator';
import {
  AddServiceToPackageDto,
  AuthorizeVoucherTransferDto,
  CreatePackageDto,
  CreateServiceDto,
  ProviderValidateEmailDto,
  RedeemVoucherDto,
  RegisterProviderDto,
  SearchTransactionDto,
} from './dto/provider.dto';
import { ProviderService } from './provider-svc.service';
import { Service } from './entities/service.entity';
import { Package } from './entities/package.entity';

@ApiTags('Provider')
@Controller('provider')
export class ProviderController {
  constructor(private providerService: ProviderService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiBody({
    description: 'The required payload',
    type: RegisterProviderDto,
  })
  @ApiOperation({ summary: 'API endpoint for registering provider' })
  registerNewProvider(
    @Body() registerProviderDto: RegisterProviderDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<Record<string, any>> {
    return this.providerService.registerNewProvider(logo, registerProviderDto);
  }

  @Post('send-email-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint for Provider to verify email' })
  verifyProviderEmail(
    @Body() providerValidateEmailDto: ProviderValidateEmailDto,
  ): Promise<void> {
    return this.providerService.providerVerifyEmail(providerValidateEmailDto);
  }

  @Get('provider-voucher-details')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'API endpoint is used to retrieve the voucher details  by TxNo shortened hash, It sends also the transaction verification code to patient',
  })
  getVoucherDetailsByTxNoShortenedHash(
    @Query('shortenHash') shortenHash: string,
  ): Promise<Record<string, any>> {
    return this.providerService.getTransactionByShortenHash(shortenHash);
  }

  @Post('provider-authorize-voucher-transfer')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'API endpoint is used to voucher transfer from Patient to Provider',
  })
  providerAuthorizeVoucherTransfer(
    @Body() payload: AuthorizeVoucherTransferDto,
  ): Promise<Record<string, any>> {
    const { shortenHash, providerId, securityCode } = payload;
    return this.providerService.authorizeVoucherTransfer(
      shortenHash,
      providerId,
      securityCode,
    );
  }

  @Post('redeem-voucher')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API endpoint is used to redeem vouchers by provider',
  })
  redeemVoucherByProvider(
    @Body() payload: RedeemVoucherDto,
  ): Promise<Record<string, any>[]> {
    const { transactionHashes } = payload;
    return this.providerService.redeemVoucher(transactionHashes);
  }

  @Get('transactions')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'API endpoint is used to retrieve all transaction for a given provider.',
  })
  getAllTransactionByProviderId(
    @Query() payload: SearchTransactionDto,
  ): Promise<Record<string, any>[]> {
    const { providerId } = payload;
    return this.providerService.getAllTransactions(providerId);
  }

  @Get('statistics')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API endpoint is used to retrieve transaction statistics',
  })
  getTransactionStatistics(
    @Query() payload: SearchTransactionDto,
  ): Promise<Record<string, any>> {
    const { providerId } = payload;
    return this.providerService.getTransactionStatistic(providerId);
  }

  @Post('service')
  @Post('/service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint for Provider to create service' })
  createService(@Body() serviceDto: CreateServiceDto): Promise<Service> {
    return this.providerService.addServiceToProvider(serviceDto);
  }

  @Get(':providerId/service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint to retrieve services of Provider' })
  getServicesByProviderId(
    @Param('providerId') providerId: string,
  ): Promise<Service[]> {
    return this.providerService.getServicesByProviderId(providerId);
  }

  @Post(':providerId/package')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint for Provider to create package' })
  createPackage(
    @Param('providerId') providerId: string,
    @Body() packageDto: CreatePackageDto,
  ): Promise<Package> {
    packageDto.providerId = providerId;
    return this.providerService.addPackageToProvider(packageDto);
  }

  @Get(':providerId/package')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint to retrieve packages of Provider' })
  getPackagesByProviderId(
    @Param('providerId') providerId: string,
  ): Promise<Package[]> {
    return this.providerService.getPackagesByProviderId(providerId);
  }

  @Post(':providerId/package/add-service')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API endpoint for Provider to add service to package',
  })
  addServiceToPackage(
    @Param('providerId') providerId: string,
    @Body() addServiceToPackageDto: AddServiceToPackageDto,
  ): Promise<void> {
    addServiceToPackageDto.providerId = providerId;
    return this.providerService.addServiceToPackage(addServiceToPackageDto);
  }

  @Get('/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API endpoint to retrieve Provider' })
  getListProvider(): Promise<Provider[]> {
    return this.providerService.listProvider();
  }
}
