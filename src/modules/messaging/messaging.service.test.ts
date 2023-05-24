import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { Messaging } from './entities/messaging.entity';
import { User } from '../session/entities/user.entity';
import { UserStatus } from '../../common/constants/enums';
import { UserRole } from '../../common/constants/enums';

describe('MessagingService', () => {
  let service: MessagingService;
  beforeEach(async () => {
    const messagingRepository = new Repository<Messaging>(
      {
        name: 'messaging',
        type: {
          senderId: 'string',
          recipientId: 'string',
          senderName: 'string',
          recipientName: 'string',
          message: 'string',
          isFromUser: true,
          updatedAt: new Date(),
          createdAt: new Date(),
          id: 'string',
        },
      },
      {} as unknown as any,
    );
    const userRepository = new Repository<User>(
      {
        type: {
          id: 'string',
          username: 'string',
          phoneNumber: 'string',
          email: 'string',
          password: 'string',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: UserRole.PATIENT,
          status: UserStatus.ACTIVE,
        },
        name: 'user',
      },
      {} as unknown as any,
    );
    service = new MessagingService(messagingRepository, userRepository);
    console.log = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
