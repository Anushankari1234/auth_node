import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './shared/utils/passport';
import userController from './controllers/userController';
import fileController from './controllers/fileController';
import { sendTestEmail, sendViaSendGrid } from './controllers/emailController';
import type { NextFunction, Request, Response } from 'express';
import { authenticateToken } from './middleware/auth';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' }
    })
);

app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/profile');
    }
);

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Unauthorized' });
};

app.get('/profile', isAuthenticated, (req, res) => res.json({ user: req.user }));

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});


app.use('/api/users', userController);

app.use('/api/files', authenticateToken, fileController);

app.post("/send-email", sendTestEmail);
app.post("/email/sendgrid", sendViaSendGrid);
app.get('/', (req, res) => res.send('API is running'));

export default app;
