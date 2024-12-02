import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TodoDto } from './dto/todo.dto';
import { TodoOptionsDto } from './dto/todo-options.dto';
import { Todo } from '@prisma/client';
import { PaginatedTodosResponse } from 'src/types/todo-list.type';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, createTodo: TodoDto): Promise<Todo> {
    return await this.prisma.todo.create({
      data: { userId, ...createTodo },
    });
  }

  async getAll(
    userId: number,
    options: TodoOptionsDto,
  ): Promise<PaginatedTodosResponse> {
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
    } as PaginatedTodosResponse;
  }
}
