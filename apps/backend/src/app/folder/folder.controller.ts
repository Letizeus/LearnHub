import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';
import { FindFolderDto } from './dto/find-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.decorator';

const TEST_USER = '697d2ce679e4c52f67b58f8a';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getFolders(@User() user: string) {
    return await this.folderService.getFolders(user);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getFolder(@Param() params: FindFolderDto, @User() user: string) {
    return (await this.folderService.getFolder(user, params.id)) || new NotFoundException("Folder doesn't exist");
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  async createFolder(@Body() createFolderDto: CreateFolderDto, @User() user: string) {
    return await this.folderService.create(user, createFolderDto);
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  async updateFolder(@Body() updateFolderDto: UpdateFolderDto, @User() user: string) {
    return (await this.folderService.update(user, updateFolderDto.id, updateFolderDto)) || new NotFoundException("Folder doesn't exist");
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteFolder(@Param() params: DeleteFolderDto, @User() user: string) {
    return await this.folderService.delete(user, params.id);
  }
}
