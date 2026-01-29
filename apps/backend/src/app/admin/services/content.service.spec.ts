import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ContentService } from './content.service';
import { Content } from '../schemas';
import { NotFoundException } from '@nestjs/common';

describe('ContentService', () => {
  let service: ContentService;

  const mockContentModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockContent = {
    _id: '1',
    type: 'EXERCISE',
    keywords: 'test',
    downloads: 10,
    likes: 5,
    tags: [{ name: 'test', icon: 'pi pi-tag', color: '#4CAF50', backgroundImage: '' }],
    relatedCollectionId: 'course1',
    text: 'Solve x + 5 = 10',
    tip: 'Subtract 5',
    solution: 'x = 5',
    createdAt: new Date(),
    changedAt: new Date(),
  };

  function mockChainedQuery<T>(result: T) {
    return {
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(result),
          }),
        }),
      }),
    };
  }

  function mockExecQuery<T>(result: T) {
    return { exec: jest.fn().mockResolvedValue(result) };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: getModelToken(Content.name), useValue: mockContentModel },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated content items', async () => {
      mockContentModel.find.mockReturnValue(mockChainedQuery([mockContent]));
      mockContentModel.countDocuments.mockReturnValue(mockExecQuery(1));

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].type).toBe('EXERCISE');
    });

    it('should filter by search query', async () => {
      mockContentModel.find.mockReturnValue(mockChainedQuery([]));
      mockContentModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ search: 'test', page: 1, limit: 20 });

      expect(mockContentModel.find).toHaveBeenCalledWith({
        keywords: { $regex: 'test', $options: 'i' },
      });
    });

    it('should filter by type', async () => {
      mockContentModel.find.mockReturnValue(mockChainedQuery([]));
      mockContentModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ type: 'EXERCISE', page: 1, limit: 20 });

      expect(mockContentModel.find).toHaveBeenCalledWith({
        type: 'EXERCISE',
      });
    });
  });

  describe('findOne', () => {
    it('should return a content item by id', async () => {
      mockContentModel.findById.mockReturnValue(mockExecQuery(mockContent));

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(result.type).toBe('EXERCISE');
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentModel.findById.mockReturnValue(mockExecQuery(null));

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a content item', async () => {
      const updatedContent = { ...mockContent, keywords: 'updated keywords' };
      mockContentModel.findByIdAndUpdate.mockReturnValue(mockExecQuery(updatedContent));

      const result = await service.update('1', { keywords: 'updated keywords' });

      expect(result.keywords).toBe('updated keywords');
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentModel.findByIdAndUpdate.mockReturnValue(mockExecQuery(null));

      await expect(service.update('999', { keywords: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deleteContent', () => {
    it('should delete a content item', async () => {
      mockContentModel.findByIdAndDelete.mockReturnValue(mockExecQuery(mockContent));

      const result = await service.deleteContent('1');

      expect(result.success).toBe(true);
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if content not found', async () => {
      mockContentModel.findByIdAndDelete.mockReturnValue(mockExecQuery(null));

      await expect(service.deleteContent('999')).rejects.toThrow(NotFoundException);
    });
  });
});
