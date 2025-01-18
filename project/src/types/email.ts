export interface EmailTemplate {
  id?: string;
  title: string;
  content: string;
  footer: string;
  imageUrl?: string;
  styles?: {
    titleColor?: string;
    titleSize?: string;
    contentColor?: string;
    contentSize?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  sections?: EmailSection[];
  created_at?: string;
  updated_at?: string;
}

export interface EmailSection {
  id: string;
  type: 'text' | 'image';
  content: string;
  order: number;
  styles?: {
    color?: string;
    fontSize?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}