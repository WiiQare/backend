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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { _403, _404, _409 } from '../../common/constants/errors';
import { CachingService } from '../caching/caching.service';
import { SessionService } from '../session/session.service';

@ApiTags('Operations')
@Controller('operations')
export class OperationController {
  constructor(
    private readonly cachingService: CachingService,
    private readonly sessionService: SessionService,
  ) {}
}
