"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./shared/utils/passport"));
const userController_1 = __importDefault(require("./controllers/userController"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/profile');
});
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    res.status(401).json({ message: 'Unauthorized' });
};
app.get('/profile', isAuthenticated, (req, res) => res.json({ user: req.user }));
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
app.use('/api/users', userController_1.default);
app.get('/', (req, res) => res.send('API is running'));
exports.default = app;
