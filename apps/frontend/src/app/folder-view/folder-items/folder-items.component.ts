import { Component, computed, input } from '@angular/core';
import { MathPipe } from '../../math.pipe';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';

@Component({
  selector: 'lh-folder-items',
  imports: [MathPipe, Accordion, AccordionContent, AccordionHeader, AccordionPanel],
  templateUrl: './folder-items.component.html',
  styleUrl: './folder-items.component.scss',
})
export class FolderItemsComponent {
  items = input.required<any[]>();
  itemsFiltered = computed(() => this.items().filter(item => !!item));
}
