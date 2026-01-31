import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagGroup } from '../../../content/tag.schema';
import { CreateTagGroupDto, UpdateTagGroupDto } from '../dto/taggroup.dto';
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
    private readonly tagGroupModel: Model<TagGroup>,
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

  private toTagGroupResponse(tagGroup: TagGroup): TagGroupResponse {
    const populatedTags = tagGroup.tags as unknown as Tag[];
    return {
      id: tagGroup._id.toString(),
      name: tagGroup.name,
      icon: tagGroup.icon,
      tags: populatedTags.map((tag) => this.toTagResponse(tag)),
      visibility: tagGroup.visibility,
    };
  }

  private async findOnePopulated(id: string): Promise<TagGroup> {
    const tagGroup = await this.tagGroupModel.findById(id).populate('tags').exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${id} not found`);
    }
    return tagGroup;
  }

  async findAll(options: FindAllOptions) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [tagGroups, total] = await Promise.all([
      this.tagGroupModel.find(filter).skip(skip).limit(limit).populate('tags').exec(),
      this.tagGroupModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tagGroups.map((group) => this.toTagGroupResponse(group)),
      total,
    };
  }

  async findOne(id: string): Promise<TagGroupResponse> {
    const tagGroup = await this.findOnePopulated(id);
    return this.toTagGroupResponse(tagGroup);
  }

  async create(createDto: CreateTagGroupDto): Promise<TagGroupResponse> {
    if (createDto.tagIds && createDto.tagIds.length > 0) {
      const existingTags = await this.tagModel.countDocuments({
        _id: { $in: createDto.tagIds },
      }).exec();
      if (existingTags !== createDto.tagIds.length) {
        throw new BadRequestException('One or more tag IDs do not exist');
      }
    }

    const tagGroup = new this.tagGroupModel({
      name: createDto.name,
      icon: createDto.icon,
      visibility: createDto.visibility || TagVisibility.SEARCH_PAGE,
      tags: createDto.tagIds || [],
    });
    await tagGroup.save();

    const populatedGroup = await this.findOnePopulated(tagGroup._id.toString());
    return this.toTagGroupResponse(populatedGroup);
  }

  async update(id: string, updateDto: UpdateTagGroupDto): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('tags')
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

  async addTagToGroup(tagGroupId: string, tagId: string): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(tagGroupId).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${tagGroupId} not found`);
    }

    const tag = await this.tagModel.findById(tagId).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    if (tagGroup.tags.some((id) => id.toString() === tagId)) {
      throw new BadRequestException('Tag is already in this group');
    }

    tagGroup.tags.push(tag._id);
    await tagGroup.save();

    const populatedGroup = await this.findOnePopulated(tagGroupId);
    return this.toTagGroupResponse(populatedGroup);
  }

  async removeTagFromGroup(tagGroupId: string, tagId: string): Promise<TagGroupResponse> {
    const tagGroup = await this.tagGroupModel.findById(tagGroupId).exec();
    if (!tagGroup) {
      throw new NotFoundException(`Tag group with ID ${tagGroupId} not found`);
    }

    const initialLength = tagGroup.tags.length;
    tagGroup.tags = tagGroup.tags.filter((id) => id.toString() !== tagId);

    if (tagGroup.tags.length === initialLength) {
      throw new NotFoundException(`Tag with ID ${tagId} not found in this group`);
    }

    await tagGroup.save();

    const populatedGroup = await this.findOnePopulated(tagGroupId);
    return this.toTagGroupResponse(populatedGroup);
  }

  async deleteTagFromAllGroups(tagId: string): Promise<void> {
    await this.tagGroupModel.updateMany(
      { tags: tagId },
      { $pull: { tags: tagId } }
    ).exec();

    await this.tagModel.findByIdAndDelete(tagId).exec();
  }
}
