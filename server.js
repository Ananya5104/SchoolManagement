const express = require('express');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./config/db');
const schoolRoutes = require('./routes/schools');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Routes
app.use('/', schoolRoutes);

// API Info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to School Management API',
    endpoints: {
      addSchool: 'POST /addSchool',
      listSchools: 'GET /listSchools?latitude=<lat>&longitude=<lng>'
    }
  });
});

// Initialize database and start server
async function startServer() {
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } else {
    console.error('Failed to initialize database. Server not started.');
    process.exit(1);
  }
}

startServer();
