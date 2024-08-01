import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './enums/role.enum';
import { BlogPost } from 'src/blog-posts/blog-post.entity';
import { Todo } from 'src/todos/todo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ enum: Role, default: Role.User })
  role: Role;

  @OneToMany(() => BlogPost, (blogPost) => blogPost.author)
  blogPosts: BlogPost[];

  @OneToMany(() => Todo, (todo) => todo.author)
  todos: Todo[];
}
