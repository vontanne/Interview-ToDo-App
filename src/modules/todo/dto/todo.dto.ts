import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';
import { TodoStatusEnum } from '../enum/todo-status.enum';

export class TodoDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 128)
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
