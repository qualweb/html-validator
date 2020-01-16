'use strict';

const exec = require('child_process').exec;
const vnu = require('vnu-jar');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
app.use(compression());
app.use(cors());
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '2mb' }));

function fixUrl(url) {
  if(url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return 'http://' + url; 
}

app.get('/url/:url', (req, res) => {
  const url = decodeURIComponent(req.params.url);
  console.log(`Validating ${url}`);
  exec(`java -jar ${vnu} --format json ${fixUrl(url)}`, (error, stdout, stderr) => {
    res.json(stderr);
  });
});

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
