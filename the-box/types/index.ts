export type Idea = {
  id: string;
  subject?: string;
  department: string;
  budget?: number;
  description: string;
  status: string;
  decision_reason?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  created_by: string;
  comment_count: number;
  vote_count: number;
};
