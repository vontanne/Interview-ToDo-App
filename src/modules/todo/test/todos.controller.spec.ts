import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from '../todos.controller';
import { TodosService } from '../todos.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TUserPayload } from '../../../types/user-payload.type';
import { TodoDto } from '../dto/todo.dto';
import { TodoOptionsDto } from '../dto/todo-options.dto';
import { UpdateTodoStatusDto } from '../dto/update-todo-status.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TTodo } from '../../../types/todo.type';
import { TodoStatusEnum } from '../enum/todo-status.enum';

describe('TodosController', () => {
  let controller: TodosController;
  let service: TodosService;

  // Mocked service methods
  const mockTodosService = {
    createTodo: jest.fn(),
    getAll: jest.fn(),
    changeStatus: jest.fn(),
    updateTodoFields: jest.fn(),
    deleteTodo: jest.fn(),
  };

  // Mock user payload (Darth Vader as the user)
  const mockUser: TUserPayload = {
    id: 66,
    email: 'darthvader@deathstar.empire',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: mockTodosService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock guard for authentication
      .compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo for Darth Vader', async () => {
      const todoDto: TodoDto = {
        title: 'Conquer the galaxy',
        description: 'Defeat the Jedi Order',
      };
      const createdTodo: TTodo = {
        id: 1,
        title: 'Conquer the galaxy',
        description: 'Defeat the Jedi Order',
        status: TodoStatusEnum.PENDING,
        priority: 1,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTodosService.createTodo.mockResolvedValue(createdTodo);

      const result = await controller.create(mockUser, todoDto);

      expect(result).toEqual(createdTodo);
      expect(mockTodosService.createTodo).toHaveBeenCalledWith(
        mockUser.id,
        todoDto,
      );
    });
  });

  describe('getAll', () => {
    it("should return Darth Vader's todo list", async () => {
      const query: TodoOptionsDto = { page: 1, limit: 10 };
      const todos: TTodo[] = [
        {
          id: 1,
          title: 'Conquer the galaxy',
          description: 'Defeat the Jedi Order',
          status: TodoStatusEnum.PENDING,
          priority: 1,
          userId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockTodosService.getAll.mockResolvedValue(todos);

      const result = await controller.getAll(mockUser, query);

      expect(result).toEqual(todos);
      expect(mockTodosService.getAll).toHaveBeenCalledWith(mockUser.id, query);
    });
  });

  describe('changeStatus', () => {
    it('should mark "Conquer the galaxy" as COMPLETED', async () => {
      const updateStatusDto: UpdateTodoStatusDto = {
        status: TodoStatusEnum.COMPLETED,
      };
      const updatedTodo: TTodo = {
        id: 1,
        title: 'Conquer the galaxy',
        description: 'Defeat the Jedi Order',
        status: TodoStatusEnum.COMPLETED,
        priority: 1,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTodosService.changeStatus.mockResolvedValue(updatedTodo);

      const result = await controller.changeStatus(
        mockUser,
        1,
        updateStatusDto,
      );

      expect(result).toEqual(updatedTodo);
      expect(mockTodosService.changeStatus).toHaveBeenCalledWith(
        mockUser.id,
        1,
        updateStatusDto,
      );
    });
  });

  describe('updateTodo', () => {
    it('should rename "Conquer the galaxy" to "Rule the galaxy"', async () => {
      const updateTodoDto: UpdateTodoDto = { title: 'Rule the galaxy' };
      const updatedTodo: TTodo = {
        id: 1,
        title: 'Rule the galaxy',
        description: 'Defeat the Jedi Order',
        status: TodoStatusEnum.PENDING,
        priority: 1,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTodosService.updateTodoFields.mockResolvedValue(updatedTodo);

      const result = await controller.updateTodo(mockUser, 1, updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(mockTodosService.updateTodoFields).toHaveBeenCalledWith(
        mockUser.id,
        1,
        updateTodoDto,
      );
    });
  });

  describe('deleteTodo', () => {
    it('should delete "Conquer the galaxy"', async () => {
      mockTodosService.deleteTodo.mockResolvedValue(undefined);

      await controller.deleteTodo(mockUser, 1);

      expect(mockTodosService.deleteTodo).toHaveBeenCalledWith(mockUser.id, 1);
    });
  });
});
