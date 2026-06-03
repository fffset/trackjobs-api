import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UserRole } from '../users/user.entity';

const mockApplication = {
  id: '123',
  userId: 'user-123',
  company: 'Google',
  position: 'Backend Developer',
  status: 'applied',
  location: null,
  notes: null,
  createdAt: new Date(),
};

const mockUser = {
  userId: 'user-123',
  email: 'test@test.com',
  role: UserRole.USER,
};

const mockApplicationsService = {
  findByUser: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ApplicationsController', () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: mockApplicationsService },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return applications for current user', async () => {
      mockApplicationsService.findByUser.mockResolvedValue([mockApplication]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([mockApplication]);
      expect(mockApplicationsService.findByUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('create', () => {
    it('should create an application', async () => {
      mockApplicationsService.create.mockResolvedValue(mockApplication);

      const result = await controller.create(
        { company: 'Google', position: 'Backend Developer' },
        mockUser,
      );

      expect(result).toEqual(mockApplication);
      expect(mockApplicationsService.create).toHaveBeenCalledWith(
        { company: 'Google', position: 'Backend Developer' },
        'user-123',
      );
    });
  });

  describe('remove', () => {
    it('should delete an application', async () => {
      mockApplicationsService.remove.mockResolvedValue(undefined);

      await controller.remove('123', mockUser);

      expect(mockApplicationsService.remove).toHaveBeenCalledWith('123', 'user-123');
    });
  });
});