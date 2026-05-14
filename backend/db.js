const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');


const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Hiba az adatbázis csatlakozásakor:', err.message);
    } else {
        console.log('Sikeresen kapcsolódva az SQLite adatbázishoz.');
        initDb(); 
    }
});


function initDb() {
    const sqlScriptPath = path.resolve(__dirname, '../database.sql'); 
    if (fs.existsSync(sqlScriptPath)) {
        const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
        db.exec(sqlScript, (err) => {
            if (err) {
                console.error('Hiba az SQL script futtatásakor:', err.message);
            } else {
                console.log('Az adatbázis táblák sikeresen létrehozva/ellenőrizve.');
            }
        });
    } else {
        console.log('Nem található a database.sql fájl.');
    }
}

module.exports = db;