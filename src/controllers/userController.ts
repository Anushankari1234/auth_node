import { Request, Response, Router } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  registerUserService,
  signupUserService,
  loginUserService,
  refreshTokenService,
  getUsersService,
  updateUserService,
  deleteUserService,
  getUserByIdService,
  getUserByName,
  logoutUserService
} from '../services/userService';
import { registerSchema, loginSchema } from '../validation/validateUser';
import { emailQueue } from "../queues/emailQueue"


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
  const result = registerSchema.safeParse(req.body);

  if(! result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(e => e.message),
    });
  }

  const { email, password } = result.data;

  const user = await registerUserService(email, password);
  await emailQueue.add("send-welcome-email", {
    email,
  });


  res.json({  message: "User registered. Email will be sent shortly.", id: user.id, email: user.email });
});

router.post('/signup', async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(e => e.message),
    });
  }

  const { email, password } = result.data;

  const { accessToken, refreshToken } =
    await signupUserService(email, password);

  await emailQueue.add("send-welcome-email", {
    email,
  });


  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({  message: "User registered. Email will be sent shortly.", accessToken });
});


router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(e => e.message),
    });
  }

  const { email, password } = result.data;

  const { accessToken, refreshToken } =
    await loginUserService(email, password);

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



router.get('/alphabetical/', authenticateToken, async( req: AuthRequest, res)=>{
  res.json(await getUserByName())
})


router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const user = await getUserByIdService(id);
  res.json(user);
});

router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || !req.userId) {
    return res.sendStatus(400);
  }

  
  await logoutUserService(req.userId, token);

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.sendStatus(204);
});




export default router;
