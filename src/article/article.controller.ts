import { ArticleService } from '@/article/arcticle.service';
import { CreateArticleDto } from '@/article/dto/createArticle.dto';
import { UpdateArticleDto } from '@/article/dto/updateArticle.dto';
import { IArticleResponse } from '@/article/types/articleResponse.interface';
import { IGetAllArticleResponse } from '@/article/types/getAllArticleResponse.interface';
import { User } from '@/user/decorators/user.decorator';
import { AuthGuard } from '@/user/guards/auth.guard';
import { UserEntity } from '@/user/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
  async getAllArticles(@Query() query: any): Promise<IGetAllArticleResponse> {
    return this.articleService.getAllArticles(query);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') userId: string,
  ): Promise<void> {
    return this.articleService.deleteArticle(slug, userId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @User('id') userId: string,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      userId,
    );
    return this.articleService.generateArticleResponse(article);
  }

  @Post(':slug/favourite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @Param('slug') slug: string,
    @User('id') userId: string,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      userId,
    );
    return this.articleService.generateArticleResponse(article);
  }

  @Delete(':slug/favourite')
  @UseGuards(AuthGuard)
  async removeArticleFromFavorites(
    @Param('slug') slug: string,
    @User('id') userId: string,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.removeArticleFromFavorites(
      slug,
      userId,
    );
    return this.articleService.generateArticleResponse(article);
  }
}
