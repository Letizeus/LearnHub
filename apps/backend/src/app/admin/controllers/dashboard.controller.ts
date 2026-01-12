import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import {
  DashboardMetricsQueryDto,
  DashboardMetricsResponseDto,
  RegistrationChartResponseDto,
} from '../dto/dashboard.dto';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(
    @Query() query: DashboardMetricsQueryDto
  ): Promise<DashboardMetricsResponseDto> {
    return this.dashboardService.getMetrics(query.timeframe);
  }

  @Get('registrations-chart')
  async getRegistrationChart(
    @Query() query: DashboardMetricsQueryDto
  ): Promise<RegistrationChartResponseDto> {
    return this.dashboardService.getRegistrationChart(query.timeframe);
  }
}
