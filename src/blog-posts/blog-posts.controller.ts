import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  Request,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { User } from 'src/users/user.entity';
import { Permissions } from 'src/iam/authorization/decorators/permissions.decorator';
import { Role } from 'src/users/enums/role.enum';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming JWT auth guard

@Controller('blog-posts')
// @UseGuards(JwtAuthGuard) // Protect all routes with JWT auth
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Roles(Role.User)
  @Post()
  async create(
    @Body() createBlogPostDto: CreateBlogPostDto,
    @Request() req: Request,
  ) {
    console.log('!!!!!!!!!!!!!!!!!!!', { req: (req as any).user });
    // Assuming @CurrentUser provides user information from JWT
    return this.blogPostsService.create(
      createBlogPostDto,
      (req as any).user.sub,
    ); // Use user ID from JWT
  }

  @Get()
  async findAll(@Request() req: Request) {
    console.log('--- BP Controller', (req as any).user.sub);
    return this.blogPostsService.findAll((req as any).user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.blogPostsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogPostsService.update(id, updateBlogPostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.blogPostsService.remove(id);
  }
}
