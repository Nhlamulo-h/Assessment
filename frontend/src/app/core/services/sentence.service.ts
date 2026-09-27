import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { WordType, WordTypesResponse } from '../models/word-type.model';
import { Word, WordsByTypeResponse, SelectedWordToken } from '../models/word.model';
import { Sentence, SentencesResponse, SingleSentenceResponse } from '../models/sentence.model';

@Injectable({
  providedIn: 'root',
})
export class SentenceService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api';

  readonly wordTypes = signal<WordType[]>([]);
  readonly selectedType = signal<WordType | null>(null);
  readonly wordsForSelectedType = signal<Word[]>([]);
  readonly sentenceTokens = signal<SelectedWordToken[]>([]);
  readonly savedSentences = signal<Sentence[]>([]);
  readonly editingSentenceId = signal<number | null>(null);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly assembledText = computed(() => {
    const tokens = this.sentenceTokens();
    if (tokens.length === 0) return '';
    
    return tokens
      .map((t) => t.text)
      .join(' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();
  });

  readonly isEditing = computed(() => this.editingSentenceId() !== null);
  readonly wordCount = computed(() => this.sentenceTokens().length);

  constructor() {
    this.init();
  }

  public init(): void {
    this.fetchWordTypes();
    this.fetchSavedSentences();
  }

  public fetchWordTypes(): void {
    this.isLoading.set(true);
    this.http.get<WordTypesResponse>(`${this.apiUrl}/word-types`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wordTypes.set(response.data);
          if (!this.selectedType() && response.data.length > 0) {
            this.selectWordType(response.data[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => this.handleError('Failed to load word types', err),
    });
  }

  public selectWordType(type: WordType): void {
    this.selectedType.set(type);
    this.fetchWordsForType(type.id);
  }

  public fetchWordsForType(typeId: number): void {
    this.isLoading.set(true);
    this.http.get<WordsByTypeResponse>(`${this.apiUrl}/words/${typeId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wordsForSelectedType.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => this.handleError(`Failed to load words for type ID ${typeId}`, err),
    });
  }

  public addWord(word: Word): void {
    const selected = this.selectedType();
    const token: SelectedWordToken = {
      id: `${word.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: word.text,
      typeColor: selected?.color_code || '#6366F1',
      typeName: selected?.name || 'Word',
    };

    this.sentenceTokens.update((current) => [...current, token]);
    this.clearMessages();
  }

  public addPunctuation(mark: string): void {
    const token: SelectedWordToken = {
      id: `punc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: mark,
      typeColor: '#94a3b8',
      typeName: 'Punctuation',
    };

    this.sentenceTokens.update((current) => [...current, token]);
    this.clearMessages();
  }

  public removeTokenAt(index: number): void {
    this.sentenceTokens.update((current) => current.filter((_, i) => i !== index));
  }

  public clearCurrentSentence(): void {
    this.sentenceTokens.set([]);
    this.editingSentenceId.set(null);
    this.clearMessages();
  }

  public fetchSavedSentences(): void {
    this.isLoading.set(true);
    this.http.get<SentencesResponse>(`${this.apiUrl}/sentences`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.savedSentences.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => this.handleError('Failed to load saved sentences', err),
    });
  }

  public saveOrUpdateSentence(): void {
    const text = this.assembledText();

    if (!text || text.trim().length === 0) {
      this.errorMessage.set('Sentence canvas is empty. Please select words to form a sentence.');
      return;
    }

    const editId = this.editingSentenceId();
    this.isLoading.set(true);

    if (editId !== null) {
      this.http.put<SingleSentenceResponse>(`${this.apiUrl}/sentences/${editId}`, { text }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('Sentence updated successfully!');
          this.editingSentenceId.set(null);
          this.sentenceTokens.set([]);
          this.fetchSavedSentences();
        },
        error: (err) => this.handleError('Failed to update sentence', err),
      });
    } else {
      this.http.post<SingleSentenceResponse>(`${this.apiUrl}/sentences`, { text }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('Sentence saved successfully to database!');
          this.sentenceTokens.set([]);
          this.fetchSavedSentences();
        },
        error: (err) => this.handleError('Failed to save sentence', err),
      });
    }
  }

  public loadSentenceForEdit(sentence: Sentence): void {
    this.editingSentenceId.set(sentence.id);
    this.clearMessages();

    const words = sentence.text.trim().split(/\s+/);
    const tokens: SelectedWordToken[] = words.map((w, index) => ({
      id: `edit-${sentence.id}-${index}-${Date.now()}`,
      text: w,
      typeColor: '#6366f1',
      typeName: 'Saved Word',
    }));

    this.sentenceTokens.set(tokens);
  }

  public cancelEditing(): void {
    this.editingSentenceId.set(null);
    this.sentenceTokens.set([]);
    this.clearMessages();
  }

  public deleteSentence(id: number): void {
    if (!confirm('Are you sure you want to delete this saved sentence?')) return;

    this.isLoading.set(true);
    this.http.delete(`${this.apiUrl}/sentences/${id}`).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(`Sentence #${id} was deleted successfully.`);
        if (this.editingSentenceId() === id) {
          this.cancelEditing();
        }
        this.fetchSavedSentences();
      },
      error: (err) => this.handleError('Failed to delete sentence', err),
    });
  }

  private handleError(contextMessage: string, error: HttpErrorResponse): void {
    this.isLoading.set(false);
    const serverMessage = error?.error?.error?.message || error?.message || 'Server communication error';
    const fullMessage = `${contextMessage}: ${serverMessage}`;
    console.error(fullMessage, error);
    this.errorMessage.set(fullMessage);
  }

  public clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
