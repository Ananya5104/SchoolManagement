# School Management System

A Node.js/Express.js application with MySQL for managing school data. The system allows users to add new schools and retrieve a list of schools sorted by proximity to a user-specified location.

## Features

- Add schools with name, address, and geographical coordinates
- List schools sorted by proximity to a given location
- Web interface for easy interaction
- RESTful API endpoints

## API Endpoints

- `POST /addSchool` - Add a new school
- `GET /listSchools?latitude=<lat>&longitude=<lng>` - List schools sorted by proximity

## Technologies Used

- Node.js
- Express.js
- MySQL
- HTML/CSS/JavaScript (Frontend)

## Environment Variables

Create a `.env` file with the following variables:

```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=school_management
DB_PORT=3306
PORT=3000
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Start the server: `npm start`

## Development

- Run in development mode: `npm run dev`
- Run in-memory version (no database): `npm run memory`

## Deployment

This application can be deployed to various platforms:

- Render
- Heroku
- AWS Elastic Beanstalk
- Any platform supporting Node.js applications

## License

ISC
