import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TodoDto } from './dto/todo.dto';
import { TodoOptionsDto } from './dto/todo-options.dto';
import { Todo } from '@prisma/client';
import { TPaginatedTodosResponse } from 'src/types/todos-response.type';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, createTodo: TodoDto): Promise<Todo> {
    try {
      return await this.prisma.todo.create({
        data: { userId, ...createTodo },
      });
    } catch (ex) {
      throw new InternalServerErrorException(
        `An error occurred while creating the todo`,
      );
    }
  }

  async getAll(
    userId: number,
    options: TodoOptionsDto,
  ): Promise<TPaginatedTodosResponse> {
    try {
      const { status, priority, page = 1, limit = 10 } = options;
      const where: Partial<Todo> = { userId };

      if (status) where.status = status;
      if (priority) where.priority = priority;

      const todos = await this.prisma.todo.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalCount = await this.prisma.todo.count({ where });

      return {
        todos,
        totalCount,
      } as TPaginatedTodosResponse;
    } catch (ex) {
      throw new InternalServerErrorException(
        `An error occurred while retrieving todos`,
      );
    }
  }
}
