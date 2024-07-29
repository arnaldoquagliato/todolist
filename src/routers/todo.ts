import { Hono } from 'hono';
import { createTodo, getTodos, updateTodo, deleteTodo } from '../controllers/todo';
import authMiddleware from '../middleware/auth';

const todoRoutes = new Hono();

todoRoutes.use('*', authMiddleware);
todoRoutes.post('/', createTodo);
todoRoutes.get('/', getTodos);
todoRoutes.put('/:task_id', updateTodo);
todoRoutes.delete('/:task_id', deleteTodo);

export default todoRoutes;
