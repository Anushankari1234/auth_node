import { Request, Response, Router } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  registerUserService,
  signupUserService,
  loginUserService,
  refreshTokenService,
  getUsersService,
  updateUserService,
  deleteUserService
} from '../services/userService';
import { registerSchema, loginSchema } from '../validation/validateUser';

const router = Router();

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map(d => d.message) });
  }

  const user = await registerUserService(value.email, value.password);
  res.json({ id: user.id, email: user.email });
});

router.post('/signup', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map(d => d.message) });
  }

  const { accessToken, refreshToken } =
    await signupUserService(value.email, value.password);

  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ accessToken });
});

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details.map(d => d.message) });
  }

  const { accessToken, refreshToken } =
    await loginUserService(value.email, value.password);

  setRefreshTokenCookie(res, refreshToken);
  res.json({ accessToken });
});

router.post('/refresh', async (req, res) => {
  if (!req.cookies?.jwt) return res.sendStatus(401);
  const accessToken = refreshTokenService(req.cookies.jwt);
  res.json({ accessToken });
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  res.json(await getUsersService());
});

router.put('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  res.json(await updateUserService(id, req.body));
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  await deleteUserService(id);
  res.sendStatus(204);
});

export default router;
