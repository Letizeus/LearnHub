import { Injectable, OnModuleInit } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';
import { InjectModel } from '@nestjs/mongoose';
import { v5 as uuidv5 } from 'uuid';
import { Model } from 'mongoose';
import { ContentRelationFeedback, Exercise, LEARNING_CONTENT_COLLECTION_NAME, LEARNING_CONTENT_NAME, LearningContent, LearningContentCollection, SearchQueryPopulated, Tag } from 'models';
import { QdrantClient } from '@qdrant/js-client-rest';



@Injectable()
export class EmbeddingService implements OnModuleInit {
  private pipe: any;
  private qdrant: QdrantClient;
  private readonly QDRANT_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  private initPromise: Promise<void>;
  private readonly LERP_ALPHA = 0.1;

  constructor() {
    this.qdrant = new QdrantClient({ host: 'localhost', port: 6333 });
  }

  private toQdrantId(mongoId: any): string {
    return uuidv5(mongoId.toString(), this.QDRANT_NAMESPACE);
  }

  async onModuleInit() {
    this.initPromise = this.init();
  }

  private async init() {
    try {
      this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        dtype: 'q8',
        device: 'cpu',
      });
      console.log('Embedding Pipeline Initialized');
    } catch (e) {
      console.error('Failed to load transformer pipeline', e);
    }
    try {
      const collections = await this.qdrant.getCollections();
      const existsContent = collections.collections.some(c => c.name === LEARNING_CONTENT_NAME);
      if (!existsContent) {
        await this.qdrant.createCollection(LEARNING_CONTENT_NAME, {
          vectors: {
            size: 384, // Must match your model output
            distance: 'Cosine',
          },
        });
        console.log(`✅ Qdrant Collection '${LEARNING_CONTENT_NAME}' created.`);
      }

      const existsCollections = collections.collections.some(c => c.name === LEARNING_CONTENT_COLLECTION_NAME);
      if (!existsCollections) {
        await this.qdrant.createCollection(LEARNING_CONTENT_COLLECTION_NAME, {
          vectors: {
            size: 384, // Must match your model output
            distance: 'Cosine',
          },
        });
        console.log(`✅ Qdrant Collection '${LEARNING_CONTENT_COLLECTION_NAME}' created.`);
      }
    } catch (err) {
      console.error('❌ Failed to connect to Qdrant. Is Docker running?', err.message);
      throw err;
    }
  }

  async getVector(collection_name: string, id: string): Promise<number[]> {
    await this.initPromise;

    const qdrantId = this.toQdrantId(id);

    const points = await this.qdrant.retrieve(collection_name, {
      ids: [qdrantId],
      with_vector: true,
      with_payload: true,
    });

    if (!points || points.length === 0) {
      throw new Error(`Point with ID ${id} not found.`);
    }
    return points[0].vector as number[];
  }

  async generate(text: string): Promise<number[]> {
    await this.initPromise;
    if (!this.pipe) {
      throw new Error('Pipeline not initialized');
    }

    const output = await this.pipe(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert the Tensor object into a plain JS array
    return Array.from(output.data as Float32Array);
  }

  async upsertVector(collection_name: string, id: string, vector: number[], metadata: any = {}) {
    await this.qdrant.upsert(collection_name, {
      wait: true,
      points: [
        {
          id: this.toQdrantId(id), // Qdrant accepts UUIDs or integers, but we can map Mongo IDs
          vector: vector,
          payload: { ...metadata, mongoId: id },
        },
      ],
    });
  }

  /**
   * Search for similar content
   */
  async searchSimilar(collection_name: string, queryVector: number[], limit = 5) {
    const results = await this.qdrant.search(collection_name, {
      vector: queryVector,
      limit: limit,
      with_payload: true, // Returns the metadata we stored
    });
    return results.map(e => e.payload.mongoId as string);
  }

  flattenContent(
    content: Omit<LearningContent, 'analytics' | 'likes' | 'downloads' | 'id' | 'relatedCollection' | 'status'> & {
      relatedCollection: any;
    },
  ): string {
    if (content.type === 'EXERCISE') {
      const { text, eval_points, solution, tip } = content as Exercise;

      const coll = content.relatedCollection as Pick<LearningContentCollection, 'title' | 'author' | 'source'>;
      if (!coll || !coll.title) {
        throw new Error('Related collection must be populated');
      }
      const tags = content.tags as Tag[];
      if (!tags.every(tag => typeof tag === 'string')) {
        throw new Error('Tags must be populated');
      }

      return `
        TEXT: ${text}.
        SOLUTION: ${solution}.
        TIP: ${tip}.
        POINTS: ${eval_points}.
        COLLECTION_TITLE: ${coll.title}.
        COLLECTION_AUTHOR: ${coll.author}.
        COLLECTION_SOURCE: ${coll.source.publisher}. ${coll.source.organisation}. ${coll.source.publishedAt}. ${coll.source.url}.
        TAGS: ${tags.map((tag: Tag) => `${tag.name}.`).join('.')}
      `
        .replace(/\s+/g, ' ')
        .trim(); // Clean up extra spaces/newlines
    }
  }

  flattenCollection(content: Pick<LearningContentCollection, 'title' | 'author' | 'source'>): string {
    const { title, author, source } = content;

    return `
    TITLE: ${title}.
    SOURCE: ${source.publisher}. ${source.organisation}. ${source.publishedAt}. ${source.url}.
    AUTHOR: ${author}.
  `
      .replace(/\s+/g, ' ')
      .trim(); // Clean up extra spaces/newlines
  }

  flattenSearchQuery(searchQuery: SearchQueryPopulated): string {
    const { query } = searchQuery;
    const tags = searchQuery.tags as Tag[];
    if (tags) {
      if (!tags.every(tag => typeof tag.name === 'string')) {
        throw new Error('Tags must be populated');
      }
    }
    return `
    QUERY: ${query}.
    TAGS: ${searchQuery.tags && tags.map((t: Tag) => t.name).join('.')}.
  `;
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }
}
