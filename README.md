# ContentOS

A production-ready Blog REST API built with Node.js, Express, and PostgreSQL.

[![CI/CD](https://github.com/itsaahsan/ContentOS/actions/workflows/ci.yml/badge.svg)](https://github.com/itsaahsan/ContentOS/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-80%2B-brightgreen)](https://github.com/itsaahsan/ContentOS)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Live Demo

- **API**: https://contentos.onrender.com
- **Swagger Docs**: https://contentos.onrender.com/api/docs
- **Health Check**: https://contentos.onrender.com/api/v1/health

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Sequelize
- **Auth**: JWT (Access + Refresh tokens)
- **Docs**: Swagger UI
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting, HPP, XSS-Clean
- **Logging**: Morgan + Winston
- **File Upload**: Multer + Cloudinary

## Features

- JWT Authentication with token refresh
- Role-based access control (Admin, Author, Reader)
- Full CRUD for Posts, Categories, Tags, Comments
- Nested comments with replies
- Like and Bookmark system
- User follow/unfollow
- Search across posts, users, and tags
- Admin dashboard stats
- Notifications system
- Image upload to Cloudinary
- Comprehensive Swagger API documentation
- Rate limiting and security headers
- Pagination, filtering, sorting, and search
- 80%+ test coverage

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or Neon)

### Installation

```bash
git clone https://github.com/itsaahsan/ContentOS.git
cd ContentOS
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT access token secret (min 32 chars) | `your_secret_key` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `your_refresh_secret` |
| `JWT_EXPIRE` | Access token expiry (seconds) | `1800` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry (seconds) | `604800` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `xxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `xxx` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `xxx` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `your@gmail.com` |
| `EMAIL_PASS` | SMTP password | `your_app_password` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Database Setup

```bash
npm run migrate
npm run seed
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### API Documentation

Visit `http://localhost:5000/api/docs` for interactive Swagger documentation.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/logout` | Logout | Yes |
| POST | `/api/v1/auth/refresh-token` | Refresh token | No |
| POST | `/api/v1/auth/forgot-password` | Forgot password | No |
| POST | `/api/v1/auth/reset-password/:token` | Reset password | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | List users (Admin) | Admin |
| GET | `/api/v1/users/:username` | Public profile | No |
| PUT | `/api/v1/users/profile` | Update profile | Yes |
| PUT | `/api/v1/users/avatar` | Upload avatar | Yes |
| PUT | `/api/v1/users/change-password` | Change password | Yes |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |
| POST | `/api/v1/users/:id/follow` | Follow user | Yes |
| DELETE | `/api/v1/users/:id/follow` | Unfollow user | Yes |

### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/posts` | List posts | No |
| GET | `/api/v1/posts/:slug` | Get post by slug | No |
| POST | `/api/v1/posts` | Create post | Author |
| PUT | `/api/v1/posts/:id` | Update post | Owner |
| DELETE | `/api/v1/posts/:id` | Delete post | Owner |
| POST | `/api/v1/posts/:id/like` | Like post | Yes |
| POST | `/api/v1/posts/:id/bookmark` | Bookmark post | Yes |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/categories` | List categories | No |
| POST | `/api/v1/categories` | Create category | Admin |
| PUT | `/api/v1/categories/:id` | Update category | Admin |
| DELETE | `/api/v1/categories/:id` | Delete category | Admin |

### Tags
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/tags` | List tags | No |
| POST | `/api/v1/tags` | Create tag | Author |
| GET | `/api/v1/tags/:slug/posts` | Posts by tag | No |

### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/posts/:id/comments` | Get comments | No |
| POST | `/api/v1/posts/:id/comments` | Create comment | Yes |
| PUT | `/api/v1/comments/:id` | Update comment | Owner |
| DELETE | `/api/v1/comments/:id` | Delete comment | Owner |

### Other
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/search?q=keyword` | Search | No |
| GET | `/api/v1/stats/overview` | Dashboard stats | Admin |
| GET | `/api/v1/notifications` | Notifications | Yes |
| POST | `/api/v1/upload/image` | Upload image | Yes |
| GET | `/api/v1/health` | Health check | No |

## Deployment

### Render

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env`

### Neon Database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

## Seed Data

```bash
npm run seed
```

Creates:
- 1 Admin user
- 3 Author users
- 5 Reader users
- 5 Categories
- 10 Tags
- 15 Published posts
- 3 Draft posts
- 20 Comments
- 30 Likes
- 10 Bookmarks

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@contentos.dev | Admin1234 |
| Author | author@contentos.dev | Author1234 |
| Reader | reader@contentos.dev | Reader1234 |

## Project Structure

```
contentos/
├── src/
│   ├── config/          # Database, Cloudinary, Email, Swagger
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, RBAC, Validation, Rate limiting
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes with Swagger docs
│   ├── utils/           # Helpers, error handling, logging
│   └── validators/      # Request validation rules
├── tests/               # Jest + Supertest tests
├── seeders/             # Database seed script
├── migrations/          # Sequelize migrations
└── server.js            # Entry point
```

## License

MIT

## Author

**Ahsan** - [GitHub](https://github.com/itsaahsan)
