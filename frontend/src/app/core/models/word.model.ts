import { WordType } from './word-type.model';

export interface Word {
  id: number;
  word_type_id: number;
  text: string;
  created_at?: string;
  type_name?: string;
  color_code?: string;
}

export interface WordsByTypeResponse {
  success: boolean;
  wordType: WordType;
  count: number;
  data: Word[];
}

export interface SelectedWordToken {
  id: string; // unique instance ID (UUID/timestamp) for multiple occurrences in a sentence
  text: string;
  typeColor?: string;
  typeName?: string;
}
