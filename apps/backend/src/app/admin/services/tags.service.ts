import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from '../../schema/tag.schema';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';
import { Tag as TagResponse } from '@learnhub/models';

interface FindAllOptions {
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name)
    private readonly tagModel: Model<Tag>
  ) {}

  private toTagResponse(tag: Tag): TagResponse {
    return {
      id: tag._id.toString(),
      name: tag.name,
      icon: tag.icon,
      color: tag.color,
      backgroundImage: tag.backgroundImage,
    };
  }

  async findAll(options: FindAllOptions) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [tags, total] = await Promise.all([
      this.tagModel.find(filter).skip(skip).limit(limit).exec(),
      this.tagModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tags.map((tag) => this.toTagResponse(tag)),
      total,
    };
  }

  async findOne(id: string): Promise<TagResponse> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return this.toTagResponse(tag);
  }

  async create(createDto: CreateTagDto): Promise<TagResponse> {
    const tag = await this.tagModel.create(createDto);
    return this.toTagResponse(tag);
  }

  async update(id: string, updateDto: UpdateTagDto): Promise<TagResponse> {
    const tag = await this.tagModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return this.toTagResponse(tag);
  }

  async delete(id: string): Promise<void> {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  async findUngrouped(options: FindAllOptions) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const TagGroupModel = this.tagModel.db.model('TagGroup');
    const tagGroups = await TagGroupModel.find({}, { tags: 1 }).exec();
    const groupedTagIds = tagGroups.flatMap((group: any) => group.tags);

    const filter: Record<string, unknown> = {
      _id: { $nin: groupedTagIds },
    };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [tags, total] = await Promise.all([
      this.tagModel.find(filter).skip(skip).limit(limit).exec(),
      this.tagModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tags.map((tag) => this.toTagResponse(tag)),
      total,
    };
  }
}
