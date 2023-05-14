export interface IPost {
  id: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
  };
  created_at: number;
  updated_at: number;
  content: string;
  image: string;
}
