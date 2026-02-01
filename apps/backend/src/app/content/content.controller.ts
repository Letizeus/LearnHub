import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { ContentService } from './content.service';
import { FeedbackContentDto } from './dto/feedback.dto';
import { GetContentsDto } from './dto/get-contents.dto';
import { GetCollectionsDto } from './dto/get-collections.dto';

const TEST_USER = '697d2ce679e4c52f67b58f8a';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('/content/:id')
  async getContent(@Param('id') id: string) {
    return await this.contentService.getContent(id);
  }

  @Get('/collection/:id')
  async getCollection(@Param('id') id: string) {
    return await this.contentService.getContent(id);
  }

  @Post('/contents')
  async getContents(@Body() body: GetContentsDto) {
    return await this.contentService.getContents(body.missingIds);
  }

  @Post('/collections')
  async getCollections(@Body() body: GetCollectionsDto) {
    return await this.contentService.getCollections(body.missingIds);
  }

  @Post('/search')
  async search(@Body() searchQuery: SearchQueryDto) {
    return await this.contentService.getContentFromSearch(searchQuery);
  }

  @Post('/like/:id')
  async like(@Param('id') id: string) {
    return await this.contentService.like(TEST_USER, id);
  }

  @Get('/recommendations/collections')
  async getRecommendedCollections() {
    return await this.contentService.getRecommendedCollections(20);
  }

  @Get('/recommendations/trending')
  async getTrendingContent() {
    return await this.contentService.getTrendingContent(5);
  }

  @Get('/recommendations/recent')
  async getRecentContent() {
    return await this.contentService.getRecentlyUploaded(20);
  }

  @Post('/download/:id')
  async download(@Param('id') id: string) {
    this.contentService.download(id);
    return;
  }

  @Get('/recommendations/similar')
  async getSimilarContent(@Query('id') id: string) {
    return await this.contentService.getSimilarContent(id, 5);
  }
}
