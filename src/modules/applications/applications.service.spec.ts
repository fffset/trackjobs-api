import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { ApplicationNotFoundException } from './error/application-not-found.exception';

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

const mockRepository = {
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: Repository<Application>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get<Repository<Application>>(getRepositoryToken(Application));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUser', () => {
    it('should return all applications for a user', async () => {
      mockRepository.findBy.mockResolvedValue([mockApplication]);

      const result = await service.findByUser('user-123');

      expect(result).toEqual([mockApplication]);
      expect(mockRepository.findBy).toHaveBeenCalledWith({ userId: 'user-123' });
    });
  });

  describe('findAll', () => {
    it('should return all applications (admin)', async () => {
      mockRepository.find.mockResolvedValue([mockApplication]);

      const result = await service.findAll();

      expect(result).toEqual([mockApplication]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an application by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockApplication);

      const result = await service.findOne('123', 'user-123');

      expect(result).toEqual(mockApplication);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123', userId: 'user-123' });
    });

    it('should throw ApplicationNotFoundException if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('999', 'user-123')).rejects.toThrow(
        ApplicationNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return an application', async () => {
      mockRepository.create.mockReturnValue(mockApplication);
      mockRepository.save.mockResolvedValue(mockApplication);

      const result = await service.create(
        { company: 'Google', position: 'Backend Developer' },
        'user-123',
      );

      expect(result).toEqual(mockApplication);
      expect(mockRepository.create).toHaveBeenCalledWith({
        company: 'Google',
        position: 'Backend Developer',
        userId: 'user-123',
      });
    });
  });

  describe('remove', () => {
    it('should delete an application', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockApplication);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('123', 'user-123');

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: '123', userId: 'user-123' });
    });

    it('should throw if application not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('999', 'user-123')).rejects.toThrow(
        ApplicationNotFoundException,
      );
    });
  });
});