// Initialize storage with seed data
const fs = require('fs');
console.log('Loading seed data...');
const seedAsString = fs.readFileSync('./confing/seed.json');
const seedData = JSON.parse(seedAsString);
const storage = require('./util/serviceLocator').storage(seedData);

// Set up server
const app = require('express')();

app.get('*', (req, res) => {
    res.end('Hello');
});

const port = 3000;
app.listen(port);
console.log(`Listenning on port ${port}`);