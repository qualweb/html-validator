"use strict";

const { exec } = require("child_process");
const vnu = require("vnu-jar");
const cors = require("cors");
const compression = require("compression");
const fs = require("fs");

const express = require("express");
const app = express();

app.use(compression());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

function logError(error) {
  try {
    fs.writeFile(
      "./error.log",
      JSON.stringify(error) + "\n",
      { flag: "a" },
      (err) => {
        if (err) console.error(err);
      }
    );
  } catch (err) {
    console.error(err);
  }
}

function fixUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return "http://" + url;
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

app.get("/:url", (req, res) => {
  const url = decodeURIComponent(req.params.url.trim()).trim();
  if (url && url.trim() !== "favicon.ico") {
    if (isValidUrl(fixUrl(url))) {
      try {
        console.log("Validating: ", url);
        exec(
          `java -jar ${vnu} --stdout --errors-only --also-check-svg --no-stream --format json ${fixUrl(
            url
          )}`,
          (error, stdout) => {
            if (stdout) {
              res.status(200).json(stdout);
            } else if (error) {
              logError(error);
              res.status(500).json(error);
            }
          }
        );
      } catch (err) {
        logError(err);
        res.status(500).json(err);
      }
    } else {
      res.status(500).json("Invalid url");
    }
  } else {
    res.status(500).json("Invalid url");
  }
});

logError("HTML Validator error file");

const PORT = 5555;
app.listen(PORT, () => {
  console.log(`Server listening for validation on port ${PORT}...`);
});
