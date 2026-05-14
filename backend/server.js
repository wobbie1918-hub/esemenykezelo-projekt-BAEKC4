const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Az eseménykezelő szervere fut!');
});


app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen.`);
});