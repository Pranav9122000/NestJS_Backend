import { ArticleService } from '@/article/arcticle.service';
import { CreateArticleDto } from '@/article/dto/createArticle.dto';
import { IArticleResponse } from '@/article/types/articleResponse.interface';
import { User } from '@/user/decorators/user.decorator';
import { AuthGuard } from '@/user/guards/auth.guard';
import { UserEntity } from '@/user/user.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.generateArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getSingleArticle(slug);
    return this.articleService.generateArticleResponse(article);
  }

  @Get()
  async getAllArticles(): Promise<IArticleResponse[]> {
    const articles = await this.articleService.getAllArticles();
    return articles.map((article) =>
      this.articleService.generateArticleResponse(article),
    );
  }
}
