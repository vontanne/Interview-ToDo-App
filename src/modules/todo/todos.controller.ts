import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodoDto } from './dto/todo.dto';
import { TodoOptionsDto } from './dto/todo-options.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/types/user-payload.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo item' })
  async create(@CurrentUser() user: UserPayload, @Body() todoDto: TodoDto) {
    const { id: userId } = user;
    return this.todosService.createTodo(userId, todoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get todos with filtering and pagination' })
  async getAll(
    @CurrentUser() user: UserPayload,
    @Query() query: TodoOptionsDto,
  ) {
    const { id: userId } = user;
    return this.todosService.getAll(userId, query);
  }
}
