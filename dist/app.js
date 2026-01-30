"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./utils/passport"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    res.status(401).json({ message: 'Unauthorized' });
};
app.get('/profile', isAuthenticated, (req, res) => {
    res.json({ user: req.user });
});
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
app.get('/', (req, res) => res.send('API is running'));
exports.default = app;
