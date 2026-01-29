import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { UpdateContentDto } from '../dto/content.dto';

@Controller('admin/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.contentService.findAll({
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
}
