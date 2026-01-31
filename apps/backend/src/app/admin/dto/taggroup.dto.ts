import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { TagVisibility } from '@learnhub/models';

export class CreateTagGroupDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsEnum(TagVisibility)
  visibility?: TagVisibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class UpdateTagGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(TagVisibility)
  visibility?: TagVisibility;
}

export class AddTagToGroupDto {
  @IsString()
  tagId: string;
}
