"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserService = exports.updateUserService = exports.getUsersService = exports.refreshTokenService = exports.loginUserService = exports.signupUserService = exports.registerUserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepo_1 = require("../repositories/userRepo");
const jwt_1 = require("../shared/utils/jwt");
const registerUserService = async (email, password) => {
    const existingUser = await (0, userRepo_1.findUserByEmail)(email);
    if (existingUser)
        throw new Error('User already exists');
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = (0, userRepo_1.createUser)({ email, password: hashedPassword });
    return await (0, userRepo_1.saveUser)(user);
};
exports.registerUserService = registerUserService;
const signupUserService = async (email, password) => {
    const user = await (0, exports.registerUserService)(email, password);
    const accessToken = (0, jwt_1.generateAccessToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    return { user, accessToken, refreshToken };
};
exports.signupUserService = signupUserService;
const loginUserService = async (email, password) => {
    const user = await (0, userRepo_1.findUserByEmail)(email);
    if (!user)
        throw new Error('User not found');
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid)
        throw new Error('Invalid password');
    const accessToken = (0, jwt_1.generateAccessToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    return { accessToken, refreshToken, user };
};
exports.loginUserService = loginUserService;
const refreshTokenService = (refreshToken) => {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return accessToken;
};
exports.refreshTokenService = refreshTokenService;
const getUsersService = () => (0, userRepo_1.getAllUsers)();
exports.getUsersService = getUsersService;
const updateUserService = async (userId, data) => {
    const user = await (0, userRepo_1.findUserById)(userId);
    if (!user)
        throw new Error('User not found');
    if (data.password)
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    Object.assign(user, data);
    return (0, userRepo_1.saveUser)(user);
};
exports.updateUserService = updateUserService;
const deleteUserService = async (userId) => {
    const user = await (0, userRepo_1.findUserById)(userId);
    if (!user)
        throw new Error('User not found');
    return (0, userRepo_1.deleteUserRepo)(user);
};
exports.deleteUserService = deleteUserService;
