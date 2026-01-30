import { Router } from 'express';
import {
    registerUser,
    loginUser,
    refreshToken,
    getUsers,
    updateUser,
    deleteUser,
    signupUser
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/signup', signupUser);
router.get('/', authenticateToken, getUsers);
router.put('/:id', authenticateToken, updateUser);   
router.delete('/:id', authenticateToken, deleteUser); 

export default router;
