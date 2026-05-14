const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'szuper_titkos_kulcs_a_projekthez'; // Ezzel generáljuk a tokent

app.use(cors());
app.use(express.json());

// --- AUTENTIKÁCIÓS VÉGPONTOK (15 pont) ---

// 1. Regisztráció
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező!' });
    }

    // Jelszó titkosítása
    const hashedPassword = await bcrypt.hash(password, 10);
    // Ha a kérésben 'admin' szerepelt, az lesz, amúgy alapból 'user'
    const userRole = role === 'admin' ? 'admin' : 'user'; 

    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, hashedPassword, userRole], function(err) {
        if (err) return res.status(400).json({ error: 'Ez az e-mail cím már foglalt!' });
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    });
});

// 2. Bejelentkezés
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Hibás e-mail vagy jelszó!' });

        // Jelszó ellenőrzése
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Hibás e-mail vagy jelszó!' });

        // JWT Token generálása (beleírjuk a felhasználó ID-ját és szerepkörét)
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        
        res.status(200).json({ message: 'Sikeres bejelentkezés!', token, role: user.role });
    });
});


// --- ESEMÉNY VÉGPONTOK ---

// (A régi GET és POST végpontok változatlanul maradnak)
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Hiba az adatbázis olvasásakor' });
        res.status(200).json(rows);
    });
});

app.post('/api/events', (req, res) => {
    const { title, description, event_date, capacity } = req.body;
    if (!title || !event_date || !capacity) {
        return res.status(400).json({ error: 'A cím, a dátum és a kapacitás kötelező!' });
    }
    const sql = 'INSERT INTO events (title, description, event_date, capacity) VALUES (?, ?, ?, ?)';
    db.run(sql, [title, description, event_date, capacity], function (err) {
        if (err) return res.status(500).json({ error: 'Hiba mentéskor' });
        res.status(201).json({ message: 'Létrehozva!', eventId: this.lastID });
    });
});

// ÚJ: Esemény törlése (Csak Adminoknak!)
app.delete('/api/events/:id', (req, res) => {
    // 1. Kiszedjük a tokent a kérés fejlécéből
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ error: 'Nincs bejelentkezve!' });

    const token = authHeader.split(' ')[1]; // A "Bearer [token]" formátumból kiszedjük magát a tokent

    // 2. Ellenőrizzük, hogy a token érvényes-e és Admin-e
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Nincs jogosultságod a művelethez!' });
        }

        // 3. Ha minden oké, töröljük az eseményt
        db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: 'Hiba törléskor' });
            res.status(200).json({ message: 'Esemény sikeresen törölve!' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen.`);
});

module.exports = app;