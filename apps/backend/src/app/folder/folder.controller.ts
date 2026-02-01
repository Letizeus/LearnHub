import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';
import { FindFolderDto } from './dto/find-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';

const TEST_USER = '697d2ce679e4c52f67b58f8a';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get('/')
  async getFolders() {
    return await this.folderService.getFolders(TEST_USER);
  }

  @Get('/:id')
  async getFolder(@Param() params: FindFolderDto) {
    return (await this.folderService.getFolder(TEST_USER, params.id)) || new NotFoundException("Folder doesn't exist");
  }

  @Post('/')
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return await this.folderService.create(TEST_USER, createFolderDto);
  }

  @Put('/')
  async updateFolder(@Body() updateFolderDto: UpdateFolderDto) {
    return (
      (await this.folderService.update(TEST_USER, updateFolderDto.id, updateFolderDto)) || new NotFoundException("Folder doesn't exist")
    );
  }

  @Delete('/:id')
  async deleteFolder(@Param() params: DeleteFolderDto) {
    return await this.folderService.delete(TEST_USER, params.id);
  }
}
