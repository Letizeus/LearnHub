import { LearningContentCollection } from 'models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicCollectionDto implements LearningContentCollection {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  title: string;

  @Expose()
  author: string;

  @Expose()
  @Transform(({ value }) => value.map(({ _id }) => _id))
  contents: string[];

  @Expose()
  @Transform(({ obj }) => obj.contents?.length || 0)
  length: number;

  @Expose()
  previewImage: string;

  @Expose()
  source: { url?: string; publishedAt?: Date; publisher?: string; organisation?: string };

  @Expose()
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  changedAt: Date;
  createdAt: Date;
}
