import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { FolderService } from '../folder/folder.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject() private folder: FolderService,
  ) {}

  async create(username: string, email: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 12);

    const user = await this.userModel.create({ username, email, password: hashed });
    await this.folder.createLiked(user._id.toString());
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
