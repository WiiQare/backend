import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { Messaging } from './entities/messaging.entity';
import { User } from '../session/entities/user.entity';
import { UserStatus } from '../../common/constants/enums';
import { UserRole } from '../../common/constants/enums';

describe('MessagingService', () => {
  let service: MessagingService;
  let messagingRepository: Repository<Messaging>;
  let userRepository: Repository<User>;
  const mockMessaging: Messaging = {
    senderId: 'senderId',
    senderName: 'names',
    message: 'message',
    isFromUser: true,
    recipientId: 'id',
    recipientName: 'names',
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    username: 'names',
    password: 'password',
    email: 'email',
    phoneNumber: 'phoneNumber',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    savings: [],
  };

  beforeEach(async () => {
    messagingRepository = {
      create: jest.fn().mockReturnValue(mockMessaging),
      save: jest.fn().mockReturnValue(mockMessaging),
      findOne: jest.fn().mockReturnValue(mockMessaging),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue([mockMessaging]),
      }),
    } as unknown as Repository<Messaging>;

    userRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    } as unknown as Repository<User>;

    service = new MessagingService(messagingRepository, userRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a message to a user', async () => {
    const result = await service.sendMessage('senderId', 'message', {
      names: 'names',
      sub: 'email',
      phoneNumber: 'phoneNumber',
      type: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
    });
    expect(result).toBeDefined();
    expect(result.senderId).toEqual('senderId');
    expect(result.senderName).toEqual('names');
    expect(result.message).toEqual('message');
    expect(result.isFromUser).toEqual(true);
    expect(result.recipientId).toEqual('id');
    expect(result.recipientName).toEqual('names');
  });

  it('should get all messages between two users', async () => {
    const result = await service.listRecipientMessages('senderId');
    expect(result).toBeDefined();
    expect(result[0].senderId).toEqual('senderId');
    expect(result[0].senderName).toEqual('names');
    expect(result[0].message).toEqual('message');
    expect(result[0].isFromUser).toEqual(true);
    expect(result[0].recipientId).toEqual('id');
    expect(result[0].recipientName).toEqual('names');
  });
});
