import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TagGroupsService } from '../services/taggroups.service';
import { CreateTagGroupDto, UpdateTagGroupDto, TagDto } from '../dto/taggroup.dto';

@Controller('admin/taggroups')
export class TagGroupsController {
  constructor(private readonly tagGroupsService: TagGroupsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.tagGroupsService.findAll({
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagGroupsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateTagGroupDto) {
    return this.tagGroupsService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTagGroupDto
  ) {
    return this.tagGroupsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tagGroupsService.delete(id);
  }

  @Post(':id/tags')
  async addTag(@Param('id') id: string, @Body() tagDto: TagDto) {
    return this.tagGroupsService.addTag(id, tagDto);
  }

  @Put(':id/tags/:tagId')
  async updateTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Body() tagDto: TagDto
  ) {
    return this.tagGroupsService.updateTag(id, tagId, tagDto);
  }

  @Delete(':id/tags/:tagId')
  async deleteTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.tagGroupsService.deleteTag(id, tagId);
  }
}
