import { IsArray, IsMongoId } from 'class-validator';

export class GetContentsDto {
  @IsArray()
  @IsMongoId({ each: true })
  missingIds: string[];
}
