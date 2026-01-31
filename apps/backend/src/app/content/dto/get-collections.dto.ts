import { IsArray, IsMongoId } from 'class-validator';

export class GetCollectionsDto {
  @IsArray()
  @IsMongoId({ each: true })
  missingIds: string[];
}
