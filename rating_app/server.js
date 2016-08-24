'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const marked = require('marked');

function here(filepath) {
    if (typeof filepath !== 'string') {
        filepath = '';
    }
    return path.join(__dirname, filepath);
}

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    fs.createReadStream(here('index.html')).pipe(res);
});

app.use(express.static(here()));

app.get('/list', (req, res) => {
    fs.createReadStream(here('list.txt')).pipe(res);
});

app.get('/readme', (req, res) => {
    res.send(marked(fs.readFileSync(here(`../data/sample/${req.query.name}.md`)).toString()));
});

app.post('/rate', (req, res) => {
    let line = `${req.body.id}:\t${req.body.name}\t${req.body.rating}\n`;
    fs.appendFile(here('results.txt'), line);
    res.send('Rating saved. Thank you!');
});

app.listen(3000);
console.log('open localhost:3000');
