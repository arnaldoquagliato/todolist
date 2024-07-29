import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import authRoutes from './routers/auth';
import todoRoutes from './routers/todo';

const app = new Hono();

app.get('/', (c) => c.json('Hello Node.js!'))
app.route('/auth', authRoutes);
app.route('/todos', todoRoutes);
serve({
    fetch: app.fetch,
    port: 8787,
})