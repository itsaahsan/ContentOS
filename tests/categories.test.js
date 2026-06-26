const request = require('supertest');
const app = require('../src/app');
const { User, Category, sequelize } = require('../src/models');

describe('Categories Endpoints', () => {
  let adminToken, authorToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'catadmin',
        email: 'catadmin@test.com',
        password: 'Admin1234',
      });
    adminToken = adminRes.body.data.accessToken;
    await User.update({ role: 'admin' }, { where: { id: adminRes.body.data.user.id } });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'catauthor',
        email: 'catauthor@test.com',
        password: 'Author1234',
      });
    authorToken = authorRes.body.data.accessToken;
    await User.update({ role: 'author' }, { where: { id: authorRes.body.data.user.id } });
  });

  describe('GET /api/v1/categories', () => {
    it('should return all categories', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.categories).toBeDefined();
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create category as admin', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Technology',
          description: 'Tech posts',
          color: '#6366F1',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.category.name).toBe('Technology');
    });

    it('should forbid non-admin users', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete category as admin', async () => {
      const category = await Category.create({ name: 'ToDelete', slug: 'to-delete' });
      const res = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
