import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { GetGroupsVisibilityDto } from './dto/get-groups-visibility.dto';
import { PublicTagGroupDto } from './dto/public-tag-group.dto';
import { plainToInstance } from 'class-transformer';

@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Post('/groups')
  async getGroups(@Body() visbility: GetGroupsVisibilityDto) {
    return await this.tagService.getTagGroupFromVisibility(visbility, true);
  }

  @Get('/:id')
  async get(@Param('id') id: string) {
    const res = await this.tagService.getTag(id);
    return plainToInstance(PublicTagGroupDto, res.toObject());
  }

  @Get('/group/:id')
  async getGroup(@Param('id') id: string) {
    return this.tagService.getTagGroup(id);
  }
}
