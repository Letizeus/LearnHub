import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { AdminUser, AdminContent } from '../schemas';
import { TimeframeFilter } from '../dto/dashboard.dto';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockUserModel = {
    countDocuments: jest.fn(),
  };

  const mockContentModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(AdminUser.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(AdminContent.name),
          useValue: mockContentModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return dashboard metrics with default timeframe', async () => {
      mockUserModel.countDocuments.mockResolvedValueOnce(100); // totalUsers
      mockUserModel.countDocuments.mockResolvedValueOnce(10); // newRegistrations
      mockContentModel.countDocuments.mockResolvedValueOnce(250); // totalUploads
      mockUserModel.countDocuments.mockResolvedValueOnce(85); // activeUsers

      const result = await service.getMetrics();

      expect(result).toEqual({
        totalUsers: 100,
        newRegistrations: 10,
        totalUploads: 250,
        activeUsers: 85,
        timeframe: TimeframeFilter.MONTH,
      });
    });

    it('should return dashboard metrics for a specific timeframe', async () => {
      mockUserModel.countDocuments.mockResolvedValueOnce(100);
      mockUserModel.countDocuments.mockResolvedValueOnce(5);
      mockContentModel.countDocuments.mockResolvedValueOnce(250);
      mockUserModel.countDocuments.mockResolvedValueOnce(85);

      const result = await service.getMetrics(TimeframeFilter.WEEK);

      expect(result).toEqual({
        totalUsers: 100,
        newRegistrations: 5,
        totalUploads: 250,
        activeUsers: 85,
        timeframe: TimeframeFilter.WEEK,
      });
    });

    it('should handle zero counts', async () => {
      mockUserModel.countDocuments.mockResolvedValueOnce(0);
      mockUserModel.countDocuments.mockResolvedValueOnce(0);
      mockContentModel.countDocuments.mockResolvedValueOnce(0);
      mockUserModel.countDocuments.mockResolvedValueOnce(0);

      const result = await service.getMetrics();

      expect(result).toEqual({
        totalUsers: 0,
        newRegistrations: 0,
        totalUploads: 0,
        activeUsers: 0,
        timeframe: TimeframeFilter.MONTH,
      });
    });

    it('should query with correct date filter for new registrations', async () => {
      mockUserModel.countDocuments.mockResolvedValue(0);
      mockContentModel.countDocuments.mockResolvedValue(0);

      await service.getMetrics(TimeframeFilter.DAY);

      // Check that newRegistrations query includes date filter
      const newRegistrationsCall = mockUserModel.countDocuments.mock.calls[1];
      expect(newRegistrationsCall[0]).toHaveProperty('createdAt');
      expect(newRegistrationsCall[0].createdAt).toHaveProperty('$gte');
    });
  });
});
