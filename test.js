// const express = require('express');
// const axios = require('axios');
// const path = require('path');
// const cors = require('cors');
// const { makeInMemoryStore } = require("@whiskeysockets/baileys");

// const app = express();
// const PORT = process.env.PORT || 3000;
// // console.log(typeof makeInMemoryStore);

// app.get('/', (req, res) => {
//     console.log(typeof makeInMemoryStore);
//     res.send(typeof makeInMemoryStore);
//     // res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


// const { makeInMemoryStore } = require("@whiskeysockets/baileys");
// console.log(typeof makeInMemoryStore);

const { makeInMemoryStore } = require("@whiskeysockets/baileys/lib/store");
console.log(typeof makeInMemoryStore);
