import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentenceService } from '../../core/services/sentence.service';

@Component({
  selector: 'app-sentence-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentence-builder.component.html',
  styleUrls: ['./sentence-builder.component.css'],
})
export class SentenceBuilderComponent {
  public sentenceService = inject(SentenceService);

  onRemoveToken(index: number): void {
    this.sentenceService.removeTokenAt(index);
  }

  onClear(): void {
    this.sentenceService.clearCurrentSentence();
  }

  onSaveOrUpdate(): void {
    this.sentenceService.saveOrUpdateSentence();
  }

  onCancelEdit(): void {
    this.sentenceService.cancelEditing();
  }
}
