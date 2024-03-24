import {
  Body,
  Controller,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { _403, _404, _409 } from '../../common/constants/errors';
import { ContactService } from './contact.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreateContactDto } from './dto/contact.dto';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Save contact information' })
  async add(@Body() contactDto: CreateContactDto) {
    return await this.contactService.add(contactDto);
  }

}
