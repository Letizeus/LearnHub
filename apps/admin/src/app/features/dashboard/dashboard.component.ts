import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  DashboardService,
  DashboardMetrics,
  RegistrationChartData,
  TimeframeFilter,
} from './dashboard.service';

interface MetricCard {
  title: string;
  value: number;
  icon: string;
  colorClass: string;
}

interface TimeframeOption {
  label: string;
  value: TimeframeFilter;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, SelectModule, ButtonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);

  // State signals
  protected readonly metrics = signal<DashboardMetrics | null>(null);
  protected readonly chartData = signal<RegistrationChartData | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isChartLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedTimeframe = signal<TimeframeFilter>(
    TimeframeFilter.ALL
  );

  // Helper to get CSS variables
  private getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  // Chart configuration using PrimeNG Chart
  protected readonly lineChartData = computed(() => {
    const data = this.chartData();
    if (!data || !data.data.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const emeraldColor = this.getCSSVariable('--p-emerald-600');
    const surfaceColor = this.getCSSVariable('--p-surface-0');

    return {
      labels: data.data.map((d) => d.date),
      datasets: [
        {
          data: data.data.map((d) => d.count),
          label: 'New Registrations',
          fill: true,
          tension: 0.4,
          borderColor: emeraldColor,
          backgroundColor: this.getCSSVariable('--p-emerald-100'),
          pointBackgroundColor: emeraldColor,
          pointBorderColor: surfaceColor,
          pointHoverBackgroundColor: surfaceColor,
          pointHoverBorderColor: emeraldColor,
        },
      ],
    };
  });

  protected readonly lineChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: this.getCSSVariable('--p-surface-900'),
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: this.getCSSVariable('--p-text-muted-color'),
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: this.getCSSVariable('--p-text-muted-color'),
          font: {
            size: 12,
          },
        },
        grid: {
          color: this.getCSSVariable('--p-surface-200'),
        },
      },
    },
  }));

  // Timeframe options for the dropdown
  protected readonly timeframeOptions: TimeframeOption[] = [
    { label: 'Last 24 Hours', value: TimeframeFilter.DAY },
    { label: 'Last 7 Days', value: TimeframeFilter.WEEK },
    { label: 'Last 30 Days', value: TimeframeFilter.MONTH },
    { label: 'Last Year', value: TimeframeFilter.YEAR },
    { label: 'All Time', value: TimeframeFilter.ALL },
  ];

  // Computed metric cards based on current metrics
  protected readonly metricCards = computed<MetricCard[]>(() => {
    const data = this.metrics();
    if (!data) return [];

    return [
      {
        title: 'Total Users',
        value: data.totalUsers,
        icon: 'pi pi-users',
        colorClass: 'metric-icon-emerald-400',
      },
      {
        title: 'Active Users',
        value: data.activeUsers,
        icon: 'pi pi-check-circle',
        colorClass: 'metric-icon-emerald-500',
      },
      {
        title: 'New Registrations',
        value: data.newRegistrations,
        icon: 'pi pi-user-plus',
        colorClass: 'metric-icon-emerald-600',
      },
      {
        title: 'Total Uploads',
        value: data.totalUploads,
        icon: 'pi pi-cloud-upload',
        colorClass: 'metric-icon-emerald-700',
      },
    ];
  });

  constructor() {
    this.loadMetrics();
    this.loadChartData();
  }

  protected onTimeframeChange(timeframe: TimeframeFilter): void {
    this.selectedTimeframe.set(timeframe);
    this.loadMetrics();
    this.loadChartData();
  }

  private loadMetrics(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getMetrics(this.selectedTimeframe()).subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard metrics:', err);
        this.error.set('Failed to load dashboard metrics. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  private loadChartData(): void {
    this.isChartLoading.set(true);

    this.dashboardService
      .getRegistrationChart(this.selectedTimeframe())
      .subscribe({
        next: (data) => {
          this.chartData.set(data);
          this.isChartLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load chart data:', err);
          this.isChartLoading.set(false);
        },
      });
  }
}
