import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUser } from '../schemas';
import { UpdateUserDto } from '../dto/user.dto';

interface FindAllOptions {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
  lastActiveAt?: Date;
  createdAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly userModel: Model<AdminUser>
  ) {}

  private toUserResponse(user: AdminUser, includeCreatedAt = false): UserResponse {
    const response: UserResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      lastActiveAt: user.updatedAt,
    };
    if (includeCreatedAt) {
      response.createdAt = user.createdAt;
    }
    return response;
  }

  async findAll(options: FindAllOptions) {
    const { search, status, sortBy, sortOrder, page, limit } = options;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data: users.map((user) => this.toUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user, true);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user);
  }

  async updateStatus(id: string, status: string) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user._id.toString(),
      status: user.status,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'User deleted successfully',
      id: user._id.toString(),
    };
  }
}
