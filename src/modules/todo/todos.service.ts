import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TodoDto } from './dto/todo.dto';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(userId: number, createTodo: TodoDto) {
    return this.prisma.todo.create({
      data: { userId, ...createTodo },
    });
  }

  async getAll(userId: number) {
    return this.prisma.todo.findMany({ where: { userId } });
  }
}
