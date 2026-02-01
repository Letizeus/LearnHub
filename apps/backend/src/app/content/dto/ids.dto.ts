import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class IdsDto {
  @Expose()
  ids: string[];
}
