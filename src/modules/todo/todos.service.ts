import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TodoDto } from './dto/todo.dto';
import { TodoOptionsDto } from './dto/todo-options.dto';
import { TPaginatedTodosResponse } from 'src/types/todos-response.type';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { TTodo } from 'src/types/todo.type';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, createTodo: TodoDto): Promise<TTodo> {
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
      const where: Partial<TTodo> = { userId };

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

  async changeStatus(
    userId: number,
    todoId: number,
    updateTodoStatusDto: UpdateTodoStatusDto,
  ): Promise<TTodo> {
    const { status } = updateTodoStatusDto;

    try {
      await this.validateTodo(userId, todoId);

      return await this.prisma.todo.update({
        where: { id: todoId },
        data: { status },
      });
    } catch (ex) {
      if (ex instanceof NotFoundException || ex instanceof ForbiddenException) {
        throw ex;
      }

      throw new InternalServerErrorException(
        `An error occurred while updating the todo status.`,
      );
    }
  }

  async updateTodoFields(
    userId: number,
    todoId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<TTodo> {
    try {
      await this.validateTodo(userId, todoId);

      return await this.prisma.todo.update({
        where: { id: todoId },
        data: { ...updateTodoDto },
      });
    } catch (ex) {
      if (ex instanceof NotFoundException || ex instanceof ForbiddenException) {
        throw ex;
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the todo.',
      );
    }
  }

  async deleteTodo(userId: number, todoId: number): Promise<void> {
    try {
      await this.validateTodo(userId, todoId);

      await this.prisma.todo.delete({
        where: { id: todoId },
      });
    } catch (ex) {
      if (ex instanceof NotFoundException || ex instanceof ForbiddenException) {
        throw ex;
      }

      throw new InternalServerErrorException(
        'An error occurred while deleting the todo.',
      );
    }
  }

  private async validateTodo(userId: number, todoId: number): Promise<void> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${todoId} not found.`);
    }

    if (userId !== todo.userId) {
      throw new ForbiddenException(
        `You do not have permission to access this todo.`,
      );
    }
  }
}
