const request = require('supertest');
const app = require('../src/app');
const { User, Post, Comment, sequelize } = require('../src/models');

describe('Comments Endpoints', () => {
  let authorToken, readerToken;
  let post, authorUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const authorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'commentauthor',
        email: 'commentauthor@test.com',
        password: 'Author1234',
      });
    authorToken = authorRes.body.data.accessToken;
    authorUser = authorRes.body.data.user;

    const readerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'commentreader',
        email: 'commentreader@test.com',
        password: 'Reader1234',
      });
    readerToken = readerRes.body.data.accessToken;

    post = await Post.create({
      title: 'Post for Comments',
      slug: 'post-for-comments',
      content: 'This post is for testing comments with enough content',
      author_id: authorUser.id,
      status: 'published',
    });
  });

  describe('GET /api/v1/posts/:id/comments', () => {
    it('should return comments for a post', async () => {
      const res = await request(app).get(`/api/v1/posts/${post.id}/comments`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.comments).toBeDefined();
    });
  });

  describe('POST /api/v1/posts/:id/comments', () => {
    it('should create a comment with auth', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Great post!' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.comment.content).toBe('Great post!');
    });

    it('should need auth to comment', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/comments`)
        .send({ content: 'No auth comment' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/comments/:id', () => {
    let comment;

    beforeAll(async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Editable comment' });
      comment = res.body.data.comment;
    });

    it('should update own comment', async () => {
      const res = await request(app)
        .put(`/api/v1/comments/${comment.id}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Updated comment' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.comment.content).toBe('Updated comment');
    });

    it('should fail to update others comment', async () => {
      const res = await request(app)
        .put(`/api/v1/comments/${comment.id}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: 'Hacked comment' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should delete own comment', async () => {
      const createRes = await request(app)
        .post(`/api/v1/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Comment to delete' });
      const deleteComment = createRes.body.data.comment;

      const res = await request(app)
        .delete(`/api/v1/comments/${deleteComment.id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
