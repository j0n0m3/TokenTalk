// server/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/chats.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;