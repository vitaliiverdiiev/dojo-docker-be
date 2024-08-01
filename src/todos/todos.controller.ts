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

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  async findAll(
    @ActiveUser() user: ActiveUserData,
    @Request() req: Request,
  ): Promise<Todo[]> {
    console.log({ user });
    return this.todosService.findAll((req as any).user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Todo> {
    return this.todosService.findOne(id);
  }

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

  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto);
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
