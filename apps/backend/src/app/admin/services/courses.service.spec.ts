import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from '../schemas';
import { NotFoundException } from '@nestjs/common';
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
    contentIds: ['content1'],
    source: { url: 'https://example.com', publisher: 'Test Publisher' },
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
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
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
      expect(result.data[0].title).toBe('Test Course');
    });

    it('should filter by search query', async () => {
      mockCourseModel.find.mockReturnValue(mockChainedQuery([]));
      mockCourseModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ search: 'test', page: 1, limit: 20 });

      expect(mockCourseModel.find).toHaveBeenCalledWith({
        title: { $regex: 'test', $options: 'i' },
      });
    });

    it('should filter by status', async () => {
      mockCourseModel.find.mockReturnValue(mockChainedQuery([]));
      mockCourseModel.countDocuments.mockReturnValue(mockExecQuery(0));

      await service.findAll({ status: Status.PUBLISHED, page: 1, limit: 20 });

      expect(mockCourseModel.find).toHaveBeenCalledWith({ status: Status.PUBLISHED });
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

  describe('update', () => {
    it('should update a course', async () => {
      const updatedCourse = { ...mockCourse, title: 'Updated Course' };
      mockCourseModel.findByIdAndUpdate.mockReturnValue(mockExecQuery(updatedCourse));

      const result = await service.update('1', { title: 'Updated Course' });

      expect(result.title).toBe('Updated Course');
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findByIdAndUpdate.mockReturnValue(mockExecQuery(null));

      await expect(service.update('999', { title: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
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
