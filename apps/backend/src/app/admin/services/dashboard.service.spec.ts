import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { User } from '../../../users/user.schema';
import { LearningContent } from '../../../content/learning-content.schema';
import { TimeframeFilter } from '../dto/dashboard.dto';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockUserModel = { countDocuments: jest.fn() };
  const mockContentModel = { countDocuments: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(LearningContent.name), useValue: mockContentModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard metrics with default timeframe', async () => {
    mockUserModel.countDocuments
      .mockResolvedValueOnce(100) // totalUsers
      .mockResolvedValueOnce(10)  // newRegistrations
      .mockResolvedValueOnce(85); // activeUsers
    mockContentModel.countDocuments.mockResolvedValueOnce(250); // totalUploads

    const result = await service.getMetrics();

    expect(result).toEqual({
      totalUsers: 100,
      newRegistrations: 10,
      totalUploads: 250,
      activeUsers: 85,
      timeframe: TimeframeFilter.ALL,
    });
  });

  it('should return dashboard metrics for a specific timeframe', async () => {
    mockUserModel.countDocuments
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(85);
    mockContentModel.countDocuments.mockResolvedValueOnce(250);

    const result = await service.getMetrics(TimeframeFilter.WEEK);

    expect(result).toEqual({
      totalUsers: 100,
      newRegistrations: 5,
      totalUploads: 250,
      activeUsers: 85,
      timeframe: TimeframeFilter.WEEK,
    });
  });
});
