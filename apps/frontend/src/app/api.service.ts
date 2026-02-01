import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

enum APIStrategy {
  MOCK,
  HTTP,
}

type DocumentOptions = {
  searchString?: string;
  amount?: number;
  tags?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private strategy: APIStrategy = APIStrategy.MOCK;

  getDocumentsPreviews({ amount = 10, searchString, tags }: DocumentOptions) {
    return null;
  }
}
