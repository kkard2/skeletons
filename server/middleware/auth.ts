import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId: string;
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
        const payload = jwt.verify(token, process.env.JWT_TOKEN as string);
        (req as AuthRequest).userId = payload as string;
        next();
    } catch {
        res.sendStatus(403);
    }
}

export function verifySocketToken(socket: any, next: (err?: Error) => void) {
    try {
        const { token } = socket.handshake.auth;
        const payload = jwt.verify(token, process.env.JWT_TOKEN as string) as JwtPayload;
        socket.userId = payload.id;
        next();
    } catch {
        next(new Error('Unauthorized'));
    }
}
