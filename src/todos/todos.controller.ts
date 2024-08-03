import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { Todo } from './todo.entity';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { Role } from 'src/users/enums/role.enum';
import { Permission } from 'src/iam/authorization/permission.type';
import { Permissions } from 'src/iam/authorization/decorators/permissions.decorator';
import { UpdateTodosOrderDto } from './dto/update-todo-order.dto';
import { IMeta } from 'src/models/interfaces/IMeta';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // @Roles(Role.Admin)
  @Permissions(Permission.CreateTodo)
  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: Request,
  ): Promise<Todo> {
    console.log('!!! HARDIK !!!', {
      requestik: (req as any).user,
      bodiushka: createTodoDto,
    });
    return this.todosService.create(createTodoDto, (req as any).user.sub);
  }

  @Get()
  async findAll(
    @ActiveUser() user: ActiveUserData,
    @Request() req: Request,
  ): Promise<{ todos: Todo[]; meta: IMeta }> {
    console.log({ user });
    return this.todosService.findAll((req as any).user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Roles(Role.User)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: Request,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto, (req as any).user.sub);
  }

  @Post('update-order')
  async updateOrder(
    @Body() updateTodosOrderDto: UpdateTodosOrderDto,
    @Request() req: Request,
  ): Promise<void> {
    return this.todosService.updateOrder(
      updateTodosOrderDto,
      (req as any).user.sub,
    );
  }

  // @Roles(Role.Admin)
  @Permissions(Permission.DeleteTodo)
  @Delete(':id')
  async deleteTodo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; deletedTodo: Todo }> {
    return this.todosService.delete(id);
  }
}
