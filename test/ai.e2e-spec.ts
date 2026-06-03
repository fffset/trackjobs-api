import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';

const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

describe('Ai (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();

    const email = `ai-${Date.now()}@test.com`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: '123456' });
    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/ai/analyze-cv', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ai/analyze-cv')
        .send({ cv: 'some cv text here', jobDescription: 'some job description here' });

      expect(res.status).toBe(401);
    });

    it('should return 400 if cv is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ai/analyze-cv')
        .set('Authorization', `Bearer ${token}`)
        .send({ cv: 'short', jobDescription: 'some job description here' });

      expect(res.status).toBe(400);
    });

    it('should return analysis with valid input', async () => {
      if (!hasApiKey) return;


      const res = await request(app.getHttpServer())
        .post('/api/v1/ai/analyze-cv')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cv: 'Experienced backend developer with 5 years of Node.js and TypeScript experience.',
          jobDescription: 'We are looking for a backend engineer with Node.js experience.',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('strengths');
      expect(res.body).toHaveProperty('weaknesses');
      expect(res.body).toHaveProperty('recommendations');
    }, 30_000);
  });

  describe('POST /api/v1/ai/cover-letter', () => {
    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ai/cover-letter')
        .send({ cv: 'some cv text here', jobDescription: 'some job description here' });

      expect(res.status).toBe(401);
    });

    it('should stream a cover letter with valid input', async () => {
      if (!hasApiKey) return;

      const res = await request(app.getHttpServer())
        .post('/api/v1/ai/cover-letter')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cv: 'Experienced backend developer with 5 years of Node.js and TypeScript experience.',
          jobDescription: 'We are looking for a backend engineer with Node.js experience.',
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch('text/event-stream');
      expect(res.text).toContain('[DONE]');
    }, 30_000);
  });
});
