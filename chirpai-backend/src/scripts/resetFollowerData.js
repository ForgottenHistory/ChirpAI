// Manual script to reset and initialize follower data
// Run this with: node src/scripts/resetFollowerData.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../chirpai.db');
const db = new Database(dbPath);

console.log('Resetting follower data...');

try {
  // First, let's see what columns exist
  const tableInfo = db.prepare("PRAGMA table_info(characters)").all();
  console.log('Current table structure:', tableInfo.map(col => col.name));
  
  // Check if follower columns exist
  const hasFollowersColumn = tableInfo.some(col => col.name === 'followers_count');
  const hasFollowingColumn = tableInfo.some(col => col.name === 'following_count');
  
  console.log('Has followers_count column:', hasFollowersColumn);
  console.log('Has following_count column:', hasFollowingColumn);
  
  // Add columns if they don't exist
  if (!hasFollowersColumn) {
    db.exec(`ALTER TABLE characters ADD COLUMN followers_count INTEGER DEFAULT 0;`);
    console.log('Added followers_count column');
  }
  
  if (!hasFollowingColumn) {
    db.exec(`ALTER TABLE characters ADD COLUMN following_count INTEGER DEFAULT 0;`);
    console.log('Added following_count column');
  }
  
  // Now set the initial data
  const updateCounts = db.prepare(`
    UPDATE characters 
    SET followers_count = ?, following_count = ? 
    WHERE id = ?
  `);
  
  const initialData = [
    { id: 1, followers: 1200 + Math.floor(Math.random() * 100), following: 543 + Math.floor(Math.random() * 50) },
    { id: 2, followers: 890 + Math.floor(Math.random() * 100), following: 321 + Math.floor(Math.random() * 50) },
    { id: 3, followers: 1450 + Math.floor(Math.random() * 100), following: 678 + Math.floor(Math.random() * 50) }
  ];
  
  console.log('Setting initial follower data...');
  initialData.forEach(data => {
    const result = updateCounts.run(data.followers, data.following, data.id);
    console.log(`Set character ${data.id}: ${data.followers} followers, ${data.following} following (${result.changes} rows affected)`);
  });
  
  // Verify the data
  const verifyData = db.prepare('SELECT id, username, followers_count, following_count FROM characters');
  const results = verifyData.all();
  console.log('\nFinal verification:');
  results.forEach(char => {
    console.log(`${char.username} (ID: ${char.id}): ${char.followers_count} followers, ${char.following_count} following`);
  });
  
  console.log('\nFollower data reset complete!');
  
} catch (error) {
  console.error('Error resetting follower data:', error);
} finally {
  db.close();
}