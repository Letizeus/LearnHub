import { Exercise, LearningAnalytics, LearningContent, LearningContentCollection } from 'models';
import { IsArray, IsDate, IsIn, IsMongoId, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class SimpleCreateDto implements Partial<Omit<LearningContentCollection, 'contents'>> {
  @IsMongoId()
  author: string;

  @ValidateNested({ each: true })
  contents: SimpleCreateExerciseDto[];

  @IsOptional()
  @ValidateNested()
  source: SimpleCreateSourceDto;

  @IsString()
  title: string;
}

export class SimpleCreateSourceDto implements Partial<LearningContentCollection[`source`]> {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  organisation?: string;
}

export class SimpleCreateExerciseDto implements Partial<Exercise> {
  @IsString()
  @IsIn(['EXERCISE'])
  type: 'EXERCISE';

  @IsString()
  text: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  tags?: string[];

  @IsNumber()
  @IsOptional()
  eval_points?: number;

  @IsNumber()
  @IsOptional()
  total_points?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  solution?: string;

  @IsString()
  @IsOptional()
  solutionImages?: string[];

  @IsString()
  @IsOptional()
  tip?: string;
}
