import { Repository } from 'typeorm';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { Comment } from '../comment/entities/comment.entity';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: Repository<Blog>;
  const mockBlog: Blog = {
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'HowTo',
    slug: 'slugging',
    cover: 'got no image for this',
    content: 'how to content',
    comments: [],
    id: '3934cb36-4ad7-4eb0-a3f7-49ef7e81bb41',
  };

  const mockBlog1: Blog = {
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'HowTo',
    slug: 'a generated slug',
    cover: 'got no image for this',
    content: 'how to content',
    comments: [],
    id: '3934cb36-4ad7-4eb0-a3f7-49ef7e81bb41',
  };

  const comment: Comment = {
    fullname: 'John Doe',
    comment: 'test com',
    blog: mockBlog,
    id: '6c4deca1-8887-4bb4-b454-d34539c0af45',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    blogRepository = {
      create: jest.fn().mockReturnValue(mockBlog),
      save: jest.fn().mockReturnValue(mockBlog),
      findOne: jest.fn().mockReturnValue(mockBlog),
      find: jest.fn().mockReturnValue([mockBlog, mockBlog1]),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
      }),
    } as unknown as Repository<Blog>;

    service = new BlogService(blogRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a blog post', async () => {
    const result = await service.add(mockBlog);
    expect(result).toEqual(mockBlog);
    expect(result).toBeDefined();
  });

  it('should get all blog posts', async () => {
    const result = await service.getAll();
    expect(result).toEqual([mockBlog, mockBlog1]);
    expect(result).toBeDefined();
  });

  it('should get blogs with comments', async () => {
    const result = await service.getBlogDetailsWithComments('slugging');
    expect(result.last[0]).toEqual(mockBlog);
    expect(result).toBeDefined();
  });
});
