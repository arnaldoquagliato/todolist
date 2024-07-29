import { Hono } from 'hono';
import { signUp, signIn } from '../controllers/auth';

const authRoutes = new Hono();

authRoutes.post('/signup', signUp);
authRoutes.get('/signin', signIn);

export default authRoutes;
