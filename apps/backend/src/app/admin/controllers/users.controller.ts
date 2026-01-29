import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/user.dto';

@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.usersService.findAll({
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
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/lock')
  @HttpCode(HttpStatus.OK)
  async lock(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'locked');
  }

  @Post(':id/unlock')
  @HttpCode(HttpStatus.OK)
  async unlock(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'active');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
