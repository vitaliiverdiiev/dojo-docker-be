import { Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(id: number): Promise<Todo[]> {
    return await this.todosRepository.find({ where: { author: { id } } });
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const todo = this.todosRepository.create({
      title: createTodoDto.title,
      author: user,
    });

    // const todo = new Todo();
    // const { title } = createTodoDto;
    // todo.title = title;

    return await this.todosRepository.save(todo);
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    const { title, isCompleted } = updateTodoDto;
    todo.title = title;
    todo.isCompleted = isCompleted;

    return await this.todosRepository.save(todo);
  }

  async delete(id: number): Promise<{ message: string; deletedTodo: Todo }> {
    const todo = await this.findOne(id);

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    await this.todosRepository.delete(id);

    return {
      message: `Todo with ID ${id} has been successfully deleted`,
      deletedTodo: todo,
    };
  }
}
