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

export type Comment = {
  id: string;
  idea_id: string;
  content: string;
  commenter_role: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  user_name?: string;
  user_department?: string;
};
