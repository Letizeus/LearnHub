import {Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from 'crypto';
import { Exercise } from "./exercise";

@Injectable()
export class ExerciseService{
    private readonly bucketE: string = "exercises";
    private readonly bucketS: string = "solutions";
    
    private readonly s3: S3Client
    constructor(@InjectModel(Exercise.name) private exerciseModel: Model<Exercise>){
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

    async create(
        exercise: string,
        solution: string,
        totalPoints: string,
        exerciseImages: Express.Multer.File[],
        solutionImages: Express.Multer.File[]
    ){
        await this.createBucketIfNotExist(this.bucketE);
        await this.createBucketIfNotExist(this.bucketS);

        const exerciseImagesMetadata = await Promise.all(exerciseImages.map(f => this.uploadFile(this.bucketE, f)));
        const solutionImagesMetadata = await Promise.all(solutionImages.map(f => this.uploadFile(this.bucketS, f)));

        return await this.exerciseModel.create(
            {
                exercise: exercise,
                solution: solution,
                totalPoints: totalPoints,
                exerciseImages: exerciseImages,
                solutionImages: solutionImages
            }
        )
    }

    private async uploadFile(bucket: string, f: Express.Multer.File){
        const safeName = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `exams/${randomUUID()}-${Date.now()}-${safeName}`; //instead of randomUUID: user_id + exam_id

        await this.s3.send(
            new PutObjectCommand({
                Bucket: bucket,
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
            await this.s3.send(new HeadBucketCommand({ Bucket: bucket}));
        } catch {
            await this.s3.send(new CreateBucketCommand({ Bucket: bucket}));
        }
    }
}