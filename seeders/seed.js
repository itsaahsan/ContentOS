const { User, Post, Category, Tag, Comment, Like, Bookmark, Follow, sequelize } = require('../src/models');
const generateSlug = require('../src/utils/slugify');
require('dotenv').config();

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: true });
    console.log('Tables created');

    const admin = await User.create({
      username: 'admin',
      email: 'admin@contentos.dev',
      password: 'Admin1234',
      full_name: 'Admin User',
      bio: 'ContentOS administrator',
      role: 'admin',
      is_active: true,
      is_verified: true,
    });

    const authors = await User.bulkCreate([
      {
        username: 'sarah_dev',
        email: 'author@contentos.dev',
        password: 'Author1234',
        full_name: 'Sarah Johnson',
        bio: 'Full-stack developer passionate about Node.js and React',
        role: 'author',
        is_active: true,
        is_verified: true,
      },
      {
        username: 'mike_codes',
        email: 'mike@contentos.dev',
        password: 'Author1234',
        full_name: 'Mike Chen',
        bio: 'Backend engineer specializing in PostgreSQL and APIs',
        role: 'author',
        is_active: true,
        is_verified: true,
      },
      {
        username: 'emma_tech',
        email: 'emma@contentos.dev',
        password: 'Author1234',
        full_name: 'Emma Williams',
        bio: 'DevOps enthusiast and cloud architect',
        role: 'author',
        is_active: true,
        is_verified: true,
      },
    ]);

    const readers = await User.bulkCreate([
      {
        username: 'reader1',
        email: 'reader@contentos.dev',
        password: 'Reader1234',
        full_name: 'Alex Reader',
        role: 'reader',
        is_active: true,
      },
      {
        username: 'reader2',
        email: 'reader2@contentos.dev',
        password: 'Reader1234',
        full_name: 'Jordan Reader',
        role: 'reader',
        is_active: true,
      },
      {
        username: 'reader3',
        email: 'reader3@contentos.dev',
        password: 'Reader1234',
        full_name: 'Taylor Reader',
        role: 'reader',
        is_active: true,
      },
      {
        username: 'reader4',
        email: 'reader4@contentos.dev',
        password: 'Reader1234',
        full_name: 'Casey Reader',
        role: 'reader',
        is_active: true,
      },
      {
        username: 'reader5',
        email: 'reader5@contentos.dev',
        password: 'Reader1234',
        full_name: 'Morgan Reader',
        role: 'reader',
        is_active: true,
      },
    ]);

    console.log('Users seeded');

    const categories = await Category.bulkCreate([
      { name: 'Technology', slug: 'technology', description: 'Latest in tech', color: '#6366F1', icon: 'cpu' },
      { name: 'Programming', slug: 'programming', description: 'Code tutorials and tips', color: '#10B981', icon: 'code' },
      { name: 'Career', slug: 'career', description: 'Career advice and growth', color: '#F59E0B', icon: 'briefcase' },
      { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step guides', color: '#3B82F6', icon: 'book' },
      { name: 'Opinion', slug: 'opinion', description: 'Industry opinions', color: '#EF4444', icon: 'message' },
    ]);

    console.log('Categories seeded');

    const tags = await Tag.bulkCreate([
      { name: 'nodejs', slug: 'nodejs' },
      { name: 'javascript', slug: 'javascript' },
      { name: 'typescript', slug: 'typescript' },
      { name: 'python', slug: 'python' },
      { name: 'react', slug: 'react' },
      { name: 'fastapi', slug: 'fastapi' },
      { name: 'postgresql', slug: 'postgresql' },
      { name: 'docker', slug: 'docker' },
      { name: 'career', slug: 'career' },
      { name: 'beginners', slug: 'beginners' },
    ]);

    console.log('Tags seeded');

    const postsData = [
      { title: 'Building REST APIs with Node.js and Express', content: 'REST APIs are the backbone of modern web applications. In this comprehensive guide, we will explore how to build production-ready APIs using Node.js and Express. We will cover routing, middleware, error handling, and best practices that every backend developer should know. The Express framework provides a minimal and flexible foundation for building web applications and APIs. With its robust routing system and middleware support, you can create complex applications with ease. We will start with the basics and progressively build a complete API with authentication, validation, and database integration. By the end of this tutorial, you will have a solid understanding of API development patterns that you can apply to any project.', category_id: 2, author_idx: 0, featured: true, tag_indices: [0, 1] },
      { title: 'PostgreSQL Performance Optimization Tips', content: 'PostgreSQL is one of the most powerful open-source databases available today. This article covers essential optimization techniques including indexing strategies, query planning, connection pooling, and partitioning. Understanding how PostgreSQL executes queries is crucial for writing performant code. We will explore the EXPLAIN ANALYZE command and how to read query plans effectively. Indexing is perhaps the most important optimization you can make. We will cover B-tree, Hash, GiST, and GIN indexes, explaining when to use each type. Connection pooling with pgBouncer can dramatically improve performance under high load. We will also discuss table partitioning strategies for handling large datasets efficiently.', category_id: 1, author_idx: 1, tag_indices: [6] },
      { title: 'How I Landed My First Software Engineer Job', content: 'Breaking into the tech industry can seem daunting, but with the right strategy, it is absolutely achievable. In this article, I share my personal journey from self-taught developer to landing my first software engineer role. The key was building a portfolio of projects that demonstrated real-world skills. I focused on learning one stack deeply rather than spreading myself thin across multiple technologies. Networking played a huge role. I attended local meetups, participated in open-source projects, and engaged with the developer community on Twitter. The interview process was challenging but preparation made all the difference. I practiced coding problems daily and studied system design concepts. Here are my top tips for anyone starting their job search in tech.', category_id: 3, author_idx: 0, tag_indices: [8, 9] },
      { title: 'Getting Started with TypeScript in 2024', content: 'TypeScript has become the standard for large-scale JavaScript applications. Its static type system catches errors at compile time, improving code quality and developer experience. In this tutorial, we will set up a TypeScript project from scratch and explore its key features including interfaces, generics, utility types, and decorators. TypeScript interfaces allow you to define the shape of objects, making your code self-documenting. Generics enable you to write reusable components that work with multiple types. We will also look at the TypeScript compiler configuration options and how to gradually migrate an existing JavaScript project to TypeScript. By the end, you will understand why TypeScript adoption continues to grow rapidly.', category_id: 4, author_idx: 1, tag_indices: [2, 1] },
      { title: 'Docker for Backend Developers', content: 'Containerization has revolutionized how we deploy and manage applications. Docker provides a consistent environment from development to production. In this guide, we will cover Docker fundamentals, creating Dockerfiles for Node.js applications, Docker Compose for multi-container setups, and best practices for production deployments. Understanding layers in Docker images is crucial for optimizing build times and image sizes. We will explore multi-stage builds and how to minimize your final image. Docker Compose makes it easy to define and run multi-container applications. We will set up a complete development environment with Node.js, PostgreSQL, and Redis. For production, we will discuss health checks, logging strategies, and security considerations.', category_id: 1, author_idx: 2, tag_indices: [7, 0] },
      { title: 'The Future of Web Development', content: 'Web development is evolving at an unprecedented pace. From server-side rendering making a comeback to edge computing changing how we think about deployment, the landscape is shifting dramatically. This article explores emerging trends that will shape the future of web development over the next few years. Server components are changing how we think about rendering. The boundary between server and client is becoming more fluid, allowing developers to choose the best rendering strategy for each component. WebAssembly is opening doors to running high-performance code in the browser. Edge computing is pushing computation closer to users, reducing latency and improving user experience.', category_id: 5, author_idx: 2, tag_indices: [1] },
      { title: 'Building Authentication with JWT', content: 'JSON Web Tokens have become the standard for API authentication. In this comprehensive guide, we will implement a complete authentication system with register, login, refresh tokens, password reset, and email verification. We will use bcrypt for password hashing and set up proper token rotation for security. Understanding the difference between access tokens and refresh tokens is crucial. Access tokens are short-lived and used for API requests, while refresh tokens are longer-lived and used to obtain new access tokens. We will implement proper token rotation, where each refresh token use generates a new refresh token, invalidating the previous one. This prevents token reuse attacks and improves overall security.', category_id: 4, author_idx: 0, tag_indices: [0, 1] },
      { title: 'Python FastAPI for Modern APIs', content: 'FastAPI has quickly become one of the most popular Python frameworks for building APIs. Its automatic documentation generation, type validation, and high performance make it an excellent choice for backend development. In this tutorial, we will build a complete REST API with authentication, database integration, and comprehensive documentation. FastAPI leverages Python type hints for automatic request validation and documentation. The interactive API docs are generated automatically from your code. We will implement CRUD operations, relationship handling, pagination, and filtering. The dependency injection system makes it easy to share resources across endpoints. We will also cover testing strategies and deployment considerations.', category_id: 2, author_idx: 1, tag_indices: [3, 6] },
      { title: 'React State Management in 2024', content: 'State management in React has evolved significantly. From Redux to Context API, Zustand to Jotai, and now React Server Components, the options can be overwhelming. This article compares different state management solutions and helps you choose the right one for your project. For simple applications, React built-in state and Context API might be sufficient. For complex applications with many shared states, libraries like Zustand or Jotai offer excellent developer experience with minimal boilerplate. Redux Toolkit remains a solid choice for large teams that need predictable state management. We will explore real-world scenarios and recommend the best approach for each situation.', category_id: 1, author_idx: 0, tag_indices: [4, 1] },
      { title: 'DevOps Best Practices for Startups', content: 'Implementing DevOps practices early can save startups significant time and money. This article covers CI/CD pipeline setup, infrastructure as code, monitoring, and incident response strategies tailored for small teams. Starting with version control and automated testing is the foundation. From there, set up a CI/CD pipeline that automatically builds, tests, and deploys your code. Infrastructure as Code with tools like Terraform or Pulumi ensures reproducible environments. Monitoring and observability should be implemented from day one. Use tools like Prometheus for metrics, Grafana for visualization, and PagerDuty for alerting. Document your runbooks and practice incident response before you need it.', category_id: 1, author_idx: 2, tag_indices: [7] },
      { title: 'Writing Clean Code: A Practical Guide', content: 'Clean code is not just about aesthetics; it directly impacts maintainability, team productivity, and ultimately, business success. This article provides practical guidelines for writing code that is easy to read, understand, and modify. We will cover naming conventions, function design, class structure, and refactoring techniques. Good naming is perhaps the most important aspect of clean code. A well-named variable or function eliminates the need for comments. Functions should do one thing and do it well. Keep them short and focused. Classes should be small with a single responsibility. We will look at real code examples showing before and after refactoring, demonstrating how small changes can dramatically improve code quality.', category_id: 2, author_idx: 1, tag_indices: [1, 9] },
      { title: 'Database Design Patterns for Scalable Apps', content: 'A well-designed database is crucial for application performance and scalability. This article covers essential database design patterns including normalization, denormalization, indexing strategies, and common anti-patterns. We will use PostgreSQL examples throughout. Normalization reduces data redundancy but can impact query performance. Denormalization trades storage for read performance. Understanding when to use each approach is key. We will cover the most common normalization forms and when to break the rules. Indexing strategy can make or break database performance. We will discuss when to create indexes, the impact of composite indexes, and how to identify missing indexes using query plans.', category_id: 4, author_idx: 1, tag_indices: [6] },
      { title: 'Self-Care for Software Engineers', content: 'The tech industry demands a lot from its engineers. Burnout is real and affects productivity, creativity, and overall well-being. This article discusses practical strategies for maintaining work-life balance, managing stress, and staying healthy while building your career in tech. Setting boundaries is essential. Learn to say no to unnecessary meetings and protect your deep work time. Take regular breaks during coding sessions. The Pomodoro technique can help maintain focus without burning out. Physical health directly impacts mental performance. Regular exercise, proper sleep, and healthy eating habits are investments in your career. Building a support network of mentors and peers helps navigate challenging periods.', category_id: 3, author_idx: 0, tag_indices: [8] },
      { title: 'API Security Checklist for Production', content: 'Security should never be an afterthought. This comprehensive checklist covers essential security measures for production APIs including authentication, authorization, input validation, rate limiting, CORS configuration, and security headers. Authentication is the first line of defense. Use industry-standard protocols like OAuth 2.0 or JWT. Implement proper token rotation and revocation mechanisms. Always hash passwords with bcrypt or Argon2. Authorization ensures users can only access resources they own. Implement role-based access control and validate permissions at every endpoint. Input validation prevents injection attacks. Validate and sanitize all user inputs on the server side. Rate limiting protects against brute force attacks and abuse.', category_id: 1, author_idx: 2, tag_indices: [0, 1] },
      { title: 'My Thoughts on Remote Work in Tech', content: 'Remote work has fundamentally changed the tech industry. Having worked remotely for three years, I want to share my experiences, challenges, and tips for making remote work successful. The flexibility is incredible, but it requires discipline and intentional communication. Creating a dedicated workspace is crucial for maintaining work-life boundaries. Invest in a good chair, monitor, and keyboard. Your physical setup directly impacts your productivity and health. Communication becomes more intentional when remote. Over-communicate context and decisions. Write things down. Use async communication by default and save meetings for discussions that truly need real-time interaction.', category_id: 5, author_idx: 2, tag_indices: [8] },
      { title: 'Introduction to Microservices with Node.js', content: 'Microservices architecture allows you to build complex applications as a collection of small, independent services. This guide covers when to use microservices, how to decompose a monolith, and practical implementation with Node.js and Docker. Microservices are not always the answer. Start with a monolith and extract services when you have clear boundaries and scaling needs. Each service should have a single responsibility and own its data. Inter-service communication can use HTTP, gRPC, or message queues. We will implement a simple microservices setup with service discovery, API gateway pattern, and distributed tracing. Containerization with Docker makes deployment and scaling straightforward.', category_id: 2, author_idx: 0, tag_indices: [0, 7] },
    ];

    const allPosts = [];
    for (const postData of postsData) {
      const author = authors[postData.author_idx];
      const slug = generateSlug(postData.title);
      const words = postData.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(words / 200));

      const post = await Post.create({
        title: postData.title,
        slug,
        content: postData.content,
        excerpt: postData.content.substring(0, 200) + '...',
        author_id: author.id,
        category_id: postData.category_id,
        status: 'published',
        is_featured: postData.featured || false,
        reading_time: readingTime,
        view_count: Math.floor(Math.random() * 500) + 10,
        published_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      });

      for (const tagIdx of postData.tag_indices) {
        await post.addTag(tags[tagIdx]);
      }

      if (postData.category_id) {
        await Category.increment('post_count', { where: { id: postData.category_id } });
      }

      allPosts.push(post);
    }

    const draftPosts = [
      { title: 'Draft: Advanced Node.js Patterns', content: 'This is a draft about advanced patterns in Node.js development including event-driven architecture and streams.' },
      { title: 'Draft: Kubernetes for Beginners', content: 'Draft post covering Kubernetes fundamentals for developers who are just getting started with container orchestration.' },
      { title: 'Draft: GraphQL vs REST in 2024', content: 'Draft comparing GraphQL and REST APIs with practical examples and performance benchmarks.' },
    ];

    for (const draftData of draftPosts) {
      await Post.create({
        title: draftData.title,
        slug: generateSlug(draftData.title),
        content: draftData.content,
        author_id: authors[0].id,
        status: 'draft',
      });
    }

    console.log('Posts seeded');

    const commentsData = [
      { post_idx: 0, user_idx: 3, content: 'Excellent guide! This helped me understand Express middleware much better.' },
      { post_idx: 0, user_idx: 4, content: 'Very comprehensive. Would love to see a follow-up on error handling patterns.' },
      { post_idx: 1, user_idx: 5, content: 'The indexing section was incredibly useful for my current project.' },
      { post_idx: 2, user_idx: 6, content: 'Inspiring story! I am currently going through a similar journey.' },
      { post_idx: 2, user_idx: 7, content: 'Networking tips are spot on. Meetups changed everything for me too.' },
      { post_idx: 3, user_idx: 3, content: 'TypeScript has made our codebase so much more maintainable.' },
      { post_idx: 4, user_idx: 8, content: 'Docker Compose section was exactly what I needed for my project.' },
      { post_idx: 5, user_idx: 4, content: 'Edge computing is definitely the future. Exciting times ahead.' },
      { post_idx: 6, user_idx: 5, content: 'JWT refresh token rotation is so important and often overlooked.' },
      { post_idx: 7, user_idx: 6, content: 'FastAPI docs generation alone makes it worth switching from Flask.' },
      { post_idx: 8, user_idx: 7, content: 'Finally a clear comparison of state management options! Great article.' },
      { post_idx: 9, user_idx: 3, content: 'CI/CD setup guide was practical and actionable. Deployed it this week.' },
      { post_idx: 10, user_idx: 4, content: 'The before/after refactoring examples really drove the points home.' },
      { post_idx: 11, user_idx: 5, content: 'PostgreSQL query plan analysis section was eye-opening.' },
      { post_idx: 12, user_idx: 6, content: 'As someone who experienced burnout, this article resonates deeply.' },
      { post_idx: 13, user_idx: 7, content: 'Security checklist is now part of our team review process.' },
      { post_idx: 14, user_idx: 8, content: 'Remote work tips about dedicated workspace changed my productivity.' },
      { post_idx: 15, user_idx: 3, content: 'Start with monolith advice is so underrated. Great perspective.' },
      { post_idx: 0, user_idx: 4, content: 'Love the middleware examples. Bookmarked for future reference.' },
      { post_idx: 1, user_idx: 6, content: 'Connection pooling tips saved us from a production issue. Thanks!' },
    ];

    const allComments = [];
    for (const cData of commentsData) {
      const comment = await Comment.create({
        post_id: allPosts[cData.post_idx].id,
        user_id: readers[cData.user_idx].id,
        content: cData.content,
        is_approved: true,
      });
      allComments.push(comment);
    }

    const repliesData = [
      { comment_idx: 0, user_idx: 0, content: 'Glad it helped! Middleware is one of Express strongest features.' },
      { comment_idx: 1, user_idx: 0, content: 'Great suggestion! Working on that follow-up now.' },
      { comment_idx: 3, user_idx: 0, content: 'Keep going! The journey is worth every challenge.' },
      { comment_idx: 8, user_idx: 0, content: 'Thanks! Security often gets overlooked but it is critical.' },
      { comment_idx: 11, user_idx: 2, content: 'Automating your CI/CD early is one of the best investments.' },
    ];

    for (const rData of repliesData) {
      await Comment.create({
        post_id: allComments[rData.comment_idx].post_id,
        user_id: authors[rData.user_idx].id,
        content: rData.content,
        parent_id: allComments[rData.comment_idx].id,
        is_approved: true,
      });
    }

    console.log('Comments seeded');

    const likesData = [];
    for (let i = 0; i < 30; i++) {
      const postIdx = Math.floor(Math.random() * allPosts.length);
      const readerIdx = Math.floor(Math.random() * readers.length);
      likesData.push({
        post_id: allPosts[postIdx].id,
        user_id: readers[readerIdx].id,
      });
    }
    await Like.bulkCreate(likesData);
    console.log('Likes seeded');

    const bookmarksData = [];
    for (let i = 0; i < 10; i++) {
      const postIdx = Math.floor(Math.random() * allPosts.length);
      const readerIdx = Math.floor(Math.random() * readers.length);
      bookmarksData.push({
        post_id: allPosts[postIdx].id,
        user_id: readers[readerIdx].id,
      });
    }
    await Bookmark.bulkCreate(bookmarksData);
    console.log('Bookmarks seeded');

    const followPairs = [
      [3, 0], [3, 1], [4, 0], [4, 2], [5, 1],
      [6, 0], [7, 2], [8, 1], [3, 2], [5, 0],
    ];
    for (const [followerIdx, followingIdx] of followPairs) {
      await Follow.create({
        follower_id: readers[followerIdx].id,
        following_id: authors[followingIdx].id,
      });
    }
    console.log('Follows seeded');

    console.log('\n=== Seed Complete ===');
    console.log('Admin: admin@contentos.dev / Admin1234');
    console.log('Author: author@contentos.dev / Author1234');
    console.log('Reader: reader@contentos.dev / Reader1234');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
