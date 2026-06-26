process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_32chars';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_for_testing';
process.env.JWT_EXPIRE = '1800';
process.env.JWT_REFRESH_EXPIRE = '604800';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contentos_test';
