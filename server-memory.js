const express = require('express');
const bodyParser = require('body-parser');
const { calculateDistance } = require('./utils/distanceCalculator');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database
let schools = [];
let nextId = 1;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// API Info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to School Management API (In-Memory Version)',
    endpoints: {
      addSchool: 'POST /addSchool',
      listSchools: 'GET /listSchools?latitude=<lat>&longitude=<lng>'
    }
  });
});

// Add School API
app.post('/addSchool', (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Validate input data
    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, address, latitude, longitude'
      });
    }

    // Validate data types
    if (typeof name !== 'string' || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Name and address must be strings'
      });
    }

    // Validate latitude and longitude
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Create new school
    const newSchool = {
      id: nextId++,
      name,
      address,
      latitude: lat,
      longitude: lng,
      created_at: new Date().toISOString()
    };

    // Add to in-memory database
    schools.push(newSchool);

    res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: newSchool
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// List Schools API
app.get('/listSchools', (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate input data
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required query parameters'
      });
    }

    // Validate latitude and longitude
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Calculate distance for each school and add it to the school object
    const schoolsWithDistance = schools.map(school => {
      const distance = calculateDistance(
        userLat,
        userLng,
        school.latitude,
        school.longitude
      );

      return {
        ...school,
        distance: parseFloat(distance.toFixed(2)) // Round to 2 decimal places
      };
    });

    // Sort schools by distance (closest first)
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      message: 'Schools retrieved successfully',
      data: schoolsWithDistance
    });
  } catch (error) {
    console.error('Error listing schools:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
