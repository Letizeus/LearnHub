import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Model } from 'mongoose';
import { LearningContent } from './learning-content.schema';

export interface SearchQuery {
  query: string;
  tags?: string[];
  collections?: string[];
  institutions?: string[];
}

@Injectable()
export class RecommendationService implements OnModuleInit {
  private client: QdrantClient;
  private readonly collectionName = 'content_recommendations';

  constructor(@Inject(LearningContent.name) private learningContentModel: Model<LearningContent>) {
    this.client = new QdrantClient({ host: 'qdrant', port: 6333 });
  }

  async onModuleInit() {
    const collections = await this.client.getCollections();
    if (!collections.collections.find(c => c.name === this.collectionName)) {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 384,
          distance: 'Cosine',
        },
      });
    }
  }

  async indexContent(id: string, vector: number[], metadata: any) {
    await this.client.upsert(this.collectionName, {
      points: [{ id, vector, payload: metadata }],
    });
  }

  async getSimiliar(contentId: string, limit: number = 10): Promise<LearningContent[]> {
    const target = await this.learningContentModel.findById(contentId);
    if (!target) return this.getRecent(limit);

    return this.learningContentModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: target.embedding,
          numCandidates: 100,
          limit,
        },
      },
    ]);
  }

  async getRecent(limit: number = 10): Promise<LearningContent[]> {
    return this.learningContentModel.aggregate([
      {
        $addFields: {
          score: {
            $add: [{ $divide: [1, { $add: [{ $toLong: '$createdAt' }, 1] }] }],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);
  }

  async getFromSearch(searchQuery: SearchQuery, limit: number = 10): Promise<LearningContent[]> {
    return this.learningContentModel.aggregate([
      {
        $addFields: {
          score: {
            $add: [{ $divide: [1, { $add: [{ $toLong: '$createdAt' }, 1] }] }],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);
  }
}
