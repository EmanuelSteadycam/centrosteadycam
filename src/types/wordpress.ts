export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: WPTerm[][];
  };
}

export interface WPPage {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  featured_media: number;
  parent: number;
  template: string;
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
  };
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  source_url: string;
  alt_text: string;
  caption: { rendered: string };
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      thumbnail?: WPImageSize;
      medium?: WPImageSize;
      large?: WPImageSize;
      full?: WPImageSize;
      [key: string]: WPImageSize | undefined;
    };
  };
  mime_type: string;
}

export interface WPImageSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  parent: number;
}

export interface WPTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPAdamArchivio {
  id: number;
  date: string;
  slug: string;
  status: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
}

export interface WPApiResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}
