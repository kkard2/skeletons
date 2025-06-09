import 'dotenv/config';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export function isUsernameValid(username: string): string | null {
    if (username.length >= 3 && username.length <= 16 && /^[a-zA-Z0-9_]+$/.test(username))
        return null;
    else
        return 'Username must be 3-16 characters long and only contain letters, underscores and numbers';
}

export function isPasswordValid(password: string): string | null {
    return password.length >= 8 ? null : 'Password must be at least 8 characters';
}

export async function changeUsername(req: AuthRequest, res: Response) {
    const { newUsername } = req.body;

    if (!newUsername) {
        return res.status(400).json({ error: 'Missing new username' });
    }

    const usernameError = isUsernameValid(newUsername);
    if (usernameError !== null) {
        return res.status(400).json({ error: usernameError });
    }

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await User.findOne({ _id: req.userId });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.username = newUsername;
    await user.save();

    res.status(200).json({ message: 'Username changed' });
}

export async function changePassword(req: AuthRequest, res: Response) {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const passwordValidError = isPasswordValid(newPassword);
    if (passwordValidError !== null) {
        return res.status(400).json({ error: passwordValidError });
    }

    const user = await User.findOne({ _id: req.userId });
    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed' });
}
