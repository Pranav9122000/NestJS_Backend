import { ArticleEntity } from '@/article/article.entity';

export interface IGetAllArticleResponse {
  articles: ArticleEntity[];
  totalCount: number;
}
