import { SearchQuery, TagID } from 'models';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto implements SearchQuery {
  @IsOptional()
  @IsString()
  query: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: TagID[];
}
