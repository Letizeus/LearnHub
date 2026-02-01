import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class ContentsDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  type: string;

  @Expose()
  @Transform(({ value }) => Array.isArray(value) ? value.length : value)
  likes: number;

  @Expose()
  downloads: number;

  @Expose()
  relatedCollection?: string;

  @Expose()
  tags: string[];

  // Exercise fields (Optional)
  @Expose() text?: string;
  @Expose() tip?: string;
  @Expose() images?: string[];
  @Expose() solution?: string;
  @Expose() solutionImages?: string[];
  @Expose() eval_points?: number;
  @Expose() total_points?: number;
}