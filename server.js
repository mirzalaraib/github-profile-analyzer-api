require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');
const { createTable } = require('./src/models/profile.model');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Verify database connectivity
    console.log('Connecting to MySQL database...');
    const connection = await db.getConnection();
    console.log('Database connected successfully.');
    connection.release();

    // 2. Run schema setup (migrations)
    console.log('Running database migrations...');
    await createTable();

    // 3. Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting the server:', error);
    process.exit(1);
  }
};

startServer();
