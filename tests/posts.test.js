const request = require('supertest');
const app = require('../src/app');
const { User, Post, Category, Tag, Like, Bookmark, Comment, sequelize } = require('../src/models');

describe('Posts Endpoints', () => {
  let authorToken, readerToken;
  let authorUser, post;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'postauthor',
        email: 'author@test.com',
        password: 'Author1234',
        full_name: 'Post Author',
      });
    authorToken = authorRes.body.data.accessToken;
    authorUser = authorRes.body.data.user;

    await User.update({ role: 'author' }, { where: { id: authorUser.id } });

    const readerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'postreader',
        email: 'reader@test.com',
        password: 'Reader1234',
        full_name: 'Post Reader',
      });
    readerToken = readerRes.body.data.accessToken;

    const category = await Category.create({
      name: 'Technology',
      slug: 'technology',
      color: '#6366F1',
    });

    post = await Post.create({
      title: 'Test Post Title',
      slug: 'test-post-title',
      content: 'This is test content for the post with enough words to be valid for the test to pass correctly',
      excerpt: 'Test excerpt',
      author_id: authorUser.id,
      category_id: category.id,
      status: 'published',
      published_at: new Date(),
    });
  });

  describe('GET /api/v1/posts', () => {
    it('should return paginated posts', async () => {
      const res = await request(app).get('/api/v1/posts');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.posts).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/v1/posts?category=technology');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });

    it('should search posts', async () => {
      const res = await request(app).get('/api/v1/posts?search=Test');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });
  });

  describe('GET /api/v1/posts/:slug', () => {
    it('should return a single post', async () => {
      const res = await request(app).get(`/api/v1/posts/${post.slug}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.post.title).toBe('Test Post Title');
    });

    it('should increment view count', async () => {
      const before = await Post.findByPk(post.id);
      const beforeViews = before.view_count;

      await request(app).get(`/api/v1/posts/${post.slug}`);

      const after = await Post.findByPk(post.id);
      expect(after.view_count).toBe(beforeViews + 1);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/v1/posts/non-existent-post');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/posts', () => {
    it('should create a post with auth', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'New Test Post',
          content: 'This is new test content with enough characters to pass validation',
          status: 'published',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail without auth', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .send({
          title: 'New Test Post',
          content: 'Content',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/posts/:id', () => {
    it('should update own post', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.post.title).toBe('Updated Title');
    });

    it('should fail on others post', async () => {
      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('should delete own post', async () => {
      const deletePost = await Post.create({
        title: 'Post to Delete',
        slug: 'post-to-delete',
        content: 'This post will be deleted with enough content',
        author_id: authorUser.id,
        status: 'published',
      });

      const res = await request(app)
        .delete(`/api/v1/posts/${deletePost.id}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/posts/:id/like', () => {
    it('should like a post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(201);
    });

    it('should fail with duplicate like', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/v1/posts/:id/bookmark', () => {
    it('should bookmark a post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/bookmark`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(201);
    });
  });
});
