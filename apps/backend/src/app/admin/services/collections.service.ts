import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningContent, LearningContentCollection } from '../../schema/learning-content.schema';
import { CreateCollectionDto, UpdateCollectionDto } from '../dto/collection.dto';
import { Status, Source } from '@learnhub/models';
import { LEARNING_CONTENT_NAME, LEARNING_CONTENT_COLLECTION_NAME } from 'models';

interface FindAllOptions {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface CollectionResponse {
  id: string;
  title: string;
  status: Status;
  source?: Source;
  author?: string;
  contents?: any[];
  createdAt?: Date;
  changedAt?: Date;
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(LEARNING_CONTENT_COLLECTION_NAME)
    private readonly collectionModel: Model<LearningContentCollection>,
    @InjectModel(LEARNING_CONTENT_NAME)
    private readonly contentModel: Model<LearningContent>
  ) {}

  private toCollectionResponse(collection: LearningContentCollection, populateContents = false): CollectionResponse {
    const base = {
      id: collection._id.toString(),
      title: collection.title,
      status: collection.status as Status,
      source: collection.source,
      author: collection.author,
      createdAt: collection.createdAt,
      changedAt: collection.changedAt,
    };

    if (!populateContents || !collection.contents) {
      return {
        ...base,
        contents: collection.contents?.map(c => c._id?.toString()) || [],
      };
    }

    return {
      ...base,
      contents: collection.contents.map(c => {
        const content = c as any;
        return {
          id: content._id?.toString(),
          type: content.type,
          text: content.text,
          tip: content.tip,
          solution: content.solution,
          images: content.images,
          eval_points: content.eval_points,
          total_points: content.total_points,
          downloads: content.downloads,
          likes: content.likes,
          keywords: content.keywords,
          tags: content.tags,
        };
      }),
    };
  }

  async findAll(options: FindAllOptions) {
    const { search, status, sortBy, sortOrder, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Newest first
    }

    const [collections, total] = await Promise.all([
      this.collectionModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.collectionModel.countDocuments(filter).exec(),
    ]);

    return {
      data: collections.map((collection) => this.toCollectionResponse(collection)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CollectionResponse> {
    const collection = await this.collectionModel
      .findById(id)
      .populate({
        path: 'contents',
        select: '-relatedCollection',
        populate: {
          path: 'tags'
        }
      })
      .lean()
      .exec();
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return this.toCollectionResponse(collection, true);
  }

  async create(createCollectionDto: CreateCollectionDto): Promise<CollectionResponse> {
    const collection = new this.collectionModel({
      ...createCollectionDto,
      contents: [],
      createdAt: new Date(),
      changedAt: new Date(),
    });
    const savedCollection = await collection.save();
    const plainCollection = await this.collectionModel.findById(savedCollection._id).lean().exec();
    return this.toCollectionResponse(plainCollection);
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto): Promise<CollectionResponse> {
    const collection = await this.collectionModel
      .findByIdAndUpdate(
        id,
        {
          ...updateCollectionDto,
          changedAt: new Date(),
        },
        { new: true }
      )
      .lean()
      .exec();
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return this.toCollectionResponse(collection);
  }

  async delete(id: string) {
    const collection = await this.collectionModel.findById(id).exec();

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.contents && collection.contents.length > 0) {
      const contentIds = collection.contents.map(c => (c as any)._id || c);

      for (const contentId of contentIds) {
        const otherCollections = await this.collectionModel.countDocuments({
          _id: { $ne: id },
          contents: contentId,
        }).exec();

        if (otherCollections === 0) {
          await this.contentModel.updateOne(
            { _id: contentId },
            { $set: { relatedCollection: null } }
          ).exec();
        } else {
          const content = await this.contentModel.findById(contentId).exec();
          if (content?.relatedCollection?.toString() === id.toString()) {
            const anotherCollection = await this.collectionModel.findOne({
              _id: { $ne: id },
              contents: contentId,
            }).exec();
            if (anotherCollection) {
              await this.contentModel.updateOne(
                { _id: contentId },
                { $set: { relatedCollection: anotherCollection._id } }
              ).exec();
            }
          }
        }
      }
    }

    await this.collectionModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: 'Collection deleted successfully',
      id: collection._id.toString(),
    };
  }
}
