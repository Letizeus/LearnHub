import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './tag.schema';
import { LearningContent, LearningContentCollection } from './learning-content.schema';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(LearningContentCollection.name) private collectionModel: Model<LearningContentCollection>,
    @InjectModel(LearningContent.name) private contentModel: Model<LearningContent>
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking if database needs seeding...');

    const collectionCount = await this.collectionModel.countDocuments();

    if (collectionCount > 0) {
      this.logger.log('Database already has data. Skipping seed.');
      return;
    }

    await this.seed();
  }

  async seed() {
    // 2. Create some Tags
    const mathTag = await new this.tagModel({
      name: 'Mathematics',
      icon: 'calculate',
      color: '#3498db',
    }).save();

    const geometryTag = await new this.tagModel({
      name: 'Geometry',
      icon: 'category',
      color: '#e74c3c',
    }).save();

    // 3. Create the Collection (initial save without contents)
    const collection = await new this.collectionModel({
      title: 'Advanced Algebra & Geometry 101',
      status: 'PUBLISHED',
      author: 'Dr. Jane Smith',
      source: {
        publisher: 'EduCorp',
        organisation: 'Open University',
        url: 'https://educorp.com/algebra',
        publishedAt: new Date(),
      },
      contents: [],
    }).save();

    // 4. Create an Exercise (using the LearningContent model with the discriminator key)
    const exercise1 = await new this.contentModel({
      type: 'EXERCISE', // The Discriminator Key
      keywords: 'triangles, pythagoras',
      downloads: 42,
      likes: 12,
      tags: [mathTag._id, geometryTag._id],
      relatedCollection: collection._id,
      text: 'Calculate the hypotenuse of a triangle with sides 3 and 4.',
      tip: 'Remember a² + b² = c²',
      solution: '5',
      eval_points: 10,
      total_points: 10,
    }).save();

    const exercise2 = await new this.contentModel({
      type: 'EXERCISE',
      keywords: 'algebra, variables',
      downloads: 15,
      likes: 5,
      tags: [mathTag._id],
      relatedCollection: collection._id,
      text: 'Solve for x: 2x + 4 = 10',
      solution: 'x = 3',
      eval_points: 5,
      total_points: 5,
    }).save();

    // 5. Link the Exercises back to the Collection
    collection.contents = [exercise1._id, exercise2._id] as any;
    await collection.save();

    return {
      message: 'Database seeded successfully!',
      collectionId: collection._id,
      exerciseCount: 2,
    };
  }
}
