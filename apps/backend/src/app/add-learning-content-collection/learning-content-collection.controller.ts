import { Controller, Post, UseInterceptors, Body, UploadedFiles, BadRequestException } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../services/upload.service";

@Controller('learning-content-collection')
export class LearningContentCollectionController {

    constructor(private readonly uploadService: UploadService) {}

    @Post('add')
    @UseInterceptors(
        AnyFilesInterceptor({limits:{ fileSize: 10*1024*1024}})
    )
    public async add(
        @Body('title') title: string,
        @Body('author') author: string,
        @Body('learningContents') learningContentsStr: string,
        @UploadedFiles() files: Express.Multer.File[]
    ){
        console.log('triggered');
        console.log(learningContentsStr); 
        if(!title) throw new BadRequestException("Title is missing");
        if(!learningContentsStr) throw new BadRequestException("Learning Contents are missing");
        
        let learningContents = []
        try {
            learningContents = JSON.parse(learningContentsStr);
        } catch {
            throw new BadRequestException("Cannot parse JSON learning contents");
        }

        const grouped: Record<string, Express.Multer.File[]> = {};
        for (const f of files ?? []) (grouped[f.fieldname] ??= []).push(f);

        const getIndexedFiles = (prefix: 'exerciseImages' | 'solutionImages') => {
        const map = new Map<number, Express.Multer.File[]>();

        for (const [field, arr] of Object.entries(grouped)) {
            const m = field.match(new RegExp(`^${prefix}\\[(\\d+)\\]\\[\\]$`));
            if (!m) continue;
            const idx = Number(m[1]);
            map.set(idx, arr);
        }
        return map;
        };

        const exerciseImages = getIndexedFiles('exerciseImages');
        const solutionImages = getIndexedFiles('solutionImages');

        return await this.uploadService.create(title, author, learningContents, exerciseImages, solutionImages);
    }
}