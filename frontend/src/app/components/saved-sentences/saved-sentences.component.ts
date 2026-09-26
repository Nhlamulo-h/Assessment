import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SentenceService } from '../../core/services/sentence.service';
import { Sentence } from '../../core/models/sentence.model';

@Component({
  selector: 'app-saved-sentences',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './saved-sentences.component.html',
  styleUrls: ['./saved-sentences.component.css'],
})
export class SavedSentencesComponent {
  public sentenceService = inject(SentenceService);

  readonly searchQuery = signal<string>('');

  readonly filteredSentences = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const sentences = this.sentenceService.savedSentences();
    if (!query) return sentences;
    return sentences.filter((s) => s.text.toLowerCase().includes(query));
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onEdit(sentence: Sentence): void {
    this.sentenceService.loadSentenceForEdit(sentence);
    // Smooth scroll up to sentence builder canvas for mobile UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDelete(id: number): void {
    this.sentenceService.deleteSentence(id);
  }

  onRefresh(): void {
    this.sentenceService.fetchSavedSentences();
  }
}
