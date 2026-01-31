import { Injectable, OnModuleInit } from '@nestjs/common';
import { Exercise, Folder, LearningContentCollection, SearchResult, Tag, TagVisibilityPlace } from 'models';
import { faker } from '@faker-js/faker';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LearningContent as LearningContentMongo,
  LearningContentCollection as LearningContentCollectionMongo,
} from './schema/learning-content.schema';
import { Folder as FolderMongo } from './schema/folder.schema';
import { Tag as TagMongo, TagGroup as TagGroupMongo } from './schema/tag.schema';
import { ContentService } from './content/content.service';
import { SimpleCreateDto, SimpleCreateExerciseDto } from './content/dto/simple-create.dto';
import { TagService } from './tag/tag.service';
import { CreateTagGroupDto } from './tag/dto/create-tag-group.dto';
import { CreateTagDto } from './tag/dto/create-tag.dto';
import { FolderService } from './folder/folder.service';

@Injectable()
export class MockService implements OnModuleInit {
  constructor(
    @InjectModel(LearningContentMongo.name) private learningContentModel: Model<LearningContentMongo>,
    @InjectModel(LearningContentCollectionMongo.name) private learningContentCollectionModel: Model<LearningContentCollectionMongo>,
    @InjectModel(FolderMongo.name) private folderModel: Model<FolderMongo>,
    @InjectModel(TagMongo.name) private tagModel: Model<TagMongo>,
    @InjectModel(TagGroupMongo.name) private tagGroupModel: Model<TagGroupMongo>,
    private contentService: ContentService,
    private tagService: TagService,
    private folderService: FolderService,
  ) {}

  async onModuleInit() {
    await this.seedDb();

    await this.folderService.createLiked('697d2ce679e4c52f67b58f8a');
  }

  async seedDb() {
    const count = await this.learningContentModel.countDocuments().exec();
    if (count > 0) {
      console.log('🌱 Database seeded already. Skipping...');
      return;
    }
    console.log('🌱 Starting authentic seeding with real exam questions...');

    // 1. Fächerliste (angepasst für mehr Mathe/Tech Fokus)
    const subjectNames = [
      'Mathematics',
      'Computer Science',
      'Physics',
      'Chemistry',
      'Economics',
      'Biology',
      'Psychology',
      'Law',
      'History',
      'Philosophy',
    ];

    const uniNames = [
      'ETH Zurich',
      'TU Munich',
      'MIT',
      'Stanford',
      'Oxford',
      'Cambridge',
      'RWTH Aachen',
      'TU Berlin',
      'University of Tokyo',
      'Sorbonne',
    ];

    // 2. Tags erstellen (nur Farbe, keine Bilder mehr für Fächer/Unis nötig)
    const subjectTags = await Promise.all(
      subjectNames.map(name => this.tagService.create({ name, icon: 'school', color: faker.color.rgb() })),
    );

    const uniTags = await Promise.all(
      uniNames.map(name => this.tagService.create({ name, icon: 'account_balance', color: faker.color.rgb() })),
    );

    // 3. Tag-Gruppen erstellen
    await this.tagService.createGroup({
      name: 'Subjects',
      icon: 'category',
      tags: subjectTags.map(t => t._id.toString()),
      visibility: [{ place: TagVisibilityPlace.SEARCH_PAGE, position: 0 }],
    });

    await this.tagService.createGroup({
      name: 'Institutions',
      icon: 'account_balance',
      tags: uniTags.map(t => t._id.toString()),
      visibility: [{ place: TagVisibilityPlace.SEARCH_PAGE, position: 1 }],
    });

    // 4. 50 authentische Exams generieren
    for (let i = 0; i < 50; i++) {
      const randomSubjectTag = faker.helpers.arrayElement(subjectTags);
      const randomUniTag = faker.helpers.arrayElement(uniTags);
      const examYear = faker.number.int({ min: 2021, max: 2024 });
      const semester = faker.helpers.arrayElement(['Winter Term', 'Summer Term']);

      const numQuestions = faker.number.int({ min: 4, max: 10 });
      const realisticExercises = this.getSubjectSpecificExercises(randomSubjectTag.name, numQuestions);

      await this.contentService.simpleCreate({
        author: faker.person.fullName({ sex: 'male' }) + ' (Professor)',
        title: `Final Exam: ${randomSubjectTag.name} ${semester} ${examYear}`,
        source: {
          url: `${randomUniTag.name.toLowerCase().replace(' ', '-')}.edu/exams/${examYear}`,
          publishedAt: faker.date.past({ years: 2 }),
          publisher: randomUniTag.name,
          organisation: 'Faculty of ' + randomSubjectTag.name,
        },
        contents: realisticExercises,
      });
    }

    console.log('✅ Seeding of 50 authentic Exams completed.');
  }

  /**
   * Generiert fachspezifische Aufgaben, teils mit LaTeX.
   * Keine Bilder.
   */
  private getSubjectSpecificExercises(subjectName: string, limit: number): SimpleCreateExerciseDto[] {
    // --- Fragenpools ---

    // Pool für Mathe/Physik (High Tech LaTeX)
    const mathHeavyPool = [
      {
        q: 'Compute the definite integral: $$\\int_{0}^{\\pi} x \\sin(x) dx$$',
        s: 'Using integration by parts: $$\\pi$$',
      },
      {
        q: 'Find the eigenvalues of matrix A: $$A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$$',
        s: 'The eigenvalues are $\\lambda_1 = 2$ and $\\lambda_2 = 5$.',
      },
      {
        q: 'Solve the differential equation: $$\\frac{dy}{dx} + 2y = e^{-x}, \\quad y(0)=3$$',
        s: '$$y(x) = e^{-x} + 2e^{-2x}$$',
      },
      { q: 'Calculate the limit: $$\\lim_{x \\to 0} \\frac{\\sin(5x)}{3x}$$', s: '$$\\frac{5}{3}$$' },
      {
        q: 'Determine the series convergence: $$\\sum_{n=1}^{\\infty} \\frac{n!}{n^n}$$',
        s: 'Converges by ratio test.',
      },
      {
        q: "State Maxwell's equations in differential form.",
        s: '$$\\nabla \\cdot E = \\frac{\\rho}{\\epsilon_0}, \\quad \\nabla \\cdot B = 0, \\quad \\nabla \\times E = -\\frac{\\partial B}{\\partial t}, \\quad \\nabla \\times B = \\mu_0 (J + \\epsilon_0 \\frac{\\partial E}{\\partial t})$$',
      },
    ];

    // Pool für Informatik (Code & Logic)
    const csPool = [
      { q: 'Analyze the worst-case time complexity of Merge Sort.', s: 'It is always $O(n \\log n)$.' },
      {
        q: 'Explain the concept of "Deadlock" in operating systems and name necessary conditions.',
        s: 'A situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
      },
      { q: 'Convert the hexadecimal number $3F9_{16}$ to binary.', s: '$0011 1111 1001_2$' },
      {
        q: 'What is the difference between TCP and UDP?',
        s: 'TCP is connection-oriented, reliable, and guarantees order. UDP is connection-less, unreliable, and faster (no overhead).',
      },
    ];

    // Pool für Geistes-/Sozialwissenschaften (Textlastig)
    const humanitiesPool = [
      {
        q: 'Discuss the economic impact of inflation on fixed-income earners.',
        s: 'Purchasing power decreases significantly as their income does not adjust to rising prices.',
      },
      {
        q: 'Define "Operant Conditioning" according to B.F. Skinner.',
        s: 'A method of learning that occurs through rewards and punishments for behavior.',
      },
      {
        q: 'Contrast common law and civil law legal systems.',
        s: 'Common law is largely based on precedent (case law), while civil law is based on codified statutes.',
      },
      {
        q: 'Explain the concept of "Opportunity Cost" with an example.',
        s: 'The loss of potential gain from other alternatives when one alternative is chosen. E.g., Going to a concert instead of studying for an exam (cost is the study time lost).',
      },
    ];

    // --- Auswahl des richtigen Pools ---
    let targetPool = [];

    if (['Mathematics', 'Physics', 'Chemistry'].includes(subjectName)) {
      targetPool = mathHeavyPool;
    } else if (['Computer Science'].includes(subjectName)) {
      targetPool = csPool;
    } else {
      // Fallback für Economics, Law, History etc.
      targetPool = humanitiesPool;
    }

    // Zufällige Auswahl von 'limit' Fragen aus dem Pool (ohne Duplikate wenn möglich)
    const selectedQuestions = faker.helpers.arrayElements(targetPool, Math.min(limit, targetPool.length));

    // Umwandlung in das DTO Format
    return selectedQuestions.map(item => {
      const points = faker.number.int({ min: 5, max: 20 });
      return {
        type: 'EXERCISE',
        text: item.q,
        // WICHTIG: Keine Bilder mehr!
        // images: [],
        tip: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }), // Nur manchmal ein Tipp
        solution: item.s,
        eval_points: points,
        total_points: points, // Einfachheitshalber gleich
      };
    });
  }

  getMockLearningContent(limit: number = 1) {
    return Array.from({ length: limit }, () => ({
      type: faker.helpers.arrayElement(['VIDEO', 'ARTICLE', 'QUIZ']),
      keywords: faker.lorem.words(3).split(' ').join(', '),
      downloads: faker.number.int({ min: 0, max: 1000 }),
    }));
  }

  /*getMockLearningContentCollection(limit: number = 1, includeContents = true): LearningContentCollection[] {
      return Array.from({ length: limit }, () => ({
        id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        status: faker.helpers.arrayElement(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
        source: {
          url: faker.internet.url(),
          publishedAt: faker.date.past(),
          publisher: faker.company.name(),
          organisation: faker.commerce.department(),
        },
        previewImage: faker.image.url(),
        length: faker.number.int({ min: 1, max: 20 }),
        author: faker.person.fullName(),
        createdAt: faker.date.past(),
        changedAt: faker.date.recent(),
        contents: includeContents ? this.getMockLearningContent(2) : [],
      }));
    }*/

  getMockTag(limit: number = 1): CreateTagDto[] {
    return Array.from({ length: limit }, () => ({
      name: faker.word.adjective(),
      icon: 'shoppingmode',
      color: faker.color.rgb(),
      backgroundImage: faker.image.url({ width: 200, height: 100 }),
    }));
  }

  getMockTagGroup(limit: number = 1): CreateTagGroupDto[] {
    return Array.from({ length: limit }, () => ({
      name: faker.commerce.department(),
      icon: 'shoppingmode',
      tags: Array.from({ length: 10 }, () => faker.string.uuid()),
      visibility: [
        {
          place: TagVisibilityPlace.SEARCH_PAGE,
          position: faker.number.int({ min: 1, max: 10 }),
        },
      ],
    }));
  }

  getMockFolder(limit: number = 1) {
    return Array.from({ length: limit }, () => ({
      name: faker.word.verb() + ' Materials',
      icon: 'folder-open',
      content: Array.from({ length: 3 }, () => faker.string.uuid()),
    }));
  }

  // Bonus: Implementation for your Exercise type
  getMockExercise(limit: number = 1): SimpleCreateExerciseDto[] {
    return Array.from({ length: limit }, () => ({
      ...this.getMockLearningContent(1)[0],
      type: 'EXERCISE',
      text: faker.lorem.paragraph(),
      images: [faker.image.url()],
      tip: faker.lorem.sentence(),
      solution: faker.lorem.sentence(),
      eval_points: 5,
      total_points: 10,
    }));
  }
}
