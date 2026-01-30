import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TimeframeFilter {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export interface DashboardMetrics {
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

export interface RegistrationChartData {
  data: RegistrationChartDataPoint[];
  timeframe: TimeframeFilter;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/admin/dashboard';

  getMetrics(
    timeframe: TimeframeFilter = TimeframeFilter.ALL
  ): Observable<DashboardMetrics> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`, {
      params,
    });
  }

  getRegistrationChart(
    timeframe: TimeframeFilter = TimeframeFilter.ALL
  ): Observable<RegistrationChartData> {
    const params = new HttpParams().set('timeframe', timeframe);
    return this.http.get<RegistrationChartData>(
      `${this.apiUrl}/registrations-chart`,
      { params }
    );
  }
}
