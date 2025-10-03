const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const { makeInMemoryStore } = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;
// console.log(typeof makeInMemoryStore);

app.get('/', (req, res) => {
    res.send(typeof makeInMemoryStore);
    // res.sendFile(path.join(__dirname, 'public', 'index.html'));
});