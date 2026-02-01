import {Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from 'crypto';
import { LearningContentCollection, LearningContentCollectionDocument } from "../../models/learning-content-collection";
import { LearningContent } from "../../models/learning-content";
import { Exercise } from "../../models/exercise";

@Injectable()
export class CreateService {
    private readonly bucket = "files";
    private readonly s3: S3Client;
    constructor(
        @InjectModel(LearningContentCollection.name) private lcCollectionModel: Model<LearningContentCollectionDocument>,
        @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    ){
        this.s3 = new S3Client({
            region: 'eu-central-1',
            endpoint: 'http://localhost:9000',
            forcePathStyle: true,
            credentials: {
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
            },
        });
    }   

    async createCollection(title: string){
        return await this.lcCollectionModel.create({
            title: title,
            status: Status.DRAFT,
            //source
            author: "",
            createdAt: Date.now(),
            changedAt: Date.now()
        })
    }

    async create(
        title: string,
        learningContents: any[],  
        exerciseImages: Map<number, Express.Multer.File[]>,
        solutionImages: Map<number, Express.Multer.File[]>
    ){  
        await this.createBucketIfNotExist(this.bucket);
        const collection = await this.createCollection(title);

        const mergedLearningContents = learningContents.map((lc, index) => ({
            ...lc,
            exercise: {
                ...lc.exercise,
                exerciseImages: exerciseImages.get(index) ?? [],
                solutionImages: solutionImages.get(index) ?? [],
            }
        }))
        console.log(mergedLearningContents.toString());

        for(const mergedLearningContent of mergedLearningContents){
            const exerciseImagesMetadata = (mergedLearningContent.exercise.exerciseImages ?? []).map(
                                            (f: Express.Multer.File) => ({
                                                filename: f.filename ?? f.originalname,
                                                mimetype: f.mimetype,
                                                size: f.size,
                                                path: f.path,
                                            }));
            const solutionImagesMetadata = (mergedLearningContent.exercise.solutionImages ?? []).map(
                                            (f: Express.Multer.File) => ({
                                                filename: f.filename ?? f.originalname,
                                                mimetype: f.mimetype,
                                                size: f.size,
                                                path: f.path,
                                            }));
            const exercise = await this.exerciseModel.create(
                {
                    type: mergedLearningContent.type ?? "",
                    keywords: mergedLearningContent.keywords ?? "",
                    downloads: 0,
                    likes: 0,
                    tags: mergedLearningContent.tags ?? [],
                    
                    text: mergedLearningContent.exercise.text,
                    solution: mergedLearningContent.exercise.solution ?? "",
                    totalPoints: mergedLearningContent.exercise.total_points ?? 0,
                    exerciseImages: exerciseImagesMetadata,
                    solutionImages: solutionImagesMetadata,
                    relatedCollection: collection._id
                }
            )
            collection.contents.push(exercise._id);
            
            
            mergedLearningContent.exercise.exerciseImages.forEach((f: Express.Multer.File) => {
                this.uploadFile(f, "exercises");
            });
            mergedLearningContent.exercise.solutionImages.forEach((f: Express.Multer.File) => {
                this.uploadFile(f, "solutions");
            })
                                            
        }
        await collection.save()
        return collection;
    }

    private async uploadFile(f: Express.Multer.File, folder: string){
        const safeName = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${folder}/${randomUUID()}-${Date.now()}-${safeName}`; //instead of randomUUID: user_id + exam_id

        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: filePath,
                Body: f.buffer,
                ContentType: f.mimetype
            }),
        );
        return {
            filename: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            path: filePath,
        }
    }

    private async createBucketIfNotExist(bucket: string){
        try {
            await this.s3.send(new HeadBucketCommand({Bucket: bucket}));
        } catch {
            await this.s3.send(new CreateBucketCommand({ Bucket: bucket }));
        }
    }
}

enum Status{
    DRAFT
}