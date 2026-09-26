export interface Sentence {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface SentencesResponse {
  success: boolean;
  count: number;
  data: Sentence[];
}

export interface SingleSentenceResponse {
  success: boolean;
  message?: string;
  data: Sentence;
}

export interface CreateSentencePayload {
  text: string;
}

export interface UpdateSentencePayload {
  text: string;
}
