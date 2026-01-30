import { Component } from "@angular/core";
import { AddExams } from "../add-exams/add-exams";
import { AddExercises } from "../add-exercises/add-exercises";

@Component({
    selector: 'app-add-view',
    templateUrl: './add-view.html',
    styleUrls: ['./add-view.scss'],
    imports: [AddExams, AddExercises],
}) export class AddView {

}