import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas';

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
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
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
      const mockUsers = [mockUser];
      mockUserModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      });
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll({
        page: 1,
        limit: 20,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
      expect(result).toHaveProperty('totalPages', 1);
      expect(result.data).toHaveLength(1);
    });

    it('should apply search filter', async () => {
      mockUserModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        search: 'test',
        page: 1,
        limit: 20,
      });

      expect(mockUserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { username: { $regex: 'test', $options: 'i' } },
            { email: { $regex: 'test', $options: 'i' } },
            { displayName: { $regex: 'test', $options: 'i' } },
          ]),
        })
      );
    });

    it('should apply status filter', async () => {
      mockUserModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockUserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({
        status: 'locked',
        page: 1,
        limit: 20,
      });

      expect(mockUserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'locked',
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const updatedUser = { ...mockUser, displayName: 'Updated Name' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.update('507f1f77bcf86cd799439011', {
        displayName: 'Updated Name',
      });

      expect(result).toHaveProperty('displayName', 'Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('nonexistent', { displayName: 'New Name' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update user status to locked', async () => {
      const lockedUser = { ...mockUser, status: 'locked' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lockedUser),
      });

      const result = await service.updateStatus(
        '507f1f77bcf86cd799439011',
        'locked'
      );

      expect(result).toHaveProperty('status', 'locked');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus('nonexistent', 'locked')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.deleteUser('507f1f77bcf86cd799439011');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'User deleted successfully');
      expect(result).toHaveProperty('id', '507f1f77bcf86cd799439011');
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteUser('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
