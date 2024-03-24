import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { _404 } from '../../common/constants/errors';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/blog.dto';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) { }

  async add(blog: CreateBlogDto): Promise<Blog> {
    const newBlog = this.blogRepository.create({
      title: blog.title,
      slug: slugify(blog.title, { lower: true }),
      content: blog.content,
      quote: blog.quote,
      tags: blog.tags,
      cover: blog.cover,
    });

    return this.blogRepository.save(newBlog);
  }

  async getAll(): Promise<Blog[]> {
    return await this.blogRepository.find();
  }

  async getBlogDetailsWithComments(slug: string): Promise<any> {
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.comments', 'comments')
      .where('blog.slug = :slug', { slug })
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    const last = await this.blogRepository.find({
      where: { slug: Not(slug) },
      take: 3, // Récupère les trois derniers blogs
      order: {
        createdAt: 'DESC', // Trie par date de création décroissante
      },
    });

    return { blog, last };
  }
}
