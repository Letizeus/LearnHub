import { IsMongoId } from 'class-validator';

export class FindFolderDto {
  @IsMongoId()
  id: string;
}
