import { IsEnum, IsOptional } from 'class-validator';

export enum TimeframeFilter {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export class DashboardMetricsQueryDto {
  @IsEnum(TimeframeFilter)
  @IsOptional()
  timeframe?: TimeframeFilter = TimeframeFilter.MONTH;
}

export interface DashboardMetricsResponseDto {
  totalUsers: number;
  newRegistrations: number;
  totalUploads: number;
  activeUsers: number;
  timeframe: TimeframeFilter;
}

export interface RegistrationChartDataPoint {
  date: string;
  count: number;
}

export interface RegistrationChartResponseDto {
  data: RegistrationChartDataPoint[];
  timeframe: TimeframeFilter;
}
