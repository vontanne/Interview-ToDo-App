import { Todo } from '@prisma/client';

export type PaginatedTodosResponse = {
  todos: Todo[];
  totalCount: number;
};
