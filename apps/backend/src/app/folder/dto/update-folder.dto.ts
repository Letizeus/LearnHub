import { Folder } from 'models';
import { IsArray, IsMongoId, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateFolderDto implements Partial<Folder> {
  @IsString()
  @Matches(/^(liked|[a-fA-F0-9]{24})$/, {
    message: 'id must be a valid MongoID or "liked"',
  })
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsArray()
  content?: string[];

  @IsString()
  @IsOptional()
  icon?: string;
}
