import { ArticleService } from '@/article/arcticle.service';
import { ArticleController } from '@/article/article.controller';
import { ArticleEntity } from '@/article/article.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [],
})
export class ArticleModule {}
