import { CreateTagGroupDto } from './create-tag-group.dto';
import { IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TagID, TagVisibility } from 'models';

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
  @ValidateNested({ each: true })
  visibility: TagVisibility[];
}
