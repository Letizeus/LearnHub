import { IsMongoId } from 'class-validator';

export class DeleteFolderDto {
  @IsMongoId()
  id: string;
}
