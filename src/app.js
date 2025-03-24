const express = require('express');
const helmet = require("helmet");
const morgan = require('morgan');
const axios = require('axios');
const app = express();
const port = 3000;

// Set environment variables or use default values
const message = process.env.MESSAGE || 'Hello, World!';
const bgColor = process.env.BG_COLOR || '#1162E8';
const fontColor = process.env.FONT_COLOR || '#ffffff';
const forceSetNotReady = process.env.FORCE_SET_NOT_READY || 'false';
const backendUrl = process.env.BACKEND_URL || null;

const appVersion = process.env.APP_VERSION || 'unknown'
const buildId = process.env.BUILD_ID || 'unknown'

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

let isAppReady = false;
let backendData = [{ id: "1", description: "Unknown status", details: "Backend data not loaded yet.", done: false}];
let backendConfig = []

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
app.use(morgan('combined'))
app.use('/static', express.static('static'))

// Middleware to set background and font color
app.use((req, res, next) => {
  res.locals.bgColor = bgColor;
  res.locals.fontColor = fontColor;
  next();
});

// Fetch backend data asynchronously
async function fetchBackendData() {
  if (backendUrl) {
    backendConfig = `${backendUrl}/config`
    backendData = `${backendUrl}/task`
    try {
      const configResponse = await axios.get(`${backendUrl}/config`);
      backendConfig = configResponse.data
      const dataResponse = await axios.get(`${backendUrl}/task`);
      backendData = dataResponse.data.sort((a, b) => b.id - a.id).slice(0, 5);
      console.log(`Backend data fetched successfully from ${backendUrl}`);
    } catch (error) {
      const customErrorMessage = `Failed to fetch backend data for ${backendUrl}: ${error.message}`;
      console.error(customErrorMessage);
      backendData = [{ id: "1", description: "Error", details: `${customErrorMessage}`, done: false}];
    }
  }
}

// Route to display the message
app.get('/', (req, res) => {
  res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en-us">
  <head>
    <style>
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: ${res.locals.bgColor};
        margin: 0;
        flex-direction: column;
      }
      h1 {
        font-size: 100px;
        color: ${res.locals.fontColor};
      }
      footer {
        background-color: #666666;
        color: #ffffff;
        width: 100%;
        bottom: 0;
        position: fixed;
        text-align: left;
        padding: 5px;
        padding-left: 30px;
        font-size: 20px;
      }
    </style>
    ${backendUrl ? `<link rel="stylesheet" href="static/${backendConfig['table_style'] ?? 'table-standard'}.css">` : ''}
    <meta charset="UTF-8">
    <title>nodejs-colorizedapp</title>
  </head>
  <body>
    <h1>${message}</h1>
    ${backendUrl ? `
    <h2>Tasks list</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Details</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        ${backendData.map(item => `
          <tr>
            <td>${item.id}</td>
            <td>${item.description}</td>
            <td>${item.details}</td>
            <td>${item.done}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}
    <footer>
      nodejs-colorizedapp, version ${appVersion} (build id: ${buildId})
    </footer>
  </body>
  </html>
  `);
  // Fetch the backend data after rendering the page
  fetchBackendData(); 
});

// JSON endpoint to expose message in JSON format
app.get('/json', (req, res) => {
  res.status(200).json({ bgColor, fontColor, message });
});

// Readiness check
app.get('/ready', (req, res) => {
  if (!isAppReady) {
    res.status(400).json({ "ready": "false" });
  } else {
    res.status(200).json({ "ready": "true" });
  }
});

// Liveness check
app.get('/live', (req, res) => {
  res.status(200).json({ "ready": "true" });
});

module.exports = { app, server };
