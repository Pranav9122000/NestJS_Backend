import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsNotEmpty({ message: 'Title should not be empty' })
  title?: string;

  @IsString()
  description?: string;

  @IsString()
  body?: string;
}
