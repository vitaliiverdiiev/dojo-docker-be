import { DbEntity } from 'src/entities/DbEntity';
import { User } from 'src/users/user.entity';
import { Column, Entity, Generated, ManyToOne } from 'typeorm';

@Entity()
export class Todo extends DbEntity {
  @Column()
  title: string;

  @Column({
    nullable: true,
    default: '',
  })
  content: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => User, (user) => user.todos, { eager: true })
  author: User;

  @Generated('increment')
  @Column()
  orderIndex: number;

  @Column({ default: false })
  isImportant: boolean;
}
