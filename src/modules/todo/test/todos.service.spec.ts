import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from '../todos.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TodoDto } from '../dto/todo.dto';
import { UpdateTodoStatusDto } from '../dto/update-todo-status.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TodoOptionsDto } from '../dto/todo-options.dto';
import { TodoStatusEnum } from '../enum/todo-status.enum';

describe('TodosService', () => {
  let todosService: TodosService;
  let prismaService: PrismaService;

  const mockTodo = {
    id: 1,
    userId: 1,
    title: 'Destroy the Death Star',
    description: 'Mission to destroy the Death Star',
    status: TodoStatusEnum.PENDING,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const createTodoDto: TodoDto = {
        title: 'Destroy the Death Star',
        description: "A mission to destroy the Empire's superweapon",
        status: TodoStatusEnum.PENDING,
        priority: 1,
      };

      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await todosService.createTodo(1, createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(prismaService.todo.create).toHaveBeenCalledWith({
        data: { userId: 1, ...createTodoDto },
      });
    });

    it('should throw InternalServerErrorException on Prisma error', async () => {
      mockPrismaService.todo.create.mockRejectedValue(
        new Error('Prisma Error'),
      );

      await expect(todosService.createTodo(1, {} as TodoDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateTodoFields', () => {
    it('should update fields of a todo', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 2,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue({
        ...mockTodo,
        ...updateTodoDto,
      });

      const result = await todosService.updateTodoFields(1, 1, updateTodoDto);

      expect(result.title).toEqual(updateTodoDto.title);
      expect(result.description).toEqual(updateTodoDto.description);
      expect(result.priority).toEqual(updateTodoDto.priority);
      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...updateTodoDto },
      });
    });

    it('should throw NotFoundException if the todo does not exist', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(
        todosService.updateTodoFields(1, 1, {} as UpdateTodoDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user does not own the todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: 2,
      });

      await expect(
        todosService.updateTodoFields(1, 1, {} as UpdateTodoDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException on Prisma error', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockRejectedValue(
        new Error('Prisma Error'),
      );

      await expect(
        todosService.updateTodoFields(1, 1, {} as UpdateTodoDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAll', () => {
    it('should return paginated todos with filters', async () => {
      const options: TodoOptionsDto = {
        status: TodoStatusEnum.PENDING,
        page: 1,
        limit: 10,
      };

      mockPrismaService.todo.findMany.mockResolvedValue([mockTodo]);
      mockPrismaService.todo.count.mockResolvedValue(1);

      const result = await todosService.getAll(1, options);

      expect(result.todos).toEqual([mockTodo]);
      expect(result.totalCount).toBe(1);
      expect(prismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId: 1, status: TodoStatusEnum.PENDING },
        skip: 0,
        take: 10,
      });
    });

    it('should throw InternalServerErrorException on Prisma error', async () => {
      mockPrismaService.todo.findMany.mockRejectedValue(
        new Error('Prisma Error'),
      );

      await expect(
        todosService.getAll(1, {} as TodoOptionsDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('changeStatus', () => {
    it('should update the status of a todo', async () => {
      const updateTodoStatusDto: UpdateTodoStatusDto = {
        status: TodoStatusEnum.COMPLETED,
      };

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue({
        ...mockTodo,
        status: TodoStatusEnum.COMPLETED,
      });

      const result = await todosService.changeStatus(1, 1, updateTodoStatusDto);

      expect(result.status).toEqual(TodoStatusEnum.COMPLETED);
      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: TodoStatusEnum.COMPLETED },
      });
    });

    it('should throw NotFoundException if the todo does not exist', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(
        todosService.changeStatus(1, 1, {} as UpdateTodoStatusDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user does not own the todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: 2,
      });

      await expect(
        todosService.changeStatus(1, 1, {} as UpdateTodoStatusDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('validateTodo', () => {
    it('should validate the ownership of a todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);

      await expect(todosService['validateTodo'](1, 1)).resolves.toBeUndefined();

      expect(prismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if the todo does not exist', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(todosService['validateTodo'](1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if the user does not own the todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: 2,
      });

      await expect(todosService['validateTodo'](1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
