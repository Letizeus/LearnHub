import { SearchResult } from 'models';
import { Expose } from 'class-transformer';

export class PublicSearchResultsDto implements SearchResult {
  @Expose()
  collections: { items: string[]; length: number };

  @Expose()
  exercises: { items: string[]; length: number };
}
