import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { Blog } from '../blog/entities/blog.entity';
import { CreateCommentDto } from './dto/comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let blogRepository: Repository<Blog>;
  const mockComment: CreateCommentDto = {
    fullname: 'testing the comments',
    comment: 'comment test',
    email: 'test@gg.com',
    blog: 'a random blog',
  };

  beforeEach(async () => {
    commentRepository = {
      create: jest.fn().mockReturnValue(mockComment),
      save: jest.fn().mockReturnValue(mockComment),
      findOne: jest.fn().mockReturnValue(mockComment),
      createQueryBuilder: jest.fn().mockReturnValue({
      }),
    } as unknown as Repository<Comment>;

    service = new CommentService(commentRepository, blogRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
