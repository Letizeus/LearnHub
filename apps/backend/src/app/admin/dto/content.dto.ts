import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TagDto {
  @IsString()
  name!: string;

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

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  keywords?: string;

  @IsOptional()
  @IsNumber()
  downloads?: number;

  @IsOptional()
  @IsNumber()
  likes?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[];

  @IsOptional()
  @IsString()
  relatedCollectionId?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  tip?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsArray()
  solutionImages?: string[];

  @IsOptional()
  @IsNumber()
  eval_points?: number;

  @IsOptional()
  @IsNumber()
  total_points?: number;
}
