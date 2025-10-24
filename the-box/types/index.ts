export type Idea = {
  id: string;
  company_id: string;
  subject?: string;
  budget?: number;
  description: string;
  status: string;
  decision_reason?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  created_by?: string;
  avatar_seed?: string;
  comment_count?: number;
  vote_count?: number;
};