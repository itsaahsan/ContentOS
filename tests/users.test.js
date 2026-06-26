const request = require('supertest');
const app = require('../src/app');
const { User, Follow, sequelize } = require('../src/models');

describe('Users Endpoints', () => {
  let adminToken, authorToken, readerToken;
  let adminUser, authorUser, readerUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'admintest',
        email: 'admin@test.com',
        password: 'Admin1234',
        full_name: 'Admin User',
      });
    adminToken = adminRes.body.data.accessToken;
    adminUser = adminRes.body.data.user;
    await User.update({ role: 'admin' }, { where: { id: adminUser.id } });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'authortest',
        email: 'author@test.com',
        password: 'Author1234',
        full_name: 'Author User',
      });
    authorToken = authorRes.body.data.accessToken;
    authorUser = authorRes.body.data.user;
    await User.update({ role: 'author' }, { where: { id: authorUser.id } });

    const readerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'readertest',
        email: 'reader@test.com',
        password: 'Reader1234',
        full_name: 'Reader User',
      });
    readerToken = readerRes.body.data.accessToken;
    readerUser = readerRes.body.data.user;
  });

  describe('GET /api/v1/users', () => {
    it('should return all users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toBeDefined();
    });

    it('should forbid non-admin users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/users/:username', () => {
    it('should return public profile', async () => {
      const res = await request(app).get(`/api/v1/users/${authorUser.username}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.username).toBe(authorUser.username);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/v1/users/nonexistent');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update profile', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ full_name: 'Updated Author', bio: 'New bio' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.full_name).toBe('Updated Author');
    });
  });

  describe('POST /api/v1/users/:id/follow', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${authorUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(201);
    });

    it('should fail to follow self', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${readerUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id/follow', () => {
    it('should unfollow a user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${authorUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
