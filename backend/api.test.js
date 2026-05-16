const request = require('supertest');
const app = require('./server'); 

describe('Eseménykezelő API Tesztek', () => {
    
    it('GET /api/events - Sikeresen le kell kérnie az eseményeket (200 OK)', async () => {
        const response = await request(app).get('/api/events');
        
        expect(response.statusCode).toBe(200);
        
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('POST /api/events - 400-as hibát kell adnia, ha hiányoznak a kötelező adatok', async () => {
        const hianyosAdat = {
            title: "Csak egy cím, a többi adat hiányzik"
        };

        const response = await request(app)
            .post('/api/events')
            .send(hianyosAdat);
        
        expect(response.statusCode).toBe(400);
        
        expect(response.body.error).toBe('A cím, a dátum és a kapacitás megadása kötelező!');
    });

});