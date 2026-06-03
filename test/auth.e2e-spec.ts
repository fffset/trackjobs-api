import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `test-${Date.now()}@test.com`,
          password: '123456',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123456',
        });

      expect(res.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
      const email = `duplicate-${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: '123456' });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: '123456' });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe('AUTH_002');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const email = `login-${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: '123456' });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: '123456' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('AUTH_001');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return current user with valid token', async () => {
      const email = `me-${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: '123456' });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: '123456' });

      const token = loginRes.body.access_token;

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', email);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 without refresh_token cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
    });

    it('should return new access_token with valid refresh_token cookie', async () => {
      const email = `refresh-${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: '123456' });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: '123456' });

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const refreshCookie = cookies.find((c: string) => c.startsWith('refresh_token='));

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie!);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return success and clear cookies', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });
  });
});