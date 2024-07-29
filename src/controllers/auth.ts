import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import { User } from '../models/user';

const signUp = async (c: Context) => {
    const { email, password } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const findEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if(findEmail.rows[0]){
        return c.json({ error: 'Invalid email' }, 400);
    }

    const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id',
        [email, hashedPassword]
    );

    const user: User = result.rows[0];
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return c.json({ token });
};

const signIn = async (c: Context) => {
    const email = c.req.header('email');
    const password = c.req.header('password');

    if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }

    const user: User = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return c.json({ token });
};

export { signUp, signIn };
