import { TagVisibilityPlace } from 'models';
import { IsEnum, IsIn, IsString } from 'class-validator';

export class GetGroupsVisibilityDto {
  @IsString()
  @IsIn(['SEARCH_PAGE', 'TAG_SELECT'])
  visibilityPlace: TagVisibilityPlace;
}
