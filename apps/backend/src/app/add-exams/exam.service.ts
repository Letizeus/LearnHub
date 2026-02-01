/*
import {Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from 'crypto';

import { Exam } from "./exam";

@Injectable()
export class ExamService {
    private readonly bucket: string = "exams";

    private readonly s3: S3Client
    constructor(@InjectModel(Exam.name) private examModel: Model<Exam>){
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

    async createExam(
        title: string,
        files: Express.Multer.File[]){
        const examId = randomUUID();
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
    */