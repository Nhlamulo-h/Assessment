export interface WordType {
  id: number;
  name: string;
  code: string;
  description?: string;
  color_code: string;
  created_at?: string;
}

export interface WordTypesResponse {
  success: boolean;
  count: number;
  data: WordType[];
}