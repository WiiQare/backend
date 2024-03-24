import {
  Body,
  Controller,
  Get,
  Param,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { _403, _404, _409 } from '../../common/constants/errors';
import { Public } from '../../common/decorators/public.decorator';
import { CreateBlogDto } from './dto/blog.dto';
import { BlogService } from './blog.service';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Save new blog information' })
  async add(@Body() blogDto: CreateBlogDto) {
    return await this.blogService.add(blogDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all blog saved' })
  async getAll() {
    return await this.blogService.getAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get details for this one' })
  async getBySlug(@Param('slug') slug: string) {
    return await this.blogService.getBlogDetailsWithComments(slug);
  }

}
