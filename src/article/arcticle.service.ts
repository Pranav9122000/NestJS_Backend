import { ArticleEntity } from '@/article/article.entity';
import { CreateArticleDto } from '@/article/dto/createArticle.dto';
import { UpdateArticleDto } from '@/article/dto/updateArticle.dto';
import { IArticleResponse } from '@/article/types/articleResponse.interface';
import { IGetAllArticleResponse } from '@/article/types/getAllArticleResponse.interface';
import { UserEntity } from '@/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!article) {
      throw new HttpException('Article not found', 404);
    }
    return article;
  }

  async getAllArticles(query: any): Promise<IGetAllArticleResponse> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tags', {
        tags: `%${query.tag}%`,
      });
    }

    if (query.author) {
      queryBuilder.andWhere('author.username = :author', {
        author: query.author,
      });
    }

    if (query.limit) {
      queryBuilder.take(query.limit);
    }

    if (query.offset) {
      queryBuilder.skip(query.offset);
    }

    const [articles, totalCount] = await queryBuilder.getManyAndCount();

    return { articles, totalCount };
  }

  async deleteArticle(slug: string, userId: string): Promise<void> {
    const article = await this.getSingleArticle(slug);
    if (article.author.id !== userId) {
      throw new HttpException(
        'You are not authorized to delete this article',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.articleRepository.remove(article);
  }

  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
  ): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);
    if (article.author.id !== userId) {
      throw new HttpException(
        'You are not authorized to update this article',
        HttpStatus.UNAUTHORIZED,
      );
    }
    Object.assign(article, updateArticleDto);
    if (updateArticleDto.title) {
      article.slug = this.generateSlugTitle(updateArticleDto.title);
    }
    return this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    userId: string,
  ): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const isNotFavorited = !user.favorites.find(
      (favArticle) => favArticle.slug === article.slug,
    );

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount += 1;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  async removeArticleFromFavorites(
    slug: string,
    userId: string,
  ): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const favoriteIndex = user.favorites.findIndex(
      (favArticle) => favArticle.slug === article.slug,
    );

    if (favoriteIndex >= 0) {
      user.favorites.splice(favoriteIndex, 1);
      article.favoritesCount -= 1;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
}
