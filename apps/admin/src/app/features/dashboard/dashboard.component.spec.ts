import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService, TimeframeFilter } from './dashboard.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;

  const mockMetrics = {
    totalUsers: 100,
    newRegistrations: 10,
    totalUploads: 250,
    activeUsers: 85,
    timeframe: TimeframeFilter.MONTH,
  };

  const mockChartData = {
    data: [
      { date: '2026-01-10', count: 2 },
      { date: '2026-01-11', count: 3 },
    ],
    timeframe: TimeframeFilter.MONTH,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    dashboardService = TestBed.inject(DashboardService);
  });

  function setupMocks(): void {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest.spyOn(dashboardService, 'getRegistrationChart').mockReturnValue(of(mockChartData));
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  }

  it('should create and load metrics on initialization', () => {
    setupMocks();
    createComponent();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.isLoading()).toBe(false);
    expect(component.metrics()).toEqual(mockMetrics);
    expect(component.error()).toBeNull();
  });

  it('should handle error when loading metrics fails', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(dashboardService, 'getRegistrationChart').mockReturnValue(of(mockChartData));
    createComponent();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('Failed to load dashboard metrics. Please try again.');
  });

  it('should change timeframe and reload metrics', () => {
    const weekMetrics = { ...mockMetrics, timeframe: TimeframeFilter.WEEK };
    jest.spyOn(dashboardService, 'getMetrics')
      .mockReturnValueOnce(of(mockMetrics))
      .mockReturnValueOnce(of(weekMetrics));
    jest.spyOn(dashboardService, 'getRegistrationChart').mockReturnValue(of(mockChartData));
    createComponent();
    fixture.detectChanges();

    component.onTimeframeChange(TimeframeFilter.WEEK);

    expect(component.selectedTimeframe()).toBe(TimeframeFilter.WEEK);
  });

  it('should compute metric cards from metrics data', () => {
    setupMocks();
    createComponent();
    fixture.detectChanges();

    const cards = component.metricCards();
    expect(cards).toHaveLength(4);
    expect(cards[0]).toEqual({ title: 'Total Users', value: 100, icon: 'pi pi-users', colorClass: 'metric-icon-slate' });
  });

  it('should generate chart data from API response', () => {
    setupMocks();
    createComponent();
    fixture.detectChanges();

    const chartConfig = component.lineChartData();
    expect(chartConfig.labels).toEqual(['2026-01-10', '2026-01-11']);
    expect(chartConfig.datasets[0].data).toEqual([2, 3]);
  });
});
