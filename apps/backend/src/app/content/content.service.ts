import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LEARNING_CONTENT_COLLECTION_NAME, LEARNING_CONTENT_NAME, SearchQueryPopulated, SearchResult, Tag } from 'models';
import { InjectModel } from '@nestjs/mongoose';
import {
  LearningContent as LearningContentMongo,
  LearningContentCollection as LearningContentCollectionMongo,
} from '../schema/learning-content.schema';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';
import { SimpleCreateDto } from './dto/simple-create.dto';
import { plainToInstance } from 'class-transformer';
import { PublicContentDto, PublicExerciseDto } from './dto/public-content.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { EmbeddingService } from '../embedding.service';
import { PublicCollectionDto } from './dto/public-collection.dto';
import { PublicSearchResultsDto } from './dto/public-search-results.dto';
import { TagService } from '../tag/tag.service';
import { PublicTagDto } from '../tag/dto/public-tag.dto';
import { ContentsDto } from './dto/contents.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(LEARNING_CONTENT_NAME) private contentModel: Model<LearningContentMongo>,
    @InjectModel(LEARNING_CONTENT_COLLECTION_NAME) private contentCollectionModel: Model<LearningContentCollectionMongo>,
    private embeddingService: EmbeddingService,
    @Inject(forwardRef(() => TagService))
    private tagService: TagService,
  ) {}

  async simpleCreate(createContentDto: SimpleCreateDto) {
    let ids: string[] = [];

    // Create content first
    for (const content of createContentDto.contents) {
      const cont = new this.contentModel(content);
      const createdContent = await cont.save();
      ids.push(createdContent._id.toString());
    }

    const coll = new this.contentCollectionModel({ ...createContentDto, contents: ids });
    const createdColl = await coll.save();
    const emb = await this.embeddingService.generate(
      this.embeddingService.flattenCollection(plainToInstance(PublicCollectionDto, createdColl.toObject())),
    );

    await this.embeddingService.upsertVector(LEARNING_CONTENT_COLLECTION_NAME, createdColl._id.toString(), emb);

    for (const id of ids) {
      const content = await this.contentModel.findByIdAndUpdate(id, { relatedCollection: createdColl._id.toString() });

      const emb2 = await this.embeddingService.generate(
        this.embeddingService.flattenContent({
          ...plainToInstance(PublicContentDto, content.toObject()),
          relatedCollection: createdColl,
        }),
      );

      await this.embeddingService.upsertVector(LEARNING_CONTENT_NAME, content._id.toString(), emb2);
    }

    return plainToInstance(PublicCollectionDto, createdColl.toObject());
  }

  async getContent(id: string) {
    const content = await this.contentModel
      .findById(id, {})
      .populate('relatedCollection', 'status');
    return content.type == 'EXERCISE'
      ? plainToInstance(PublicExerciseDto, content.toObject())
      : plainToInstance(PublicContentDto, content.toObject());
  }

  async getContents(ids: string[]) {
    const res = await this.contentModel.find({ _id: { $in: ids } }).populate('relatedCollection').lean();
      

    return plainToInstance(ContentsDto, res);
  }

  async getCollections(ids: string[]) {
    const res = await this.contentCollectionModel.find({ _id: { $in: ids } });
    return res.map(c => plainToInstance(PublicCollectionDto, c.toObject()));
  }

  async publish(id: string) {
    await this.contentModel.updateMany({ relatedCollection: id }, { status: 'PUBLISHED' });
    return plainToInstance(PublicContentDto, await this.contentModel.findByIdAndUpdate(id, { status: 'PUBLISHED' }));
  }

  async getContentFromSearch(
    searchQuery: SearchQueryDto,
    limits: {
      content: number;
      collection: number;
    } = { content: 10, collection: 10 },
  ) {
    let searchQueryTags = [];
    if (searchQuery.tags) {
      for (const t of searchQuery.tags) {
        const tag = await this.tagService.getTag(t, true);
        searchQueryTags.push(plainToInstance(PublicTagDto, tag.toObject()));
      }
    }

    const searchQueryPopulated: SearchQueryPopulated = { ...searchQuery, tags: searchQueryTags };
    const searchQueryString = this.embeddingService.flattenSearchQuery(searchQueryPopulated);
    const queryVector = await this.embeddingService.generate(searchQueryString);
    const content = await this.embeddingService.searchSimilar(LEARNING_CONTENT_NAME, queryVector, limits.content);
    const collections = await this.embeddingService.searchSimilar(LEARNING_CONTENT_COLLECTION_NAME, queryVector, limits.collection);

    const existingContent = await this.contentModel.find({ _id: { $in: content } }).distinct('_id');
    const existingCollections = await this.contentCollectionModel.find({ _id: { $in: collections } }).distinct('_id');

    const result: SearchResult = {
      exercises: {
        items: existingContent.map(id => id.toString()),
        length: existingContent.length,
      },
      collections: {
        items: existingCollections.map(id => id.toString()),
        length: existingCollections.length,
      },
    };
    return plainToInstance(PublicSearchResultsDto, result);
  }

  async getRecentlyUploaded(limit = 10) {
    const content = await this.contentCollectionModel.find({}).sort({ createdAt: -1 }).limit(limit).select({ _id: 1 }).lean();
    return content.map(d => d._id.toString());
  }

  async download(id: string) {
    const content = await this.contentModel.findByIdAndUpdate(id, {$inc: {
      downloads: 1
    }})

  }

  async getRecommendedCollections(limit = 10) {
    const searchString = 'RWTH Aachen';
    const queryVector = await this.embeddingService.generate(searchString);
    return await this.embeddingService.searchSimilar(LEARNING_CONTENT_COLLECTION_NAME, queryVector, limit);
  }

  async getTrendingContent(limit = 10) {
    const content = await this.contentModel.find({}).sort({ likes: -1 }).limit(limit).select({ _id: 1 }).lean();
    return content.map(d => d._id.toString());
  }

  async getSimilarContent(id: string, limit = 10) {
    const vector = await this.embeddingService.getVector(LEARNING_CONTENT_NAME, id);
    return await this.embeddingService.searchSimilar(LEARNING_CONTENT_NAME, vector, limit);
  }

  async like(user: string, id: string) {
    const content = await this.contentModel.findById(id);
    const userId = new mongoose.Types.ObjectId(user);
    if (content && content.likesArray && content.likesArray.map(id => id.toString()).indexOf(user) !== -1) {
      const updated = await this.contentModel.findByIdAndUpdate(
        id,
        { $pull: { likesArray: userId }, $inc: { likes: -1 } },
        {
          new: true,
          projection: { likes: 1 },
        },
      );
      return false;
    } else {
      const updated = await this.contentModel.findByIdAndUpdate(
        id,
        { $addToSet: { likesArray: userId }, $inc: { likes: 1 } },
        {
          new: true,
          projection: { likes: 1 },
        },
      );
      return true;
    }
  }
  async countDocuments() {
    return await this.contentModel.countDocuments().exec();
  }
}


