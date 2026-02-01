import { CreateTagGroupDto } from './create-tag-group.dto';
import { IsMongoId, IsOptional, IsString, IsEnum } from 'class-validator';
import { TagID } from 'models';
import { TagVisibility } from '@learnhub/models';

export class UpdateTagGroupDto implements Partial<CreateTagGroupDto> {
  @IsMongoId()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  icon: string;

  @IsOptional()
  tags: TagID[];

  @IsOptional()
  @IsEnum(TagVisibility)
  visibility?: TagVisibility;
}
