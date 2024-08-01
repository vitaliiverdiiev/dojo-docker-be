import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogPostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
