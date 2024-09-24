

export interface NewComment {
  author: string;
  text: string;
}

export interface Comment extends NewComment {
  url: string;
  created_date: string;
  approved_comment: boolean;
}

export interface NewPost {
  author: string;
  title: string;
  text: string;
}

export interface Post {
  url: string;
  created_date: string;
  published_date: string;
  comments: Comment[];
}
