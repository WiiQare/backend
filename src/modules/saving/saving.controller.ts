import {
    Body,
    ConflictException,
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
  } from '@nestjs/common';
  import { ApiOperation, ApiTags } from '@nestjs/swagger';
  import { _403, _404, _409 } from '../../common/constants/errors';
import { SavingService } from './saving.service';
import { CreateSavingDto } from './dto/saving.dto';
  
  @ApiTags('Savings')
  @Controller('savings')
  export class SavingController {
    constructor( private readonly savingService: SavingService) {}

    @Post()
    @ApiOperation({summary: 'Add a new saving for user'})
    async add(
      @Body() savingDto: CreateSavingDto
    ) {
      return await this.savingService.add(savingDto)
    }

    @Get('/:userId')
    @ApiOperation({summary: 'All savings for user'})
    async retrieving(
      @Param('userId') userId: string
    ) {
      return await this.savingService.retrieving(userId);
    }
    
}