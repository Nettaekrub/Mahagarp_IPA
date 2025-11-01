import sqlite3 from "sqlite3";
import { open } from "sqlite";
let db;
(async () => {
  db = await open({
    filename: "./network.db",
    driver: sqlite3.Database
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS ip_entries (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    network_id INTEGER,
    FOREIGN KEY (network_id) REFERENCES networks (network_id)
        ON DELETE CASCADE 
);
 `);
 
})();