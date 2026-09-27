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
  // Default to relative /api for Docker/nginx proxy, fallback to port 5000 in local dev
  private readonly apiUrl = 'http://localhost:5000/api';

  // ==========================================
  // Reactive State (Angular 18 Signals)
  // ==========================================
  readonly wordTypes = signal<WordType[]>([]);
  readonly selectedType = signal<WordType | null>(null);
  readonly wordsForSelectedType = signal<Word[]>([]);
  readonly sentenceTokens = signal<SelectedWordToken[]>([]);
  readonly savedSentences = signal<Sentence[]>([]);
  readonly editingSentenceId = signal<number | null>(null);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Computed Signal: The dynamically joined sentence string
  readonly assembledText = computed(() => {
    const tokens = this.sentenceTokens();
    if (tokens.length === 0) return '';
    
    // Join words with single space, handle punctuation nicely
    return tokens
      .map((t) => t.text)
      .join(' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();
  });

  // Computed Signal: Whether in Edit Mode
  readonly isEditing = computed(() => this.editingSentenceId() !== null);

  // Computed Signal: Word count of current sentence
  readonly wordCount = computed(() => this.sentenceTokens().length);

  constructor() {
    this.init();
  }

  /**
   * Initial data load
   */
  public init(): void {
    this.fetchWordTypes();
    this.fetchSavedSentences();
  }

  // ==========================================
  // US-01 & US-02: Word Types & Words API
  // ==========================================
  public fetchWordTypes(): void {
    this.isLoading.set(true);
    this.http.get<WordTypesResponse>(`${this.apiUrl}/word-types`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wordTypes.set(response.data);
          // Auto-select first type if none selected
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

  // ==========================================
  // US-03: Sentence Construction (In-Memory Canvas)
  // ==========================================
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

  // ==========================================
  // US-06: View Saved Sentences API
  // ==========================================
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

  // ==========================================
  // US-04: Save Sentence API (POST) & US-05: Update Sentence API (PUT)
  // ==========================================
  public saveOrUpdateSentence(): void {
    const text = this.assembledText();

    if (!text || text.trim().length === 0) {
      this.errorMessage.set('Sentence canvas is empty. Please select words to form a sentence.');
      return;
    }

    const editId = this.editingSentenceId();
    this.isLoading.set(true);

    if (editId !== null) {
      // US-05: PUT /api/sentences/:id
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
      // US-04: POST /api/sentences
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

  // ==========================================
  // US-05: Load Sentence into Editor for Edit Mode
  // ==========================================
  public loadSentenceForEdit(sentence: Sentence): void {
    this.editingSentenceId.set(sentence.id);
    this.clearMessages();

    // Split sentence text into individual tokens
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

  // ==========================================
  // Bonus: Delete Saved Sentence
  // ==========================================
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

  // ==========================================
  // Helper & Error Handling
  // ==========================================
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
