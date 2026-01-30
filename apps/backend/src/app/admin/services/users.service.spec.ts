import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../../users/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    status: 'active',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function mockChainedQuery<T>(result: T) {
    return {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(result),
    };
  }

  function mockSelectQuery<T>(result: T) {
    return { select: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(result) };
  }

  function mockExecQuery<T>(result: T) {
    return { exec: jest.fn().mockResolvedValue(result) };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users list', async () => {
      mockUserModel.find.mockReturnValue(mockChainedQuery([mockUser]));
      mockUserModel.countDocuments.mockReturnValue(mockExecQuery(1));

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply search and status filters', async () => {
      mockUserModel.find.mockReturnValue(mockChainedQuery([]));
      mockUserModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ search: 'test', status: 'locked', page: 1, limit: 20 });

      expect(mockUserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          status: 'locked',
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue(mockSelectQuery(mockUser));

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue(mockSelectQuery(null));

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return success', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue(mockExecQuery(mockUser));

      const result = await service.deleteUser('507f1f77bcf86cd799439011');

      expect(result.success).toBe(true);
      expect(result.id).toBe('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue(mockExecQuery(null));

      await expect(service.deleteUser('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
