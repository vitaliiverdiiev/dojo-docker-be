import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from 'src/users/user.entity';
import { UpdateTodosOrderDto } from './dto/update-todo-order.dto';
import { IMeta } from 'src/models/interfaces/IMeta';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const todo = this.todosRepository.create({
      title: createTodoDto.title,
      content: createTodoDto.content,
      author: user,
    });

    return await this.todosRepository.save(todo);
  }

  async findAll(userId: number): Promise<{
    todos: Todo[];
    meta: IMeta;
  }> {
    const todos = await this.todosRepository.find({
      where: { author: { id: userId } },
      order: { orderIndex: 'DESC' },
    });

    const total = todos.length;
    const important = todos.filter((todo) => todo.isImportant).length;
    const completed = todos.filter((todo) => todo.isCompleted).length;

    return {
      todos,
      meta: {
        total,
        important,
        completed,
      },
    };
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

  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    userId: number,
  ): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id, author: { id: userId } },
    });

    if (!todo) {
      throw new NotFoundException(
        `Todo with ID ${id} not found or you don't have permission to update it`,
      );
    }

    const { title, content, isCompleted, isImportant } = updateTodoDto;
    if (title !== undefined) todo.title = title;
    if (content !== undefined) todo.content = content;
    if (isCompleted !== undefined) todo.isCompleted = isCompleted;
    if (isImportant !== undefined) todo.isImportant = isImportant;

    return await this.todosRepository.save(todo);
  }

  async updateOrder(
    updateTodosOrderDto: UpdateTodosOrderDto,
    userId: number,
  ): Promise<void> {
    const queryRunner =
      this.todosRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { id, orderIndex } of updateTodosOrderDto.todos) {
        const todo = await queryRunner.manager.findOne(Todo, {
          where: { id: +id, author: { id: userId } },
        });

        if (!todo) {
          throw new NotFoundException(
            `Todo with ID ${id} not found or you don't have permission to update it`,
          );
        }

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
