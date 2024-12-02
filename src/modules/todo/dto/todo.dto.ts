import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { TodoStatusEnum } from '../enum/todo-status.enum';

export class TodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TodoStatusEnum)
  status?: TodoStatusEnum;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;
}
