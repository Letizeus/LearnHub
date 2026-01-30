import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../users/user.schema';
import { LearningContent } from '../../../content/learning-content.schema';
import {
  DashboardMetricsResponseDto,
  RegistrationChartResponseDto,
  RegistrationChartDataPoint,
  TimeframeFilter,
} from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(LearningContent.name) private contentModel: Model<LearningContent>
  ) {}

  async getMetrics(
    timeframe: TimeframeFilter = TimeframeFilter.MONTH
  ): Promise<DashboardMetricsResponseDto> {
    const startDate = this.getStartDate(timeframe);

    // Run all queries in parallel
    const [totalUsers, newRegistrations, totalUploads, activeUsers] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.countNewRegistrations(startDate),
        this.contentModel.countDocuments(),
        this.countActiveUsers(),
      ]);

    return {
      totalUsers,
      newRegistrations,
      totalUploads,
      activeUsers,
      timeframe,
    };
  }

  async getRegistrationChart(
    timeframe: TimeframeFilter = TimeframeFilter.MONTH
  ): Promise<RegistrationChartResponseDto> {
    const startDate = this.getStartDate(timeframe);
    const groupByFormat = this.getDateGroupFormat(timeframe);

    // Aggregate users by date
    const results = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupByFormat,
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const data: RegistrationChartDataPoint[] = results.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    return {
      data,
      timeframe,
    };
  }

  private async countNewRegistrations(startDate: Date): Promise<number> {
    return this.userModel.countDocuments({
      createdAt: { $gte: startDate },
    });
  }

  private async countActiveUsers(): Promise<number> {
    return this.userModel.countDocuments({
      status: 'active',
    });
  }

  private getStartDate(timeframe: TimeframeFilter): Date {
    const now = new Date();
    const start = new Date();

    switch (timeframe) {
      case TimeframeFilter.DAY:
        start.setDate(now.getDate() - 1);
        break;
      case TimeframeFilter.WEEK:
        start.setDate(now.getDate() - 7);
        break;
      case TimeframeFilter.MONTH:
        start.setMonth(now.getMonth() - 1);
        break;
      case TimeframeFilter.YEAR:
        start.setFullYear(now.getFullYear() - 1);
        break;
      case TimeframeFilter.ALL:
        start.setFullYear(2000);
        break;
    }

    return start;
  }

  private getDateGroupFormat(timeframe: TimeframeFilter): string {
    switch (timeframe) {
      case TimeframeFilter.DAY:
        return '%Y-%m-%d %H:00'; // Group by hour
      case TimeframeFilter.WEEK:
      case TimeframeFilter.MONTH:
        return '%Y-%m-%d'; // Group by day
      case TimeframeFilter.YEAR:
      case TimeframeFilter.ALL:
        return '%Y-%m'; // Group by month
      default:
        return '%Y-%m-%d';
    }
  }
}
