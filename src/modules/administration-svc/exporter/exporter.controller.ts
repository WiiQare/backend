import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExporterService } from './exporter.service';
import { PageName } from '../_common_';
import { UserRole } from 'src/common/constants/enums';
import { Roles } from 'src/common/decorators/user-role.decorator';

@ApiTags('admin/export')
@Controller('export')
export class ExporterController {
  constructor(private readonly exporterService: ExporterService) {}

  @Get(':page')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="data.csv"')
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER)
  @ApiOperation({
    summary: 'API endpoint use to download  data in a csv file',
  })
  async getCSVFile(@Param('page') page: string) {
    if (
      ![
        PageName.BENEFICIARY,
        PageName.PAYER,
        PageName.PROVIDER,
        PageName.VOUCHER,
        PageName.PAYER_PAYMENT,
        PageName.PROVIDER_PAYMENT,
      ].includes(page as PageName)
    )
      throw new NotFoundException(`Resource to export '${page}' not found`);
    return await this.exporterService.getFile(page);
  }
}
