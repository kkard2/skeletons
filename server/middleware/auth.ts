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
        const payload = jwt.verify(token, process.env.JWT_TOKEN as string) as JwtPayload;
        (req as AuthRequest).userId = payload.id;
        next();
    } catch {
        res.sendStatus(403);
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('No token');
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).send('No token');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        (req as AuthRequest).userId = decoded.id;
        next();
    } catch {
        res.status(401).send('Invalid token');
    }
}
