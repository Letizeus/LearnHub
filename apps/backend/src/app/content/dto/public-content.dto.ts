import { Exercise, LearningAnalytics, LearningContent } from 'models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicContentDto implements Omit<LearningContent, 'relatedCollection'> {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  analytics: LearningAnalytics;

  @Expose()
  downloads: number;

  @Expose()
  @Transform(({ value }) => value.likes.length || 0)
  likes: number;

  @Expose()
  relatedCollection?: string;

  @Expose()
  tags: string[];

  @Expose()
  type: string;

  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

@Exclude()
export class PublicExerciseDto extends PublicContentDto implements Omit<Exercise, 'relatedCollection'> {
  type: 'EXERCISE';

  @Expose()
  eval_points: number;

  @Expose()
  images: string[];

  @Expose()
  solution: string;

  @Expose()
  solutionImages: string[];

  @Expose()
  text: string;

  @Expose()
  tip: string;

  @Expose()
  total_points: number;
}
