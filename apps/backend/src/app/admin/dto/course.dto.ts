import { IsString, IsOptional, IsObject, IsArray, IsEnum } from 'class-validator';
import { Status } from '@learnhub/models';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsObject()
  source?: {
    url?: string;
    publishedAt?: Date;
    publisher?: string;
    organisation?: string;
  };

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  contents?: string[];
}
