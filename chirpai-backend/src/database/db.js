const Database = require('better-sqlite3');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, '../../chirpai.db');
const db = new Database(dbPath);

// Schema initialization modules
const { initializeTables } = require('./schema');
const { initializeDefaultData } = require('./defaultData');

// Initialize database
const initDB = () => {
  console.log('Initializing database...');
  
  try {
    initializeTables(db);
    initializeDefaultData(db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize on import
initDB();

module.exports = db;