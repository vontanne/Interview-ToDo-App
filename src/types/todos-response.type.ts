import { TTodo } from './todo.type';

export type TPaginatedTodosResponse = {
  todos: TTodo[];
  totalCount: number;
};
