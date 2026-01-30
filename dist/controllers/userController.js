"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
const getIdFromParams = (param) => {
    const idStr = Array.isArray(param) ? param[0] : param;
    const id = parseInt(idStr);
    if (isNaN(id))
        throw new Error('Invalid user ID');
    return id;
};
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await (0, userService_1.registerUserService)(email, password);
        res.json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await (0, userService_1.signupUserService)(email, password);
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({ message: 'Signup successful', accessToken });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await (0, userService_1.loginUserService)(email, password);
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt)
            return res.status(401).json({ message: 'Unauthorized' });
        const accessToken = (0, userService_1.refreshTokenService)(cookies.jwt);
        res.json({ accessToken });
    }
    catch (err) {
        res.status(403).json({ message: 'Forbidden' });
    }
});
router.get('/', async (req, res) => {
    try {
        const users = await (0, userService_1.getUsersService)();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const updatedUser = await (0, userService_1.updateUserService)(userId, req.body);
        res.json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const userId = getIdFromParams(req.params.id);
        await (0, userService_1.deleteUserService)(userId);
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.default = router;
