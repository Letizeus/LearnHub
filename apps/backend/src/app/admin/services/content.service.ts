import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from '../schemas';
import { UpdateContentDto } from '../dto/content.dto';
import { Tag } from '@learnhub/models';

interface FindAllOptions {
  search?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface ContentResponse {
  id: string;
  type: string;
  keywords?: string;
  downloads: number;
  likes: number;
  tags: Tag[];
  relatedCollectionId?: string;
  text?: string;
  images?: string[];
  tip?: string;
  solution?: string;
  solutionImages?: string[];
  eval_points?: number;
  total_points?: number;
  createdAt?: Date;
  changedAt?: Date;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name)
    private readonly contentModel: Model<Content>
  ) {}

  private toContentResponse(content: Content): ContentResponse {
    return {
      id: content._id.toString(),
      type: content.type,
      keywords: content.keywords,
      downloads: content.downloads,
      likes: content.likes,
      tags: content.tags as Tag[],
      relatedCollectionId: content.relatedCollectionId,
      text: content.text,
      images: content.images,
      tip: content.tip,
      solution: content.solution,
      solutionImages: content.solutionImages,
      eval_points: content.eval_points,
      total_points: content.total_points,
      createdAt: content.createdAt,
      changedAt: content.changedAt,
    };
  }

  async findAll(options: FindAllOptions) {
    const { search, type, sortBy, sortOrder, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (type) {
      filter.type = type;
    }
    if (search) {
      filter.keywords = { $regex: search, $options: 'i' };
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Newest first
    }

    const [contents, total] = await Promise.all([
      this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.contentModel.countDocuments(filter).exec(),
    ]);

    return {
      data: contents.map((content) => this.toContentResponse(content)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ContentResponse> {
    const content = await this.contentModel.findById(id).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return this.toContentResponse(content);
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<ContentResponse> {
    const content = await this.contentModel
      .findByIdAndUpdate(id, updateContentDto, { new: true })
      .exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return this.toContentResponse(content);
  }

  async deleteContent(id: string) {
    const content = await this.contentModel.findByIdAndDelete(id).exec();

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Content deleted successfully',
      id: content._id.toString(),
    };
  }
}
