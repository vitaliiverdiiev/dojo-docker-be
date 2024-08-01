import { Module } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPost } from './blog-post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, User])],
  providers: [BlogPostsService],
  controllers: [BlogPostsController],
})
export class BlogPostsModule {}
