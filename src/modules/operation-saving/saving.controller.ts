import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
