import { Context } from 'hono';
import pool from '../utils/db';
import { Todo } from '../models/todo';

const createTodo = async (c: Context) => {
    const user = c.req.user;  
    if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
    }

    const { task_description } = await c.req.json();

    const status = await pool.query('SELECT * FROM status WHERE status_name = $1', ['todo']);

    const result = await pool.query(
        'INSERT INTO todolist (user_id, task_description, status_id) VALUES ($1, $2, $3) RETURNING *',
        [user.user_id, task_description, status.rows[0].status_id]
    );

    const todo: Todo = result.rows[0];
    return c.json({
        description: task_description,
        create_at: result.rows[0].created_at,
        status: "todo"
    });
};

const getTodos = async (c: Context) => {
    const user = c.req.user;  
    if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
    }

    const result = await pool.query(`
        SELECT 
            todolist.task_description, 
            todolist.created_at, 
            status.status_name,
            todolist.task_id 
        FROM 
            todolist 
        LEFT JOIN 
            status 
        ON 
            todolist.status_id = status.status_id 
        WHERE 
            todolist.user_id = $1
    `, [user.user_id]);
    
    const todos = result.rows;
    return c.json(todos.map(item => {
        return {
            description: item.task_description,
            create_at: item.created_at,
            status: item.status_name,
            task_id: item.task_id
        };
    }));
    
};

const updateTodo = async (c: Context) => {
    const user = c.req.user;  
    if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
    }

    const task_id = c.req.param('task_id');
    
    const { task_description, status } = await c.req.json();
    
    const currentStatus = await pool.query('SELECT * FROM status WHERE status_name = $1', [status]);

    const result = await pool.query(
        'UPDATE todolist SET task_description = $1, status_id = $2 WHERE user_id = $3 AND task_id = $4 RETURNING *',
        [task_description, currentStatus.rows[0].status_id, user.user_id, task_id]
    );

    const todo: Todo = result.rows[0];
    return c.json(todo);
};

const deleteTodo = async (c: Context) => {
    const user = c.req.user;  
    if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
    }

    const task_id = c.req.param('task_id');

    await pool.query('DELETE FROM todolist WHERE user_id = $1 AND task_id = $2', [user.user_id, task_id]);

    return c.json({ message: 'Task deleted' });
};

export { createTodo, getTodos, updateTodo, deleteTodo };
