import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodoDto } from './dto/todo.dto';
import { TodoOptionsDto } from './dto/todo-options.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TUserPayload } from 'src/types/user-payload.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';
import { TTodo } from 'src/types/todo.type';
import { UpdateTodoDto } from './dto/update-todo.dto';

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo item' })
  async create(@CurrentUser() user: TUserPayload, @Body() todoDto: TodoDto) {
    const { id: userId } = user;
    return this.todosService.createTodo(userId, todoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get todos with filtering and pagination' })
  async getAll(
    @CurrentUser() user: TUserPayload,
    @Query() query: TodoOptionsDto,
  ) {
    const { id: userId } = user;
    return this.todosService.getAll(userId, query);
  }

  @Patch('status/:id')
  @ApiOperation({ summary: 'Update todo status' })
  @ApiResponse({
    status: 200,
    description: 'The todo status was successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'An error occurred while updating the todo status.',
  })
  async changeStatus(
    @Param('id') id: number,
    @Body() updateTodoStatusDto: UpdateTodoStatusDto,
  ): Promise<TTodo> {
    return this.todosService.changeStatus(id, updateTodoStatusDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update todo fields' })
  async updateTodo(
    @Param('id') id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TTodo> {
    return this.todosService.updateTodoFields(id, updateTodoDto);
  }
}
