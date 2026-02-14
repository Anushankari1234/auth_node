import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.getRepository(User).clear();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe('User Routes Integration', () => {
  let accessToken: string;
  let userId: number;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    age: 25
  };

  

  it('should signup and return tokens', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();

    accessToken = res.body.accessToken;
  });

  it('should login existing user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    accessToken = res.body.accessToken;
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    userId = res.body[0].id;
  });

  it('should get user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('should update user', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ age: 30 });

    expect(res.status).toBe(200);
    expect(res.body.age).toBe(30);
  });

  it('should delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('should logout user', async () => {
    const res = await request(app)
      .post('/api/users/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });
});
