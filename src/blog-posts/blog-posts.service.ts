import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private blogPostsRepository: Repository<BlogPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createBlogPostDto: CreateBlogPostDto,
    userId: number,
  ): Promise<BlogPost> {
    const user = await this.userRepository.findOneBy({ id: userId }); // Assuming userRepository is injected
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const blogPost = this.blogPostsRepository.create({
      ...createBlogPostDto,
      author: user,
    });
    return this.blogPostsRepository.save(blogPost);
  }

  async findAll(userId?: number): Promise<BlogPost[]> {
    // const queryBuilder =
    //   this.blogPostsRepository.createQueryBuilder('blogPost');

    // if (userId) {
    //   queryBuilder.where(
    //     'blogPost.authorId = :userId OR blogPost.isPublished = true',
    //     { userId },
    //   );
    // } else {
    //   queryBuilder.where('blogPost.isPublished = true');
    // }

    // return queryBuilder.getMany();
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.blogPostsRepository.find({
      where: [{ isPublished: true }, { author: user }],
      relations: ['author'],
    });
  }

  async findAllPublishedOrUserPosts(userId: number): Promise<BlogPost[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.blogPostsRepository.find({
      where: [{ isPublished: true }, { author: user }],
      relations: ['author'],
    });
  }

  async findOne(id: number): Promise<BlogPost> {
    const blogPost = await this.blogPostsRepository.findOneBy({ id });
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return blogPost;
  }

  async update(
    id: number,
    updateBlogPostDto: UpdateBlogPostDto,
  ): Promise<BlogPost> {
    const blogPost = await this.blogPostsRepository.findOneBy({ id });
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }

    Object.assign(blogPost, updateBlogPostDto);
    return this.blogPostsRepository.save(blogPost);
  }

  async remove(id: number): Promise<void> {
    const blogPost = await this.blogPostsRepository.findOneBy({ id });
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    await this.blogPostsRepository.remove(blogPost);
  }
}
