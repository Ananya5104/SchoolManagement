const { pool } = require('../config/db');
const { calculateDistance } = require('../utils/distanceCalculator');

/**
 * Add a new school to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function addSchool(req, res) {
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

    // Insert the school into the database
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, lat, lng]
    );

    res.status(201).json({
      success: true,
      message: 'School added successfully',
      data: {
        id: result.insertId,
        name,
        address,
        latitude: lat,
        longitude: lng
      }
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * List all schools sorted by proximity to a given location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function listSchools(req, res) {
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

    // Fetch all schools from the database
    const [schools] = await pool.execute('SELECT * FROM schools');

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
}

module.exports = {
  addSchool,
  listSchools
};
