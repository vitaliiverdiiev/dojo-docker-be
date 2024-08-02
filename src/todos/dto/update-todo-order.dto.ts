import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateTodoOrderDto {
  @IsString()
  id: string;

  @IsInt()
  orderIndex: number;
}

export class UpdateTodosOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTodoOrderDto)
  todos: UpdateTodoOrderDto[];
}
