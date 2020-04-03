'use strict';

const { exec } = require('child_process');
const vnu = require('vnu-jar');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const fs = require('fs');

const express = require('express');
const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '2mb' }));

function logError(error) {
  fs.writeFile('./error.log', error, {'flag':'a'}, (err) => {
    if (err) console.error(err);
  });
}

function fixUrl(url) {
  if(url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return 'http://' + url; 
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    logError(err);
    return false;
  }
}

app.get('/url/:url', (req, res) => {
  const url = decodeURIComponent(req.params.url.trim()).trim();
  if (url) {
    if (isValidUrl(fixUrl(url))) {
      try {
        exec(`java -jar ${vnu} --format json ${fixUrl(url)}`, (error, stdout, stderr) => {
          if (error) {
            logError(error);
          } else {
            res.json(stderr);
          }
        });
      } catch (err) {
        logError(err);
      }
    } else {
      res.statusCode(500);
    }
  } else {
    res.statusCode(500);
  }
});

logError('');

const PORT = 5555;
app.listen(PORT, () => {
  console.log(`Server listening for validation on port ${PORT}...`);
});
