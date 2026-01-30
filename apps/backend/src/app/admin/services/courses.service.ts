import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningContentCollection } from '../../../content/learning-content.schema';
import { UpdateCourseDto } from '../dto/course.dto';
import { Status, Source } from '@learnhub/models';

interface FindAllOptions {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface CourseResponse {
  id: string;
  title: string;
  status: Status;
  source?: Source;
  author?: string;
  contentIds?: string[];
  createdAt?: Date;
  changedAt?: Date;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(LearningContentCollection.name)
    private readonly courseModel: Model<LearningContentCollection>
  ) {}

  private toCourseResponse(course: LearningContentCollection): CourseResponse {
    return {
      id: course._id.toString(),
      title: course.title,
      status: course.status as Status,
      source: course.source,
      author: course.author,
      contentIds: course.contents?.map(c => c._id.toString()) || [],
      createdAt: course.createdAt,
      changedAt: course.changedAt,
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

    const [courses, total] = await Promise.all([
      this.courseModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.courseModel.countDocuments(filter).exec(),
    ]);

    return {
      data: courses.map((course) => this.toCourseResponse(course)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CourseResponse> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return this.toCourseResponse(course);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseResponse> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return this.toCourseResponse(course);
  }

  async deleteCourse(id: string) {
    const course = await this.courseModel.findByIdAndDelete(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Course deleted successfully',
      id: course._id.toString(),
    };
  }
}
