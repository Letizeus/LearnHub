import { TagGroup, TagID, TagVisibility } from 'models';
import { IsMongoId, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagGroupDto implements Omit<TagGroup, 'id'> {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: TagID[];

  @IsOptional()
  @ValidateNested({ each: true })
  visibility: TagVisibility[];
}
