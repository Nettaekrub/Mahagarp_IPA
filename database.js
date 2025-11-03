const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const migrationScript = `
    CREATE TABLE IF NOT EXISTS networks (
        network_id INTEGER PRIMARY KEY AUTOINCREMENT,
        network_name TEXT NOT NULL UNIQUE  
    );

    CREATE TABLE IF NOT EXISTS ip_entries (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL,
        
        network_id INTEGER,
        FOREIGN KEY (network_id) REFERENCES networks (network_id)
            ON DELETE CASCADE 
    );
`;
async function getDb() {
    const db = await open({
        filename: "./database/network.db",
        driver: sqlite3.Database
    });
    await db.run("PRAGMA foreign_keys = ON;");

    await db.exec(migrationScript);

    return db;
}

module.exports = { getDb };
