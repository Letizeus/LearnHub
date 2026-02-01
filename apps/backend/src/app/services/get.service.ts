import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LearningContentCollection, LearningContentCollectionDocument } from "../../models/learning-content-collection";
import { Model } from "mongoose";


@Injectable()
export class GetService{
    constructor(@InjectModel(LearningContentCollection.name) private lccModel: Model<LearningContentCollectionDocument>)
    {

    }

    getAllLearningContentCollections(){
        return this.lccModel.find().sort({ createdAt: -1 }).exec();
    }
}