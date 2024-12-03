import { PickType } from '@nestjs/swagger';
import { TodoDto } from './todo.dto';

export class UpdateTodoStatusDto extends PickType(TodoDto, [
  'status',
] as const) {}
