const request = require('supertest');
const app = require('../src/app');
const { User, sequelize } = require('../src/models');

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test1234',
    full_name: 'Test User',
  };

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'new@test.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'Test1234' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      token = res.body.data.accessToken;
    });

    it('should return current user with token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      refreshToken = res.body.data.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      token = res.body.data.accessToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
