const request = require('supertest');
const app = require('../src/app');
const { User, Post, Category, Comment, Notification, sequelize } = require('../src/models');

describe('Stats and Notifications', () => {
  let adminToken, authorToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'statsadmin', email: 'statsadmin@test.com', password: 'Admin1234' });
    adminToken = adminRes.body.data.accessToken;
    await User.update({ role: 'admin' }, { where: { id: adminRes.body.data.user.id } });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'statsauthor', email: 'statsauthor@test.com', password: 'Author1234' });
    authorToken = authorRes.body.data.accessToken;

    const cat = await Category.create({ name: 'Stats', slug: 'stats' });
    const post = await Post.create({
      title: 'Stats Test Post',
      slug: 'stats-test-post',
      content: 'Stats test content for checking dashboard numbers',
      author_id: adminRes.body.data.user.id,
      category_id: cat.id,
      status: 'published',
      published_at: new Date(),
      view_count: 42,
    });

    await Comment.create({
      post_id: post.id,
      user_id: adminRes.body.data.user.id,
      content: 'A test comment',
    });

    await Notification.create({
      user_id: adminRes.body.data.user.id,
      type: 'follow',
      title: 'New Follower',
      message: 'Someone followed you',
    });
  });

  describe('GET /api/v1/stats/overview', () => {
    it('should return stats for admin', async () => {
      const res = await request(app)
        .get('/api/v1/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.overview).toBeDefined();
      expect(res.body.data.overview.total_users).toBeGreaterThan(0);
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .get('/api/v1/stats/overview')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/stats/posts', () => {
    it('should return posts stats for admin', async () => {
      const res = await request(app)
        .get('/api/v1/stats/posts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.posts_per_month).toBeDefined();
    });
  });

  describe('GET /api/v1/stats/popular', () => {
    it('should return popular posts for admin', async () => {
      const res = await request(app)
        .get('/api/v1/stats/popular')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.popular_posts).toBeDefined();
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return user notifications', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.notifications).toBeDefined();
      expect(res.body.data.unread_count).toBeGreaterThanOrEqual(1);
    });

    it('should mark notification as read', async () => {
      const list = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`);
      const notifId = list.body.data.notifications[0].id;

      const res = await request(app)
        .put(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should mark all as read', async () => {
      const res = await request(app)
        .put('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should delete notification', async () => {
      const list = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      if (list.body.data.notifications.length > 0) {
        const notifId = list.body.data.notifications[0].id;
        const res = await request(app)
          .delete(`/api/v1/notifications/${notifId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
      }
    });
  });
});
