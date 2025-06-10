import 'dotenv/config.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { isPasswordValid, isUsernameValid } from './settingsController';

export async function login(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
    res.json({ user: { _id: user._id, username: user.username }, token });
}

export async function register(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Name and password required' });
    }

    const usernameValidError = isUsernameValid(username);
    if (usernameValidError !== null) {
        return res.status(400).json({ error: usernameValidError });
    }

    const passwordValidError = isPasswordValid(password);
    if (passwordValidError !== null) {
        return res.status(400).json({ error: passwordValidError });
    }

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash });

    await newUser.save();

    res.status(201).json({ user: { id: newUser._id, username: newUser.username } });
}
