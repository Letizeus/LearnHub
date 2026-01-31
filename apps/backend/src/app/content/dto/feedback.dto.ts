import { IsIn, IsMongoId, IsOptional, ValidateNested } from 'class-validator';
import { ContentRelationFeedback, SearchQuery } from 'models';

export class FeedbackContentDto implements Omit<ContentRelationFeedback, 'searchQuery'> {
  @IsMongoId()
  @IsOptional()
  collection: string;

  @IsMongoId()
  @IsOptional()
  content: string;

  @IsMongoId()
  id: string;

  @ValidateNested()
  @IsOptional()
  searchQuery: SearchQuery;

  @IsIn(['CONTENT', 'COLLECTION'])
  type: 'CONTENT' | 'COLLECTION';
}
