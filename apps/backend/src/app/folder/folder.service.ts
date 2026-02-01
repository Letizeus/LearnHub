import { Injectable } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { Folder } from 'models';
import { InjectModel } from '@nestjs/mongoose';
import { Folder as FolderMongo } from '../schema/folder.schema';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { PublicFoldersDto } from './dto/public-folders.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FolderService {
  constructor(@InjectModel(FolderMongo.name) private folderModel: Model<FolderMongo>) {}

  async create(user: string, createFolderDto: CreateFolderDto): Promise<Folder> {
    const userId = new mongoose.Types.ObjectId(user);
    const newFolder = new this.folderModel({ ...createFolderDto, user: userId });
    const folderMongo = await newFolder.save();

    return plainToInstance(PublicFoldersDto, folderMongo.toObject());
  }

  async createLiked(user: string) {
    const userId = new mongoose.Types.ObjectId(user);
    const folder = await this.folderModel.find({ user: userId, isLiked: true });
    if (!folder || folder.length == 0) {
      const newFolder = new this.folderModel({ name: 'Liked', user, isLiked: true });
      const folderMongo = await newFolder.save();
      return plainToInstance(PublicFoldersDto, folderMongo.toObject());
    }
    return null;
  }

  async getFolder(user: string, id: string) {
    const userId = new mongoose.Types.ObjectId(user);
    const _id = new mongoose.Types.ObjectId(id);
    const folder = await this.folderModel.findOne({ _id, user: userId });
    return plainToInstance(PublicFoldersDto, folder.toObject());
  }

  async getFolders(user: string) {
    const userId = new mongoose.Types.ObjectId(user);
    const folders = await this.folderModel.find({ user: userId });
    return folders.map(folder => plainToInstance(PublicFoldersDto, folder.toObject()));
  }

  async update(user: string, id: string, updateFolderDto: UpdateFolderDto) {
    const userId = new mongoose.Types.ObjectId(user);
    let folder;
    if (id === 'liked') {
      folder = await this.folderModel.findOneAndUpdate({ isLiked: true, user: userId }, updateFolderDto);
    } else {
      const _id = new mongoose.Types.ObjectId(id);
      folder = await this.folderModel.findOneAndUpdate({ _id, user: userId }, updateFolderDto);
    }

    return plainToInstance(PublicFoldersDto, folder.toObject());
  }

  async delete(user: string, id: string) {
    const userId = new mongoose.Types.ObjectId(user);
    const _id = new mongoose.Types.ObjectId(id);
    const folder = await this.folderModel.findOneAndDelete({ _id, user: userId });
    return plainToInstance(PublicFoldersDto, folder.toObject());
  }
}
