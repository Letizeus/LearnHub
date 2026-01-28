import { Controller, Get, Param } from '@nestjs/common';

@Controller('content')
export class ContentController {
  @Get('/:id')
  async get(@Param('id') id: string) {
    return;
  }

  @Get('recommended')
  async getRecommended() {}

  @Get('trending')
  async getTrending() {}

  @Get('recent')
  async getRecent() {}
}
