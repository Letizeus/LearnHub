import { Tag, TagID } from 'models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicTagDto implements Tag {
  @Expose()
  backgroundImage?: string;
  @Expose()
  color?: string;
  @Expose()
  icon?: string;

  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: TagID;

  @Expose()
  name: string;
}
