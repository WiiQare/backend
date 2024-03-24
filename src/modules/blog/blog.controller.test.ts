import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";

describe('BlogController', () => {
  it('should be defined', () => {
    const service: BlogService = {} as BlogService;
    const controller = new BlogController(service);
    expect(controller).toBeDefined();
  });
});
