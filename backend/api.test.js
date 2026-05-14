const request = require('supertest');
const app = require('./server'); // Beimportáljuk a szerverünket

describe('Eseménykezelő API Tesztek', () => {
    
    // 1. Teszt: Események lekérdezése
    it('GET /api/events - Sikeresen le kell kérnie az eseményeket (200 OK)', async () => {
        const response = await request(app).get('/api/events');
        
        // Elvárjuk, hogy a státuszkód 200 legyen
        expect(response.statusCode).toBe(200);
        
        // Elvárjuk, hogy a válasz egy tömb (lista) legyen
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    // 2. Teszt: Validáció ellenőrzése
    it('POST /api/events - 400-as hibát kell adnia, ha hiányoznak a kötelező adatok', async () => {
        const hianyosAdat = {
            title: "Csak egy cím, a többi adat hiányzik"
        };

        const response = await request(app)
            .post('/api/events')
            .send(hianyosAdat);
        
        // Elvárjuk, hogy a backendünk visszautasítsa (400 Bad Request)
        expect(response.statusCode).toBe(400);
        
        // Elvárjuk, hogy a hibaüzenet pontosan az legyen, amit megírtunk
        expect(response.body.error).toBe('A cím, a dátum és a kapacitás megadása kötelező!');
    });

});