import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ContentDataService } from './content-data.service';
import { FolderService } from './folder.service';
import { MessageService } from 'primeng/api';

export type LHMessage = {
  message: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  processed?: boolean;
  time: Date;
};

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private folderService = inject(FolderService);
  private contentDataService = inject(ContentDataService);
  private messageService = inject(MessageService);

  private globalMessages = signal<LHMessage[]>([]);

  private allMessages = computed<LHMessage[]>(() =>
    [...this.folderService.messages(), ...this.contentDataService.messages(), ...this.globalMessages()].sort(
      (a, b) => b.time.getTime() - a.time.getTime()
    )
  );

  constructor() {
    effect(() => {
      for (const message of this.allMessages()) {
        if (message.processed) {
          break;
        }
        this.messageService.add({ severity: message.severity, summary: message.message });
        this.globalMessages.update(messages => messages.map(m => (m === message ? { ...m, processed: true } : m)));
      }
    });
  }

  error(message: string) {
    this.globalMessages.update(prev => [...prev, { message, severity: 'error', time: new Date() }]);
  }

  info(message: string) {
    this.globalMessages.update(prev => [...prev, { message, severity: 'info', time: new Date() }]);
  }
}
