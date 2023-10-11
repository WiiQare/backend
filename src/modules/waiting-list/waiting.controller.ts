import {
    Body,
    Controller,
    Post
  } from '@nestjs/common';
  import { ApiOperation, ApiTags } from '@nestjs/swagger';
  import { _403, _404, _409 } from '../../common/constants/errors';
import { CreateWaitingDto } from './dto/waiting.dto';
import { WaitingService } from './waiting.service';
import { Public } from 'src/common/decorators/public.decorator';
  
  @ApiTags('Waitings')
  @Controller('waitings')
  export class WaitingController {
      constructor(private readonly waitingService: WaitingService) {}
      
    @Post()
    @Public()
    @ApiOperation({ summary: 'Add a new person on waiting list for test wiiqare app' })
    async add(@Body() waitingDto: CreateWaitingDto) {
      return await this.waitingService.add(waitingDto);
    }

  }
  