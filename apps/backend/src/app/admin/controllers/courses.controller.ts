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
import { CoursesService } from '../services/courses.service';
import { UpdateCourseDto } from '../dto/course.dto';

@Controller('admin/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.coursesService.findAll({
      search,
      status,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
