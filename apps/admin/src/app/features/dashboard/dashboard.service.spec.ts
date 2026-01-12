import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, HttpRequest } from '@angular/common/http';
import { DashboardService, TimeframeFilter } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetrics', () => {
    it('should fetch metrics with default timeframe', (done) => {
      const mockMetrics = {
        totalUsers: 100,
        newRegistrations: 10,
        totalUploads: 250,
        activeUsers: 85,
        timeframe: TimeframeFilter.MONTH,
      };

      service.getMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(mockMetrics);
        done();
      });

      const req = httpMock.expectOne((request: HttpRequest<unknown>) =>
        request.url.includes('/admin/dashboard/metrics')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('timeframe')).toBe(TimeframeFilter.MONTH);
      req.flush(mockMetrics);
    });

    it('should fetch metrics with custom timeframe', (done) => {
      const mockMetrics = {
        totalUsers: 100,
        newRegistrations: 5,
        totalUploads: 250,
        activeUsers: 85,
        timeframe: TimeframeFilter.WEEK,
      };

      service.getMetrics(TimeframeFilter.WEEK).subscribe((metrics) => {
        expect(metrics).toEqual(mockMetrics);
        done();
      });

      const req = httpMock.expectOne((request: HttpRequest<unknown>) =>
        request.url.includes('/admin/dashboard/metrics')
      );
      expect(req.request.params.get('timeframe')).toBe(TimeframeFilter.WEEK);
      req.flush(mockMetrics);
    });

    it('should handle HTTP errors', (done) => {
      service.getMetrics().subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne((request: HttpRequest<unknown>) =>
        request.url.includes('/admin/dashboard/metrics')
      );
      req.flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });
});
