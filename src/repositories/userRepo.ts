import { AppDataSource } from '../data-source';
import { User } from '../models/User';

export const userRepo = AppDataSource.getRepository(User);

export const findUserByEmail = (email: string) => userRepo.findOneBy({ email });
export const findUserById = (id: number) => userRepo.findOneBy({ id });
export const createUser = (user: Partial<User>) => userRepo.create(user);
export const saveUser = (user: User) => userRepo.save(user);
export const deleteUserRepo = (user: User) => userRepo.remove(user);
export const getAllUsers = () => userRepo.find({ select: ['id', 'email', 'isAdmin', 'createdAt'] });
