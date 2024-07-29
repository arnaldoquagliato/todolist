import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { User } from "../models/user";
const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
        return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
        c.req.user = decoded;
        await next();
    } catch (err) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};

export default authMiddleware;
