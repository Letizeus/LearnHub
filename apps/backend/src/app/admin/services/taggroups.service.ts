import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagGroup } from '../../../content/tag.schema';
import { CreateTagGroupDto, UpdateTagGroupDto, TagDto } from '../dto/taggroup.dto';
import {
  TagGroup as TagGroupResponse,
  Tag as TagResponse,
  TagVisibility,
} from '@learnhub/models';

interface FindAllOptions {
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class TagGroupsService {
  constructor(
    @InjectModel(TagGroup.name)
    private readonly tagGroupModel: Model<TagGroup>
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

  private toTagGroupResponse(tagGroup: TagGroup): TagGroupResponse {
    return {
      id: tagGroup._id.toString(),
      name: tagGroup.name,
      icon: tagGroup.icon,
      tags: (tagGroup.tags || []).map((tag) => this.toTagResponse(tag)),
      visibility: tagGroup.visibility,
    };
  }

  async findAll(options: FindAllOptions) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [tagGroups, total] = await Promise.all([
      this.tagGroupModel.find(filter).skip(skip).limit(limit).exec(),
      this.tagGroupModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tagGroups.map((group) => this.toTagGroupResponse(group)),
      total,
    };
  }

  async findOne(id: string): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(id).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${id} not found`);
    }
    return this.toTagGroupResponse(tagGroup);
  }

  async create(createDto: CreateTagGroupDto): Promise<TagGroupResponse> {
    const tagGroup = new this.tagGroupModel({
      name: createDto.name,
      icon: createDto.icon,
      visibility: createDto.visibility || TagVisibility.SEARCH_PAGE,
      tags: createDto.tags || [],
    });
    await tagGroup.save();
    return this.toTagGroupResponse(tagGroup);
  }

  async update(id: string, updateDto: UpdateTagGroupDto): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${id} not found`);
    }
    return this.toTagGroupResponse(tagGroup);
  }

  async delete(id: string): Promise<void> {
    const result = await this.tagGroupModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tag group with ID ${id} not found`);
    }
  }

  async addTag(tagGroupId: string, tagDto: TagDto): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(tagGroupId).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${tagGroupId} not found`);
    }

    tagGroup.tags.push(tagDto as Tag);
    await tagGroup.save();
    return this.toTagGroupResponse(tagGroup);
  }

  async updateTag(
    tagGroupId: string,
    tagId: string,
    tagDto: TagDto
  ): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(tagGroupId).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${tagGroupId} not found`);
    }

    const tag = tagGroup.tags.find((t) => t._id.toString() === tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    Object.assign(tag, tagDto);
    await tagGroup.save();
    return this.toTagGroupResponse(tagGroup);
  }

  async deleteTag(tagGroupId: string, tagId: string): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(tagGroupId).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${tagGroupId} not found`);
    }

    const initialLength = tagGroup.tags.length;
    tagGroup.tags = tagGroup.tags.filter((t) => t._id.toString() !== tagId);

    if (tagGroup.tags.length === initialLength) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    await tagGroup.save();
    return this.toTagGroupResponse(tagGroup);
  }
}
