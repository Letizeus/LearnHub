import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, Observable } from 'rxjs';
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
      { date: '2026-01-12', count: 5 },
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

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should load metrics on initialization', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.metrics()).toEqual(mockMetrics);
    expect(component.error()).toBeNull();
  });

  it('should display loading state initially', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(
      new Observable(() => {
        // Never complete to keep loading state
      })
    );
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
  });

  it('should handle error when loading metrics fails', () => {
    const errorMessage = 'Failed to load dashboard metrics. Please try again.';
    jest
      .spyOn(dashboardService, 'getMetrics')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe(errorMessage);
    expect(component.metrics()).toBeNull();
  });

  it('should change timeframe and reload metrics', () => {
    const weekMetrics = {
      ...mockMetrics,
      timeframe: TimeframeFilter.WEEK,
      newRegistrations: 5,
    };
    const weekChartData = { ...mockChartData, timeframe: TimeframeFilter.WEEK };
    jest
      .spyOn(dashboardService, 'getMetrics')
      .mockReturnValueOnce(of(mockMetrics))
      .mockReturnValueOnce(of(weekMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValueOnce(of(mockChartData))
      .mockReturnValueOnce(of(weekChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onTimeframeChange(TimeframeFilter.WEEK);

    expect(component.selectedTimeframe()).toBe(TimeframeFilter.WEEK);
    expect(component.metrics()).toEqual(weekMetrics);
  });

  it('should compute metric cards from metrics data', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const cards = component.metricCards();
    expect(cards).toHaveLength(4);
    expect(cards[0].title).toBe('Total Users');
    expect(cards[0].value).toBe(100);
    expect(cards[0].colorClass).toBe('metric-icon-slate');
    expect(cards[1].title).toBe('Active Users');
    expect(cards[1].value).toBe(85);
    expect(cards[1].colorClass).toBe('metric-icon-emerald');
    expect(cards[2].title).toBe('New Registrations');
    expect(cards[2].value).toBe(10);
    expect(cards[2].colorClass).toBe('metric-icon-purple');
    expect(cards[3].title).toBe('Total Uploads');
    expect(cards[3].value).toBe(250);
    expect(cards[3].colorClass).toBe('metric-icon-cyan');
  });

  it('should return empty metric cards when metrics is null', () => {
    // Mock with an observable that never completes to keep metrics as null
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(
      new Observable(() => {
        // Never emit or complete
      })
    );
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Since observable never completes, metrics should still be null
    expect(component.metricCards()).toEqual([]);

    // Now complete with data
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    component.onTimeframeChange(TimeframeFilter.WEEK);

    // After loading
    expect(component.metricCards().length).toBeGreaterThan(0);
  });

  it('should load chart data on initialization', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isChartLoading()).toBe(false);
    expect(component.chartData()).toEqual(mockChartData);
  });

  it('should generate chart data from API response', () => {
    jest.spyOn(dashboardService, 'getMetrics').mockReturnValue(of(mockMetrics));
    jest
      .spyOn(dashboardService, 'getRegistrationChart')
      .mockReturnValue(of(mockChartData));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const chartConfig = component.lineChartData();
    expect(chartConfig.labels).toEqual([
      '2026-01-10',
      '2026-01-11',
      '2026-01-12',
    ]);
    expect(chartConfig.datasets).toHaveLength(1);
    expect(chartConfig.datasets[0].data).toEqual([2, 3, 5]);
    expect(chartConfig.datasets[0].label).toBe('New Registrations');
  });
});
