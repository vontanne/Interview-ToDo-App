import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodoDto } from './dto/todo.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/types/user-payload.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@CurrentUser() user: UserPayload, @Body() todoDto: TodoDto) {
    const { id: userId } = user;
    return this.todosService.createTodo(userId, todoDto);
  }

  @Get()
  async getAll(@CurrentUser() user: UserPayload) {
    const { id: userId } = user;
    return this.todosService.getAll(userId);
  }
}
