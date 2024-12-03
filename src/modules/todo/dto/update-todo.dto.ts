import { PartialType, OmitType } from '@nestjs/swagger';
import { TodoDto } from './todo.dto';

export class UpdateTodoDto extends PartialType(
  OmitType(TodoDto, ['status'] as const),
) {}
