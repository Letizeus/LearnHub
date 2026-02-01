import { Tag, TagID } from 'models';
import { IsHexColor, IsMongoId, IsOptional, IsString, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateTagDto implements Omit<Tag, 'id'> {
  @IsString()
  @Expose()
  name: string;

  @IsString()
  @IsOptional()
  @Expose()
  icon?: string;

  @IsHexColor()
  @IsOptional()
  @Expose()
  color?: string;

  @IsUrl()
  @IsOptional()
  @Expose()
  backgroundImage?: string;

  @IsMongoId()
  @IsOptional()
  @Expose()
  group?: string;
}
