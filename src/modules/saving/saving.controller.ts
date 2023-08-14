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
    @ApiOperation({summary: 'Save'})
    add(
      @Body() savingDto: CreateSavingDto
    ) {
      return this.savingService.add(savingDto)
    }
}