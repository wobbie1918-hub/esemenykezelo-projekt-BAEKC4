# Eseménykezelő Webalkalmazás


Ez a projekt egy full-stack webalkalmazás, amely lehetővé teszi események böngészését és új események meghirdetését. A rendszer kliens-szerver architektúrára épül, relációs adatbázist használ, és automatizált tesztekkel van lefedve.

##  Alkalmazás felépítése

A projekt három fő rétegből áll:
1. **Frontend (Kliensoldal):** Reszponzív HTML/CSS és Vanilla JavaScript felület, amely a böngészőben fut és a Fetch API segítségével kommunikál a szerverrel. (A `frontend` mappában található).
2. **Backend (Szerveroldal):** Node.js és Express.js alapú REST API, amely fogadja a kliens kéréseit, validálja az adatokat és kezeli az üzleti logikát. (A `backend` mappában található).
3. **Adatbázis:** SQLite relációs adatbázis. A táblákat a `database.sql` script határozza meg, a kapcsolatot pedig a `db.js` fájl építi fel. Az adatok lokálisan a `database.sqlite` fájlban tárolódnak.

##  Telepítés és Konfiguráció

**Előfeltétel:** A futtatáshoz telepített [Node.js](https://nodejs.org/) (LTS verzió) szükséges.

### Lépések a futtatáshoz:

1. **A csomag letöltése / klónozása**
   Nyisd meg a projekt főkönyvtárát egy terminálban.

2. **Függőségek telepítése**
   Navigálj a backend mappába és telepítsd a szükséges npm csomagokat:
   ```bash
   cd backend
   npm install