
export class Exam {
    id: number;
    title: string;
    files: File[];

    constructor(){
        this.id = -1;
        this.title = "";
        this.files = [];
    }
}