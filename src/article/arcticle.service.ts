import { ArticleEntity } from '@/article/article.entity';
import { CreateArticleDto } from '@/article/dto/createArticle.dto';
import { IArticleResponse } from '@/article/types/articleResponse.interface';
import { UserEntity } from '@/user/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(user: UserEntity, createArticleDto: CreateArticleDto) {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (article.tagList == null || article.tagList.length === 0) {
      article.tagList = [];
    }
    article.slug = this.generateSlugTitle(createArticleDto.title);
    article.author = user;
    return this.articleRepository.save(article);
  }

  generateArticleResponse(article: ArticleEntity): IArticleResponse {
    return { article };
  }

  generateSlugTitle(title: string): string {
    const uniqueSuffix =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    title = `${title}-${uniqueSuffix}`;
    return slugify(title, { lower: true });
  }

  async getSingleArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException('Article not found', 404);
    }
    return article;
  }

  async getAllArticles(): Promise<ArticleEntity[]> {
    return this.articleRepository.find();
  }
}
