import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  registerUserService,
  signupUserService,
  loginUserService,
  refreshTokenService,
  getUsersService,
  updateUserService,
  deleteUserService,
  getUserByIdService
} from '../services/userService';

import * as userRepo from '../repositories/userRepo'
import * as jwtUtils from '../shared/utils/jwt'

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

jest.mock('../repositories/userRepo');
jest.mock('../shared/utils/jwt');

const mockUser = {
  id: 1,
  email: 'test@test.com',
  password: 'nhhbs',
  isAdmin: false
};

it('should hash password and save user', async () => {
  (userRepo.findUserByEmail as jest.MockedFunction<
    typeof userRepo.findUserByEmail
  >).mockResolvedValue(null);

  (bcrypt.hash as jest.Mock)
    .mockResolvedValue('hashed');

  (userRepo.createUser as jest.MockedFunction<
    typeof userRepo.createUser
  >).mockReturnValue(mockUser as any);

  (userRepo.saveUser as jest.MockedFunction<
    typeof userRepo.saveUser
  >).mockResolvedValue(mockUser as any);

  const result = await registerUserService('test@test.com', '123456');

  expect(result).toEqual(mockUser);
});


describe('signupUserService', () => {
  it('should return user with tokens', async () => {
    jest.spyOn(userRepo, 'findUserByEmail').mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jest.spyOn(userRepo, 'createUser').mockReturnValue(mockUser as any);
    jest.spyOn(userRepo, 'saveUser').mockResolvedValue(mockUser as any);

    (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access');
    (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh');

    const result = await signupUserService('test@test.com', '123456');

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(result.user).toEqual(mockUser);
  });
});

describe('loginUserService', () => {
  it('should throw if user not found', async () => {
    (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      loginUserService('test@test.com', '123')
    ).rejects.toThrow('User not found');
  });

  it('should throw if password invalid', async () => {
    (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      loginUserService('test@test.com', 'wrong')
    ).rejects.toThrow('Invalid password');
  });

  it('should return tokens for valid login', async () => {
    (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access');
    (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh');

    const result = await loginUserService('test@test.com', '123');

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
  });
});

describe('refreshTokenService', () => {
  it('should return new access token', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 1 });
    (jwt.sign as jest.Mock).mockReturnValue('new-access');

    const token = refreshTokenService('refresh-token');

    expect(token).toBe('new-access');
  });
});

describe('getUsersService', () => {
  it('should return all users', async () => {
    (userRepo.getAllUsers as jest.Mock).mockResolvedValue([mockUser]);

    const users = await getUsersService();

    expect(users).toHaveLength(1);
  });
});

describe('updateUserService', () => {
  it('should throw if user not found', async () => {
    (userRepo.findUserById as jest.Mock).mockResolvedValue(null);

    await expect(
      updateUserService(1, { email: 'x@test.com' })
    ).rejects.toThrow('User not found');
  });

  it('should hash password if updated', async () => {
    (userRepo.findUserById as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    (userRepo.saveUser as jest.Mock).mockResolvedValue(mockUser);

    await updateUserService(1, { password: 'newpass' });

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(userRepo.saveUser).toHaveBeenCalled();
  });
});

describe('deleteUserService', () => {
  it('should delete user', async () => {
    (userRepo.findUserById as jest.Mock).mockResolvedValue(mockUser);
    (userRepo.deleteUserRepo as jest.Mock).mockResolvedValue(true);

    const result = await deleteUserService(1);

    expect(result).toBe(true);
  });
});

describe('getUserByIdService', () => {
  it('should return safe user data', async () => {
    (userRepo.findUserById as jest.Mock).mockResolvedValue(mockUser);

    const user = await getUserByIdService(1);

    expect(user).toEqual({
      id: 1,
      email: 'test@test.com',
      isAdmin: false
    });
  });
});
