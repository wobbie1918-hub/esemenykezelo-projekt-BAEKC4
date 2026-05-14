const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'szuper_titkos_kulcs_a_projekthez';
const ADMIN_SECRET = 'titkoskod123'; // Ezt kell beírni az admin regisztrációhoz!

app.use(cors());
app.use(express.json());

// --- JOGOSULTSÁG ELLENŐRZŐ (Middleware) ---
// Ezzel védjük le az admin funkciókat
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ error: 'Nincs bejelentkezve!' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(403).json({ error: 'Nincs jogosultságod!' });
        req.user = decoded;
        next();
    });
}

// --- AUTENTIKÁCIÓ ---
app.post('/api/register', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Minden mező kötelező!' });

    let userRole = 'user';
    if (role === 'admin') {
        if (adminCode !== ADMIN_SECRET) return res.status(403).json({ error: 'Hibás admin titkos kód!' });
        userRole = 'admin';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, email, hashedPassword, userRole], function(err) {
        if (err) return res.status(400).json({ error: 'Ez az e-mail már foglalt!' });
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Hibás e-mail vagy jelszó!' });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Hibás e-mail vagy jelszó!' });
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Sikeres bejelentkezés!', token, role: user.role });
    });
});

// --- ESEMÉNYEK KEZELÉSE ---

// Bárki lekérdezheti, de CSAK A JÓVÁHAGYOTTAKAT!
app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events WHERE status = 'approved'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Hiba az adatbázis olvasásakor' });
        res.status(200).json(rows);
    });
});

// Bárki létrehozhat eseményt (de 'pending' státuszt kap alapból)
app.post('/api/events', (req, res) => {
    const { title, description, event_date, capacity } = req.body;
    if (!title || !event_date || !capacity) return res.status(400).json({ error: 'Hiányzó adatok!' });
    
    const sql = "INSERT INTO events (title, description, event_date, capacity, status) VALUES (?, ?, ?, ?, 'pending')";
    db.run(sql, [title, description, event_date, capacity], function (err) {
        if (err) return res.status(500).json({ error: 'Hiba mentéskor' });
        res.status(201).json({ message: 'Létrehozva, admin jóváhagyásra vár!' });
    });
});

// ADMIN: Függőben lévő események lekérése
app.get('/api/events/pending', authenticateAdmin, (req, res) => {
    db.all("SELECT * FROM events WHERE status = 'pending'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Hiba' });
        res.status(200).json(rows);
    });
});

// ADMIN: Esemény jóváhagyása
app.patch('/api/events/:id/approve', authenticateAdmin, (req, res) => {
    db.run("UPDATE events SET status = 'approved' WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Hiba jóváhagyáskor' });
        res.status(200).json({ message: 'Sikeresen jóváhagyva!' });
    });
});

// ADMIN: Esemény törlése
app.delete('/api/events/:id', authenticateAdmin, (req, res) => {
    db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Hiba törléskor' });
        res.status(200).json({ message: 'Sikeresen törölve!' });
    });
});

app.listen(PORT, () => console.log(`A szerver fut a http://localhost:${PORT} címen.`));
module.exports = app;