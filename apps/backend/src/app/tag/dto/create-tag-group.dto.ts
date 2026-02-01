import { TagGroup, TagVisibility } from '@learnhub/models';
import { TagID } from 'models';
import { IsMongoId, IsObject, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagGroupDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tags: TagID[];

  @IsOptional()
  @IsEnum(TagVisibility)
  visibility?: TagVisibility;
}
