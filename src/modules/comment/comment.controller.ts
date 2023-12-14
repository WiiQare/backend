import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { _403, _404, _409 } from '../../common/constants/errors';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateCommentDto } from './dto/comment.dto';
import { CommentService } from './comment.service';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post()
    @Public()
    @ApiOperation({ summary: 'Save comment a blog' })
    async add(@Body() blogDto: CreateCommentDto) {
        return await this.commentService.add(blogDto);
    }
}