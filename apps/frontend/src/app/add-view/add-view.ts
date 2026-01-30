import { Component } from "@angular/core";
import { AddExams } from "../add-exams/add-exams";
import { AddExercises } from "../add-exercises/add-exercises";
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    selector: 'app-add-view',
    templateUrl: './add-view.html',
    styleUrls: ['./add-view.scss'],
    imports: [AddExams, AddExercises, FormsModule, SelectButtonModule],
}) export class AddView {
    protected addMode: string = "automatic";
    protected addModeSelectionOptions = [{label: "Automatic", value: "automatic"}, {label: "Manually", value: "manual"}] 
}