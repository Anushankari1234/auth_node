import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
    userId?: number;
}

interface JwtPayload {
    userId: number;
    iat?: number;
    exp?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, payload) => {
        if (err) return res.sendStatus(403);

        const jwtPayload = payload as JwtPayload;
        req.userId = jwtPayload.userId;

        next();
    });
};
