import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

const userRepo = AppDataSource.getRepository(User);

const getIdFromParams = (param: string | string[]): number => {
    const idStr = Array.isArray(param) ? param[0] : param;
    const id = parseInt(idStr);
    if (isNaN(id)) throw new Error('Invalid user ID');
    return id;
};


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const existingUser = await userRepo.findOneBy({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepo.create({ email, password: hashedPassword });
        await userRepo.save(user);

        res.json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const signupUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) 
            return res.status(400).json({ message: 'Email and password required' });

        const existingUser = await userRepo.findOneBy({ email });
        if (existingUser) 
            return res.status(400).json({ message: 'User already exists' });

        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepo.create({ email, password: hashedPassword });
        await userRepo.save(user);

        
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({ 
            message: 'Signup successful', 
            accessToken 
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};



export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await userRepo.findOneBy({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid password' });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.json({ accessToken });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};


export const refreshToken = async (req: Request, res: Response) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

        const refreshToken = cookies.jwt;
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};


export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await userRepo.find({ select: ['id', 'email', 'isAdmin', 'createdAt'] });
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};


export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { email, password, isAdmin } = req.body;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

        await userRepo.save(user);
        res.json({ message: 'User updated successfully' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await userRepo.remove(user);
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
