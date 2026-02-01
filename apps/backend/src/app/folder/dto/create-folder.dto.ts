import { Folder } from 'models';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto implements Omit<Folder, 'id' | 'length'> {
  @IsString()
  icon?: string;

  @IsString()
  name: string;

  @IsOptional()
  content: string[];
}
