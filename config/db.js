const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000 // Increase timeout to 60 seconds
});

// Function to initialize the database and create tables if they don't exist
async function initializeDatabase() {
  try {
    console.log('Attempting to connect to database...');
    // First, try to connect to the database directly
    try {
      // Try to connect to the existing database first
      const testConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectTimeout: 60000 // Increase timeout to 60 seconds
      });

      console.log('Connected to existing database');

      // Create the schools table if it doesn't exist
      await testConnection.execute(`
        CREATE TABLE IF NOT EXISTS schools (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await testConnection.end();
      console.log('Database initialized successfully');
      return true;
    } catch (dbError) {
      // If we can't connect to the database, it might not exist yet
      if (dbError.code === 'ER_BAD_DB_ERROR') {
        console.log('Database does not exist, creating it...');
        // Create the database if it doesn't exist
        const rootConnection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT || 3306,
          connectTimeout: 60000 // Increase timeout to 60 seconds
        });

        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await rootConnection.end();

        // Now connect to the newly created database
        const newDbConnection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT || 3306,
          connectTimeout: 60000
        });

        // Create the schools table
        await newDbConnection.execute(`
          CREATE TABLE IF NOT EXISTS schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await newDbConnection.end();
        console.log('Database and table created successfully');
        return true;
      } else {
        // If it's another error, rethrow it
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

module.exports = {
  pool,
  initializeDatabase
};
