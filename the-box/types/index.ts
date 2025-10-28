export type Idea = {
  id: string;
  company_id: string;
  subject?: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  avatar_seed?: string;
  comment_count?: number;
  department: string;
};
