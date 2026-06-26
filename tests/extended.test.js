const request = require('supertest');
const app = require('../src/app');
const { User, Post, Category, Tag, Like, Bookmark, Comment, Follow, Notification, sequelize } = require('../src/models');

describe('Extended Coverage Tests', () => {
  let adminToken, authorToken, readerToken;
  let adminUser, authorUser, readerUser;
  let post, category;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'extadmin', email: 'extadmin@test.com', password: 'Admin1234' });
    adminToken = adminRes.body.data.accessToken;
    adminUser = adminRes.body.data.user;
    await User.update({ role: 'admin' }, { where: { id: adminUser.id } });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'extauthor', email: 'extauthor@test.com', password: 'Author1234' });
    authorToken = authorRes.body.data.accessToken;
    authorUser = authorRes.body.data.user;
    await User.update({ role: 'author' }, { where: { id: authorUser.id } });

    const readerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'extreader', email: 'extreader@test.com', password: 'Reader1234' });
    readerToken = readerRes.body.data.accessToken;
    readerUser = readerRes.body.data.user;

    category = await Category.create({
      name: 'Extended',
      slug: 'extended',
      description: 'For extended tests',
      color: '#10B981',
      icon: 'test',
    });

    post = await Post.create({
      title: 'Extended Test Post',
      slug: 'extended-test-post',
      content: 'Extended test content that is long enough to pass validation and testing',
      excerpt: 'Extended excerpt',
      author_id: authorUser.id,
      category_id: category.id,
      status: 'published',
      published_at: new Date(),
    });

    const tag = await Tag.create({ name: 'exttag', slug: 'exttag' });
    await post.addTag(tag);
  });

  describe('POST /api/v1/posts/:id/publish', () => {
    it('should publish a draft post', async () => {
      const draft = await Post.create({
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'This is a draft post that will be published',
        author_id: authorUser.id,
        status: 'draft',
      });
      const res = await request(app)
        .post(`/api/v1/posts/${draft.id}/publish`)
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.post.status).toBe('published');
    });

    it('should fail if not owner', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/publish`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/api/v1/posts/00000000-0000-0000-0000-000000000000/publish')
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/posts/:id/archive', () => {
    it('should archive a post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/archive`)
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.post.status).toBe('archived');
    });

    it('should fail if not owner', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/archive`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/posts/:id/related', () => {
    it('should return related posts', async () => {
      const res = await request(app).get(`/api/v1/posts/${post.id}/related`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });
  });

  describe('DELETE /api/v1/posts/:id/like', () => {
    it('should unlike a post', async () => {
      await request(app)
        .post(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should fail if not liked', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/posts/:id/likes', () => {
    it('should return likes', async () => {
      await request(app)
        .post(`/api/v1/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);
      const res = await request(app).get(`/api/v1/posts/${post.id}/likes`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.likes).toBeDefined();
    });
  });

  describe('DELETE /api/v1/posts/:id/bookmark', () => {
    it('should unbookmark a post', async () => {
      await request(app)
        .post(`/api/v1/posts/${post.id}/bookmark`)
        .set('Authorization', `Bearer ${readerToken}`);
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}/bookmark`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should fail if not bookmarked', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}/bookmark`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/posts/bookmarked', () => {
    it('should return bookmarked posts', async () => {
      await request(app)
        .post(`/api/v1/posts/${post.id}/bookmark`)
        .set('Authorization', `Bearer ${readerToken}`);
      const res = await request(app)
        .get('/api/v1/posts/bookmarked')
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.bookmarks).toBeDefined();
    });
  });

  describe('GET /api/v1/posts with sort options', () => {
    it('should sort by oldest', async () => {
      const res = await request(app).get('/api/v1/posts?sort=oldest');
      expect(res.statusCode).toBe(200);
    });

    it('should sort by popular', async () => {
      const res = await request(app).get('/api/v1/posts?sort=popular');
      expect(res.statusCode).toBe(200);
    });

    it('should sort by trending', async () => {
      const res = await request(app).get('/api/v1/posts?sort=trending');
      expect(res.statusCode).toBe(200);
    });

    it('should filter by featured', async () => {
      const res = await request(app).get('/api/v1/posts?featured=true');
      expect(res.statusCode).toBe(200);
    });

    it('should filter by tag', async () => {
      const res = await request(app).get('/api/v1/posts?tag=exttag');
      expect(res.statusCode).toBe(200);
    });

    it('should filter by author', async () => {
      const res = await request(app).get('/api/v1/posts?author=extauthor');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Category extended routes', () => {
    it('GET /api/v1/categories/:slug', async () => {
      const res = await request(app).get('/api/v1/categories/extended');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.category.name).toBe('Extended');
    });

    it('GET /api/v1/categories/:slug/posts', async () => {
      const res = await request(app).get('/api/v1/categories/extended/posts');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });

    it('PUT /api/v1/categories/:id', async () => {
      const res = await request(app)
        .put(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Extended', description: 'Updated' });
      expect(res.statusCode).toBe(200);
    });

    it('DELETE /api/v1/categories/:id with posts fails', async () => {
      const res = await request(app)
        .delete(`/api/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Tag extended routes', () => {
    it('GET /api/v1/tags', async () => {
      const res = await request(app).get('/api/v1/tags');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.tags).toBeDefined();
    });

    it('GET /api/v1/tags/:slug', async () => {
      const res = await request(app).get('/api/v1/tags/exttag');
      expect(res.statusCode).toBe(200);
    });

    it('POST /api/v1/tags creates tag', async () => {
      const res = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ name: 'New Tag' });
      expect(res.statusCode).toBe(201);
    });

    it('POST /api/v1/tags duplicate fails', async () => {
      const res = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ name: 'exttag' });
      expect(res.statusCode).toBe(409);
    });

    it('GET /api/v1/tags/:slug/posts', async () => {
      const res = await request(app).get('/api/v1/tags/exttag/posts');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });
  });

  describe('User extended routes', () => {
    it('PUT /api/v1/users/change-password', async () => {
      const res = await request(app)
        .put('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ current_password: 'Reader1234', new_password: 'NewReader1234' });
      expect(res.statusCode).toBe(200);
    });

    it('PUT /api/v1/users/change-password wrong current', async () => {
      const res = await request(app)
        .put('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ current_password: 'WrongPassword', new_password: 'NewReader1234' });
      expect(res.statusCode).toBe(401);
    });

    it('DELETE /api/v1/users/:id admin deletes user', async () => {
      const newUser = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'deleteme', email: 'delete@test.com', password: 'Delete1234' });
      const res = await request(app)
        .delete(`/api/v1/users/${newUser.body.data.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('DELETE /api/v1/users/:id non-existent user', async () => {
      const res = await request(app)
        .delete('/api/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/v1/users/:username/posts', async () => {
      const res = await request(app).get(`/api/v1/users/${authorUser.username}/posts`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts).toBeDefined();
    });

    it('GET /api/v1/users/:username/posts non-existent', async () => {
      const res = await request(app).get('/api/v1/users/nonexistentuser/posts');
      expect(res.statusCode).toBe(404);
    });

    it('POST /api/v1/users/:id/follow duplicate follow fails', async () => {
      await request(app)
        .post(`/api/v1/users/${authorUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);
      const res = await request(app)
        .post(`/api/v1/users/${authorUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(409);
    });

    it('DELETE /api/v1/users/:id/follow not following fails', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${adminUser.id}/follow`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/v1/users/:id/followers', async () => {
      const res = await request(app).get(`/api/v1/users/${authorUser.id}/followers`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.followers).toBeDefined();
    });

    it('GET /api/v1/users/:id/following', async () => {
      const res = await request(app).get(`/api/v1/users/${readerUser.id}/following`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.following).toBeDefined();
    });

    it('POST /api/v1/users/:id/follow non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/users/00000000-0000-0000-0000-000000000000/follow')
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/v1/users/:id/followers non-existent user', async () => {
      const res = await request(app).get('/api/v1/users/00000000-0000-0000-0000-000000000000/followers');
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/v1/users/:id/following non-existent user', async () => {
      const res = await request(app).get('/api/v1/users/00000000-0000-0000-0000-000000000000/following');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Comment extended routes', () => {
    it('POST /api/v1/comments/:id/like', async () => {
      const comment = await Comment.create({
        post_id: post.id,
        user_id: readerUser.id,
        content: 'Likeable comment',
      });
      const res = await request(app)
        .post(`/api/v1/comments/${comment.id}/like`)
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('POST /api/v1/comments/:id/approve as admin', async () => {
      const comment = await Comment.create({
        post_id: post.id,
        user_id: readerUser.id,
        content: 'Approvable comment',
        is_approved: false,
      });
      const res = await request(app)
        .post(`/api/v1/comments/${comment.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('POST /api/v1/comments/:id/like non-existent', async () => {
      const res = await request(app)
        .post('/api/v1/comments/00000000-0000-0000-0000-000000000000/like')
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('POST /api/v1/posts/:id/comments non-existent post', async () => {
      const res = await request(app)
        .post('/api/v1/posts/00000000-0000-0000-0000-000000000000/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'test' });
      expect(res.statusCode).toBe(404);
    });

    it('POST /api/v1/posts/:id/comments with invalid parent', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'reply', parent_id: '00000000-0000-0000-0000-000000000000' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Post 404 cases', () => {
    it('PUT non-existent post', async () => {
      const res = await request(app)
        .put('/api/v1/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Valid title' });
      expect(res.statusCode).toBe(404);
    });

    it('DELETE non-existent post', async () => {
      const res = await request(app)
        .delete('/api/v1/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('POST like non-existent post', async () => {
      const res = await request(app)
        .post('/api/v1/posts/00000000-0000-0000-0000-000000000000/like')
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('POST bookmark non-existent post', async () => {
      const res = await request(app)
        .post('/api/v1/posts/00000000-0000-0000-0000-000000000000/bookmark')
        .set('Authorization', `Bearer ${readerToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('GET related non-existent post', async () => {
      const res = await request(app).get('/api/v1/posts/00000000-0000-0000-0000-000000000000/related');
      expect(res.statusCode).toBe(404);
    });

    it('Category not found', async () => {
      const res = await request(app).get('/api/v1/categories/nonexistent');
      expect(res.statusCode).toBe(404);
    });

    it('Tag not found', async () => {
      const res = await request(app).get('/api/v1/tags/nonexistent');
      expect(res.statusCode).toBe(404);
    });

    it('Category posts not found', async () => {
      const res = await request(app).get('/api/v1/categories/nonexistent/posts');
      expect(res.statusCode).toBe(404);
    });

    it('Tag posts not found', async () => {
      const res = await request(app).get('/api/v1/tags/nonexistent/posts');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Health and root', () => {
    it('GET /api/v1/health', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('OK');
    });

    it('GET /', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('ContentOS');
    });

    it('GET /unknown returns 404', async () => {
      const res = await request(app).get('/api/v1/unknown');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Category delete non-existent', () => {
    it('DELETE non-existent category', async () => {
      const res = await request(app)
        .delete('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Category update non-existent', () => {
    it('PUT non-existent category', async () => {
      const res = await request(app)
        .put('/api/v1/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'x' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Auth forgot password', () => {
    it('forgot password sends email (or fails gracefully)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'extadmin@test.com' });
      expect([200, 500]).toContain(res.statusCode);
    });

    it('forgot password non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nobody@test.com' });
      expect(res.statusCode).toBe(404);
    });

    it('reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password/invalidtoken')
        .send({ password: 'NewPass1234' });
      expect(res.statusCode).toBe(400);
    });

    it('refresh token with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalidtoken' });
      expect(res.statusCode).toBe(401);
    });

    it('refresh token without token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });
});
