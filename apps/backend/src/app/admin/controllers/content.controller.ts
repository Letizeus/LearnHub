import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { CreateContentDto, UpdateContentDto } from '../dto/content.dto';

@Controller('admin/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('collectionId') collectionId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.contentService.findAll({
      search,
      type,
      collectionId,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('ungrouped')
  async findUngrouped(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.contentService.findUngrouped({
      search,
      type,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post(':id/collection/:collectionId')
  @HttpCode(HttpStatus.OK)
  async addToCollection(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string
  ) {
    return this.contentService.addToCollection(id, collectionId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto
  ) {
    return this.contentService.update(id, updateContentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.contentService.deleteContent(id);
  }

  @Delete(':id/collection/:collectionId')
  @HttpCode(HttpStatus.OK)
  async removeFromCollection(
    @Param('id') id: string,
    @Param('collectionId') collectionId: string
  ) {
    return this.contentService.removeFromCollection(id, collectionId);
  }
}
