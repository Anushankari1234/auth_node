import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, saveUser, createUser, deleteUserRepo, getAllUsers, orderByName } from '../repositories/userRepo';
import { generateAccessToken, generateRefreshToken } from '../shared/utils/jwt';
import { storeAccessToken } from '../repositories/redisRepo';
import { User } from '../models/User';
import { blacklistToken } from '../repositories/redisRepo';

export const registerUserService = async (email: string, password: string) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser({ email, password: hashedPassword });
    return await saveUser(user);
};

export const signupUserService = async (email: string, password: string) => {
    const user = await registerUserService(email, password);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await storeAccessToken(user.id, accessToken);

    return { user, accessToken, refreshToken };
};


export const loginUserService = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid password');

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    
await storeAccessToken(user.id, accessToken);



    return { accessToken, refreshToken, user };
};


export const refreshTokenService = (refreshToken: string) => {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
    return accessToken;
};

export const getUsersService = () => getAllUsers();

export const updateUserService = async (userId: number, data: Partial<User>) => {
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found');

    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    Object.assign(user, data);

    return saveUser(user);
};

export const deleteUserService = async (userId: number) => {
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found');

    return deleteUserRepo(user);
};

export const logoutUserService = async (userId: number, accessToken: string) => {
    await blacklistToken(accessToken);
    return true;
};


export const getUserByIdService = async (userId: number) => {
    const user = await findUserById(userId);
    if (!user) throw new Error('User not found');
    return { id: user.id, email: user.email, isAdmin: user.isAdmin };
}

export const getUserByName = async () => orderByName();