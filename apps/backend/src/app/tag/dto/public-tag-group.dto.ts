import { Tag, TagGroup, TagGroupPopulated, TagID, TagVisibility } from 'models';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PublicTagGroupDto implements TagGroupPopulated {
  @Expose()
  icon?: string;

  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(
    ({ value }) =>
      Array.isArray(value)
        ? value.map((t: any) => {
            if (!t || typeof t !== 'object') return t;
            const id = t._id?.toString?.() ?? t.id;
            const { _id, ...rest } = t;
            return { ...rest, id };
          })
        : value,
    { toClassOnly: true },
  )
  tags: Tag[];

  @Expose()
  visibility: TagVisibility[];
}
