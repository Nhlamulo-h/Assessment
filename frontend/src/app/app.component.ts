import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordSelectorComponent } from './components/word-selector/word-selector.component';
import { SentenceBuilderComponent } from './components/sentence-builder/sentence-builder.component';
import { SavedSentencesComponent } from './components/saved-sentences/saved-sentences.component';
import { SentenceService } from './core/services/sentence.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WordSelectorComponent,
    SentenceBuilderComponent,
    SavedSentencesComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public sentenceService = inject(SentenceService);
  public themeService = inject(ThemeService);

  onDismissAlert(): void {
    this.sentenceService.clearMessages();
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
