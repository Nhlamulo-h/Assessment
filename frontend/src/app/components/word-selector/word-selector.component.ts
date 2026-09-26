import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentenceService } from '../../core/services/sentence.service';
import { WordType } from '../../core/models/word-type.model';
import { Word } from '../../core/models/word.model';

@Component({
  selector: 'app-word-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-selector.component.html',
  styleUrls: ['./word-selector.component.css'],
})
export class WordSelectorComponent {
  public sentenceService = inject(SentenceService);

  readonly punctuations = ['.', ',', '!', '?', ';', ':'];

  onSelectType(type: WordType): void {
    this.sentenceService.selectWordType(type);
  }

  onAddWord(word: Word): void {
    this.sentenceService.addWord(word);
  }

  onAddPunctuation(punc: string): void {
    this.sentenceService.addPunctuation(punc);
  }
}
