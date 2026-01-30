import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { LearningContentCollection } from '../../../content/learning-content.schema';
import { Status } from '@learnhub/models';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockCourseModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockCourse = {
    _id: '1',
    title: 'Test Course',
    status: Status.PUBLISHED,
    author: 'Test Author',
    contents: [],
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
        CoursesService,
        { provide: getModelToken(LearningContentCollection.name), useValue: mockCourseModel },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      mockCourseModel.find.mockReturnValue(mockChainedQuery([mockCourse]));
      mockCourseModel.countDocuments.mockReturnValue(mockExecQuery(1));

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by search and status', async () => {
      mockCourseModel.find.mockReturnValue(mockChainedQuery([]));
      mockCourseModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ search: 'test', status: Status.PUBLISHED, page: 1, limit: 20 });

      expect(mockCourseModel.find).toHaveBeenCalledWith({
        title: { $regex: 'test', $options: 'i' },
        status: Status.PUBLISHED,
      });
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      mockCourseModel.findById.mockReturnValue(mockExecQuery(mockCourse));

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Course');
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findById.mockReturnValue(mockExecQuery(null));

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course and return success', async () => {
      mockCourseModel.findByIdAndDelete.mockReturnValue(mockExecQuery(mockCourse));

      const result = await service.deleteCourse('1');

      expect(result.success).toBe(true);
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findByIdAndDelete.mockReturnValue(mockExecQuery(null));

      await expect(service.deleteCourse('999')).rejects.toThrow(NotFoundException);
    });
  });
});
