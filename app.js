const express = require('express');
const app = express();
const port = 3000;

// Set environment variables or use default values
const message = process.env.MESSAGE || 'Hello, World!';
const bgColor = process.env.BG_COLOR || '#1162E8';
const fontColor = process.env.FONT_COLOR || '#ffffff';

// Middleware to set background and font color
app.use((req, res, next) => {
  res.locals.bgColor = bgColor;
  res.locals.fontColor = fontColor;
  next();
});

// Route to display the message
app.get('/', (req, res) => {
  res.send(`
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
  res.json({ bgColor, fontColor, message });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
