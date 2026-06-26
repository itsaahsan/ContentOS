const request = require('supertest');
const app = require('../src/app');
const { User, Post, Tag, Category, sequelize } = require('../src/models');

describe('Search Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'searchadmin', email: 'searchadmin@test.com', password: 'Admin1234' });
    await User.update({ role: 'admin' }, { where: { id: adminRes.body.data.user.id } });

    const cat = await Category.create({ name: 'SearchCategory', slug: 'searchcategory' });
    const author = adminRes.body.data.user;

    await Post.create({
      title: 'Searchable Post Title',
      slug: 'searchable-post',
      content: 'This post contains searchable content for testing',
      excerpt: 'Searchable excerpt',
      author_id: author.id,
      category_id: cat.id,
      status: 'published',
      published_at: new Date(),
    });

    await Tag.create({ name: 'searchtag', slug: 'searchtag' });
  });

  describe('GET /api/v1/search', () => {
    it('should require query parameter', async () => {
      const res = await request(app).get('/api/v1/search');
      expect(res.statusCode).toBe(400);
    });

    it('should search posts by default', async () => {
      const res = await request(app).get('/api/v1/search?q=Searchable');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.posts).toBeDefined();
    });

    it('should search only posts when type=posts', async () => {
      const res = await request(app).get('/api/v1/search?q=Searchable&type=posts');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });

    it('should search users when type=users', async () => {
      const res = await request(app).get('/api/v1/search?q=searchadmin&type=users');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toBeDefined();
    });

    it('should search tags when type=tags', async () => {
      const res = await request(app).get('/api/v1/search?q=searchtag&type=tags');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.tags).toBeDefined();
    });
  });
});
