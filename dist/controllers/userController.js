"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = exports.refreshToken = exports.loginUser = exports.signupUser = exports.registerUser = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt");
const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
const getIdFromParams = (param) => {
    const idStr = Array.isArray(param) ? param[0] : param;
    const id = parseInt(idStr);
    if (isNaN(id))
        throw new Error('Invalid user ID');
    return id;
};
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });
        const existingUser = await userRepo.findOneBy({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = userRepo.create({ email, password: hashedPassword });
        await userRepo.save(user);
        res.json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.registerUser = registerUser;
const signupUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });
        const existingUser = await userRepo.findOneBy({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = userRepo.create({ email, password: hashedPassword });
        await userRepo.save(user);
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
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
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.signupUser = signupUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });
        const user = await userRepo.findOneBy({ email });
        if (!user)
            return res.status(400).json({ message: 'User not found' });
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid)
            return res.status(400).json({ message: 'Invalid password' });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.loginUser = loginUser;
const refreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt)
            return res.status(401).json({ message: 'Unauthorized' });
        const refreshToken = cookies.jwt;
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};
exports.refreshToken = refreshToken;
const getUsers = async (req, res) => {
    try {
        const users = await userRepo.find({ select: ['id', 'email', 'isAdmin', 'createdAt'] });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const { email, password, isAdmin } = req.body;
        if (email)
            user.email = email;
        if (password)
            user.password = await bcryptjs_1.default.hash(password, 10);
        if (typeof isAdmin === 'boolean')
            user.isAdmin = isAdmin;
        await userRepo.save(user);
        res.json({ message: 'User updated successfully' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = getIdFromParams(req.params.id);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        await userRepo.remove(user);
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.deleteUser = deleteUser;
