const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json()); 


app.get('/api/events', (req, res) => {
    const sql = 'SELECT * FROM events';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Hiba az adatbázis olvasásakor' });
        }
        res.status(200).json(rows);
    });
});


app.post('/api/events', (req, res) => {
    const { title, description, event_date, capacity } = req.body;


    if (!title || !event_date || !capacity) {
        return res.status(400).json({ error: 'A cím, a dátum és a kapacitás megadása kötelező!' });
    }

    const sql = 'INSERT INTO events (title, description, event_date, capacity) VALUES (?, ?, ?, ?)';
    const params = [title, description, event_date, capacity];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Hiba az esemény mentésekor' });
        }
        res.status(201).json({ 
            message: 'Esemény sikeresen létrehozva!',
            eventId: this.lastID 
        });
    });
});


app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen.`);
});