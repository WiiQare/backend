import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";

describe('CommentController', () => {
  it('should be defined', () => {
    const service: CommentService = {} as CommentService;
    const controller = new CommentController(service);
    expect(controller).toBeDefined();
  });
});
