import { CreateTagDto } from './create-tag.dto';
import { IsHexColor, IsMongoId, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateTagDto implements Partial<CreateTagDto> {
  @IsMongoId()
  id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsUrl()
  @IsOptional()
  backgroundImage: string;

  @IsMongoId()
  @IsOptional()
  group: string;
}
