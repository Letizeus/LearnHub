import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningContent, LearningContentCollection } from '../../schema/learning-content.schema';
import { CreateContentDto, UpdateContentDto } from '../dto/content.dto';
import { Tag, LEARNING_CONTENT_NAME, LEARNING_CONTENT_COLLECTION_NAME } from 'models';

interface FindAllOptions {
  search?: string;
  type?: string;
  collectionId?: string;
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
    @InjectModel(LEARNING_CONTENT_NAME)
    private readonly contentModel: Model<LearningContent>,
    @InjectModel(LEARNING_CONTENT_COLLECTION_NAME)
    private readonly collectionModel: Model<LearningContentCollection>
  ) {}

  private toContentResponse(content: LearningContent): ContentResponse {
    const doc = content as any;
    return {
      id: content._id.toString(),
      type: content.type,
      keywords: content.keywords,
      downloads: content.downloads,
      likes: content.likes,
      tags: (content.tags || []) as unknown as Tag[],
      relatedCollectionId: content.relatedCollection?._id?.toString(),
      text: doc.text,
      images: doc.images,
      tip: doc.tip,
      solution: doc.solution,
      solutionImages: doc.solutionImages,
      eval_points: doc.eval_points,
      total_points: doc.total_points,
      createdAt: content.createdAt,
      changedAt: content.updatedAt,
    };
  }

  async findAll(options: FindAllOptions) {
    const { search, type, collectionId, sortBy, sortOrder, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (type) {
      filter.type = type;
    }
    if (search) {
      filter.keywords = { $regex: search, $options: 'i' };
    }
    if (collectionId) {
      filter.relatedCollection = collectionId;
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Newest first
    }

    const [contents, total] = await Promise.all([
      this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).populate('tags').exec(),
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
    const content = await this.contentModel.findById(id).populate('tags').exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return this.toContentResponse(content);
  }

  async create(createContentDto: CreateContentDto): Promise<ContentResponse> {
    const ContentModel = createContentDto.type === 'EXERCISE'
      ? this.contentModel.discriminators?.['EXERCISE'] || this.contentModel
      : this.contentModel;

    const { relatedCollectionId, tags, ...contentData } = createContentDto;

    let tagIds: any[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagNames = tags.map((tag: any) => tag.name || tag);
      const tagDocs = await this.contentModel.db.model('Tag').find({ name: { $in: tagNames } }).exec();
      tagIds = tagDocs.map((tag: any) => tag._id);
    }

    const content = new ContentModel({
      ...contentData,
      tags: tagIds,
      downloads: 0,
      likes: 0,
      relatedCollection: relatedCollectionId || null,
    });
    const savedContent = await content.save();

    if (relatedCollectionId) {
      await this.collectionModel.findByIdAndUpdate(
        relatedCollectionId,
        {
          $push: { contents: savedContent._id },
          changedAt: new Date(),
        }
      ).exec();
    }

    const populatedContent = await this.contentModel.findById(savedContent._id).populate('tags').exec();
    return this.toContentResponse(populatedContent!);
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<ContentResponse> {
    const content = await this.contentModel.findById(id).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    const { tags, ...restDto } = updateContentDto;

    if (tags !== undefined) {
      if (Array.isArray(tags) && tags.length > 0) {
        const tagNames = tags.map((tag: any) => tag.name || tag);
        const tagDocs = await this.contentModel.db.model('Tag').find({ name: { $in: tagNames } }).exec();
        content.tags = tagDocs.map((tag: any) => tag._id) as any;
      } else {
        content.tags = [] as any;
      }
    }

    Object.assign(content, restDto);

    await content.save();

    const populatedContent = await this.contentModel.findById(id).populate('tags').exec();
    return this.toContentResponse(populatedContent!);
  }

  async deleteContent(id: string) {
    const content = await this.contentModel.findByIdAndDelete(id).exec();

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    if (content.relatedCollection) {
      await this.collectionModel.findByIdAndUpdate(
        content.relatedCollection,
        {
          $pull: { contents: content._id },
          changedAt: new Date(),
        }
      ).exec();
    }

    return {
      success: true,
      message: 'Content deleted successfully',
      id: content._id.toString(),
    };
  }

  async findUngrouped(options: FindAllOptions) {
    const { search, type, sortBy, sortOrder, page, limit } = options;
    const skip = (page - 1) * limit;

    const collections = await this.collectionModel.find({}).select('contents').exec();
    const contentInCollections = new Set();
    collections.forEach(collection => {
      if (collection.contents) {
        collection.contents.forEach(contentId => {
          contentInCollections.add(contentId.toString());
        });
      }
    });

    const filter: any = {
      _id: { $nin: Array.from(contentInCollections) },
    };
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
      sort.createdAt = -1;
    }

    const [contents, total] = await Promise.all([
      this.contentModel.find(filter).sort(sort).skip(skip).limit(limit).populate('tags').exec(),
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

  async addToCollection(contentId: string, collectionId: string): Promise<ContentResponse> {
    const content = await this.contentModel.findById(contentId).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }

    const collection = await this.collectionModel.findById(collectionId).exec();
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    content.relatedCollection = collection._id;
    await content.save();

    await this.collectionModel.findByIdAndUpdate(
      collectionId,
      {
        $addToSet: { contents: content._id },
        changedAt: new Date(),
      }
    ).exec();

    return this.toContentResponse(content);
  }

  async removeFromCollection(contentId: string, collectionId: string): Promise<ContentResponse> {
    const content = await this.contentModel.findById(contentId).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }

    await this.collectionModel.findByIdAndUpdate(
      collectionId,
      {
        $pull: { contents: content._id },
        changedAt: new Date(),
      }
    ).exec();

    const otherCollections = await this.collectionModel.countDocuments({
      _id: { $ne: collectionId } as any,
      contents: contentId as any,
    }).exec();

    if (otherCollections === 0) {
      content.relatedCollection = null;
      await content.save();
    } else if (content.relatedCollection?.toString() === collectionId) {
      const anotherCollection = await this.collectionModel.findOne({
        _id: { $ne: collectionId } as any,
        contents: contentId as any,
      }).exec();
      if (anotherCollection) {
        content.relatedCollection = anotherCollection._id;
        await content.save();
      }
    }

    const updatedContent = await this.contentModel.findById(contentId).populate('tags').exec();
    return this.toContentResponse(updatedContent!);
  }
}
