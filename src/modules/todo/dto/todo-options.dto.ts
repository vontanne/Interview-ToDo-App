import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { TodoStatusEnum } from '../enum/todo-status.enum';

export class TodoOptionsDto {
  @IsOptional()
  @IsEnum(TodoStatusEnum, { message: 'status must be a valid TodoStatus' })
  status?: TodoStatusEnum;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'priority must be greater than or equal to 1' })
  @Max(3, { message: 'priority must be less than or equal to 3' })
  priority?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'limit must be greater than or equal to 1' })
  limit?: number = 10;
}
