const express = require('express');
const helmet = require("helmet");
const app = express();
const port = 3000;

// Set environment variables or use default values
const message = process.env.MESSAGE || 'Hello, World!';
const bgColor = process.env.BG_COLOR || '#1162E8';
const fontColor = process.env.FONT_COLOR || '#ffffff';
const forceSetNotReady = process.env.FORCE_SET_NOT_READY || 'false';

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

let isAppReady = false;

if (forceSetNotReady.toLowerCase() == 'true') {
  console.log(
    "WARNING: FORCE_SET_NOT_READY environment variable set to true; app never become ready!"
  );
} else {
  setTimeout(() => {
    isAppReady = true;
  }, 20000);
}

// Security recommendations
app.disable('x-powered-by')
app.use(helmet())

// Middleware to set background and font color
app.use((req, res, next) => {
  res.locals.bgColor = bgColor;
  res.locals.fontColor = fontColor;
  next();
});

// Route to display the message
app.get('/', (req, res) => {
  res.status(200).send(`
  <html>
  <head>
    <style>
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: ${res.locals.bgColor};
        margin: 0;
      }
      h1 {
        font-size: 100px;
        color: ${res.locals.fontColor};
      }
    </style>
  </head>
  <body>
    <h1>${message}</h1>
  </body>
  </html>
  `);
});

// JSON endpoint to expose message in JSON format
app.get('/json', (req, res) => {
  res.status(200).json({ bgColor, fontColor, message });
});

app.get('/ready', (req, res) => {
  if (!isAppReady) {
    res.status(400).json({ "ready": "false" });
  } else {
    res.status(200).json({ "ready": "true" });
  }
});

app.get('/live', (req, res) => {
  res.status(200).json({ "ready": "true" });
});

module.exports = { app, server };
