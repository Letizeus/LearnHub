import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag, TagGroup } from '../schema/tag.schema';
import { Model } from 'mongoose';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagVisibility, TagVisibilityPlace } from 'models';
import { plainToInstance } from 'class-transformer';
import { PublicTagDto } from './dto/public-tag.dto';
import { PublicTagGroupDto } from './dto/public-tag-group.dto';
import { GetGroupsVisibilityDto } from './dto/get-groups-visibility.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(TagGroup.name) private tagGroupModel: Model<TagGroup>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const tag = new this.tagModel(createTagDto);
    if (createTagDto.group) await this.addTagToGroup(createTagDto.group, tag.id);
    return await tag.save();
  }

  async createGroup(createTagGroupDto: CreateTagGroupDto) {
    const tagGroup = new this.tagGroupModel({ tags: [], ...createTagGroupDto });
    const res = await tagGroup.save();
    if (createTagGroupDto.tags) {
      for (const tag of createTagGroupDto.tags) {
        await this.addTagToGroup(res._id.toString(), tag);
      }
    }
    return res;
  }

  async getTag(id: string, populate = false) {
    const tag = this.tagModel.findById(id).populate(populate ? 'group' : '');
    return tag;
  }

  async getTagGroup(id: string, populate = false) {
    const taggroup = await this.tagGroupModel.findById(id).populate(populate ? 'tags' : '');
    return taggroup;
  }

  async getTagGroupFromVisibility(dto: GetGroupsVisibilityDto, populate = false) {
    const taggroups = await this.tagGroupModel
      .find({ visibility: { $elemMatch: { place: dto.visibilityPlace } } })
      .populate(populate ? 'tags' : '');
    return taggroups.map(e => plainToInstance(PublicTagGroupDto, e.toObject()));
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto) {
    return this.tagModel.findByIdAndUpdate(id, updateTagDto);
  }

  async updateTagGroup(id: string, updateTagGroupDto: UpdateTagGroupDto) {
    return this.tagGroupModel.findByIdAndUpdate(id, updateTagGroupDto);
  }

  async addTagToGroup(groupId: string, tagId: string) {
    const group = await this.tagGroupModel.findByIdAndUpdate(
      groupId,
      { $push: { tags: tagId } },
      {
        new: true,
        useFindAndModity: false,
      },
    );
    return group;
  }

  async removeTagFromGroup(groupId: string, tagId: string) {
    const group = await this.getTagGroup(groupId);
    group.tags = group.tags.filter(id => id.toString() !== tagId);
    return await group.save();
  }

  async deleteTag(id: string) {
    return this.tagModel.findByIdAndDelete(id);
  }

  async deleteTagGroup(id: string) {
    return this.tagGroupModel.findByIdAndDelete(id);
  }
}
