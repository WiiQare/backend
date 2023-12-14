import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { _404 } from '../../common/constants/errors';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { Blog } from '../blog/entities/blog.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Blog)
        private blogRepository: Repository<Blog>,

    ) { }

    async add(comment: CreateCommentDto): Promise<Comment> {

        const blog = await this.blogRepository.findOne({ where: { slug: comment.blog } });

        const newComment = this.commentRepository.create({
            fullname: comment.fullname,
            email: comment.email,
            comment: comment.comment,
            blog: blog
        });

        return this.commentRepository.save(newComment);

    }
}