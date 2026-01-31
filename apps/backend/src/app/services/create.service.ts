import {Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from 'crypto';
import { LearningContentCollection } from "../../models/learning-content-collection";
import { LearningContent } from "../../models/learning-content";


@Injectable()
export class CreateService {
    private readonly bucket: string = "exams";

    private readonly s3: S3Client
    constructor(
        @InjectModel(LearningContentCollection.name) private lcCollectionModel: Model<LearningContentCollection>,
        @InjectModel(LearningContent.name) private lcModel: Model<LearningContent>,
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

    async create(
        title: string,
    ){
        
    }

    async createExam(
        title: string,
        files: Express.Multer.File[]){
        await this.createExamBucketIfNotExist(); 
        const filesMetadata = await Promise.all(files.map(f => this.uploadFile(f)));
        return await this.examModel.create(
            {
                title: title,
                files: filesMetadata,
            }
        );
    }

    private async uploadFile(f: Express.Multer.File){
        const safeName = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `exams/${randomUUID()}-${Date.now()}-${safeName}`; //instead of randomUUID: user_id + exam_id

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

    private async createExamBucketIfNotExist(){
        try {
            await this.s3.send(new HeadBucketCommand({Bucket: this.bucket}));
        } catch {
            await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        }
    }
}