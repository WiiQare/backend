import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SavingService } from './saving.service';
import { CreateSavingDto } from './dto/saving.dto';

@ApiTags('Savings')
@Controller('savings')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new saving for user' })
  async add(@Body() savingDto: CreateSavingDto) {
    return await this.savingService.add(savingDto);
  }

  @Get('/:userId')
  @ApiOperation({ summary: 'All savings for user' })
  async retrieving(@Param('userId') userId: string) {
    return await this.savingService.retrieving(userId);
  }
}
