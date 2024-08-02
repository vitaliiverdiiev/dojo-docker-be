import { Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from 'src/users/user.entity';
import { UpdateTodosOrderDto } from './dto/update-todo-order.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(id: number): Promise<Todo[]> {
    return await this.todosRepository.find({
      where: { author: { id } },
      order: { orderIndex: 'ASC' }, // Sorting by orderIndex in ascending order
    });
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['author'],
    });

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

  async updateOrder(updateTodosOrderDto: UpdateTodosOrderDto): Promise<void> {
    const queryRunner =
      this.todosRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { id, orderIndex } of updateTodosOrderDto.todos) {
        await queryRunner.manager.update(Todo, id, { orderIndex });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
