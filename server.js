const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    await sequelize.sync();
    logger.info('Models synchronized');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});
