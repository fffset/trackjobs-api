import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';

describe('Applications (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let otherToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    const email = `app-${Date.now()}@test.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: '123456' });
    token = registerRes.body.access_token;

    const otherEmail = `other-${Date.now()}@test.com`;
    const otherRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: otherEmail, password: '123456' });
    otherToken = otherRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/applications', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/applications');
      expect(res.status).toBe(401);
    });

    it('should return an array with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/applications', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .send({ company: 'Google', position: 'Engineer' });

      expect(res.status).toBe(401);
    });

    it('should return 400 if company is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ position: 'Engineer' });

      expect(res.status).toBe(400);
    });

    it('should create and return application', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Google', position: 'Backend Engineer' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.company).toBe('Google');
    });
  });

  describe('GET /api/v1/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Meta', position: 'SWE' });
      applicationId = res.body.id;
    });

    it('should return 404 for another user\'s application', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });

    it('should return the application for its owner', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(applicationId);
    });
  });

  describe('PATCH /api/v1/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Apple', position: 'iOS Dev' });
      applicationId = res.body.id;
    });

    it('should update and return the application', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'interview' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('interview');
    });
  });

  describe('DELETE /api/v1/applications/:id', () => {
    let applicationId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Amazon', position: 'DevOps' });
      applicationId = res.body.id;
    });

    it('should delete the application', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
