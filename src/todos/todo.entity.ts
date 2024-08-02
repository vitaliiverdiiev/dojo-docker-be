import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => User, (user) => user.todos, { eager: true })
  author: User;

  @Generated('increment')
  @Column()
  orderIndex: number;
}
