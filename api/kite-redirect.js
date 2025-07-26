const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

// Load environment variables
dotenv.config();

// Initialize EdgeDB connection
const { testConnection } = require('../server/utils/db');
testConnection();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Import controller
const kiteController = require('../server/controllers/kiteController');

// Define route
app.get('/api/kite-redirect', kiteController.kiteCallback);

module.exports = app;
module.exports.handler = serverless(app);
