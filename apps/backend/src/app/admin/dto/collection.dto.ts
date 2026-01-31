import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Status, Source } from '@learnhub/models';

export class CreateCollectionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsEnum(Status)
  status: Status;

  @IsOptional()
  source?: Source;

  @IsString()
  author: string;
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  source?: Source;

  @IsOptional()
  @IsString()
  author?: string;
}
