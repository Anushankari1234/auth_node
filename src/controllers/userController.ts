import { Request, Response, Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
    registerUserService,
    signupUserService,
    loginUserService,
    refreshTokenService,
    getUsersService,
    updateUserService,
    deleteUserService
} from '../services/userService';

const router = Router();

const getIdFromParams = (param: string | string[]): number => {
    const idStr = Array.isArray(param) ? param[0] : param;
    const id = parseInt(idStr);
    if (isNaN(id)) throw new Error('Invalid user ID');
    return id;
};

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await registerUserService(email, password);
        res.json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await signupUserService(email, password);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'Signup successful', accessToken });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await loginUserService(email, password);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

        const accessToken = refreshTokenService(cookies.jwt);
        res.json({ accessToken });
    } catch (err: any) {
        res.status(403).json({ message: 'Forbidden' });
    }
});

router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const users = await getUsersService();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const updatedUser = await updateUserService(userId, req.body);
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = getIdFromParams(req.params.id);
        await deleteUserService(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
