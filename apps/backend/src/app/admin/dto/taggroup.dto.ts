import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TagVisibility } from '@learnhub/models';

export class TagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;
}

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
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];
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
