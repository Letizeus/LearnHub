import { Folder } from 'models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicFoldersDto implements Folder {
  @Expose()
  @Transform(({ obj }) => (obj.isLiked ? 'liked' : obj._id?.toString() || obj.id))
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }) => (Array.isArray(value) ? value.map((v: any) => (v?._id ?? v?.id ?? v)?.toString()) : []))
  content: string[];

  @Expose()
  icon?: string;

  @Expose()
  length: number;
}
