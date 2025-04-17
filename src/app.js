const express = require('express');
const helmet = require("helmet");
const morgan = require('morgan');
const axios = require('axios');
const app = express();
const port = 3000;

// Set environment variables or use default values
const message = process.env.MESSAGE || 'Hello, World!';
const bgColor = process.env.BG_COLOR || '#A9A9A9';
const fontColor = process.env.FONT_COLOR || '#000000';
const forceSetNotReady = process.env.FORCE_SET_NOT_READY || 'false';
const backendUrl = process.env.BACKEND_URL || null;

const appVersion = process.env.APP_VERSION || 'unknown';
const buildId = process.env.BUILD_ID || 'unknown';

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

morgan.token('headers', (req) => JSON.stringify(req.headers, null, 2));

const jsonMorganFormat = (tokens, req, res) => {
  const rawHeaders = tokens.headers(req, res);
  const parsedHeaders = JSON.parse(rawHeaders);

  return JSON.stringify({
    timestamp: new Date().toISOString(),
    severity_text: (() => {
      const code = Number.parseInt(tokens.status(req, res), 10);
      if (code >= 500) return 'ERROR';
      if (code >= 400) return 'WARN';
      return 'INFO';
    })(),
    body: res.locals.logMessage || `${tokens.method(req, res)} ${tokens.url(req, res)}`,
    'http.method': tokens.method(req, res),
    'http.target': tokens.url(req, res),
    'http.status_code': Number.parseInt(tokens.status(req, res), 10),
    'http.request.headers': parsedHeaders,
    //'http.request.header.raw': rawHeaders,
    'service.name': 'nodejs-colorizedapp'
  });
};

let isAppReady = false;
let backendData = [{ id: "1", description: "Unknown", details: "Fetching data...", done: false }];
let backendCode = 202;
let backendConfig = { table_style: "table-standard" };

if (forceSetNotReady.toLowerCase() === 'true') {
  console.log("WARNING: FORCE_SET_NOT_READY environment variable set to true; app never becomes ready!");
} else {
  setTimeout(() => {
    isAppReady = true;
  }, 20000);
}

// Security recommendations
app.disable('x-powered-by');
app.use(helmet());
app.use(morgan(jsonMorganFormat));
app.use('/static', express.static('static'));

// Middleware to set background and font color
app.use((req, res, next) => {
  res.locals.bgColor = bgColor;
  res.locals.fontColor = fontColor;
  next();
});

// Fetch backend data asynchronously
async function fetchBackendData() {
  if (!backendUrl) return;

  try {
    const configResponse = await axios.get(`${backendUrl}/config`);
    backendConfig = configResponse.data;

    const dataResponse = await axios.get(`${backendUrl}/task`);
    backendData = dataResponse.data.sort((a, b) => b.id - a.id).slice(0, 5);
    backendCode = 200;
    //console.log(`Backend data fetched successfully from ${backendUrl}`);
  } catch (error) {
    backendData = [{ id: "1", description: "Error", details: `Failed to fetch backend data: ${error.message}`, done: false }];
    backendCode = 503;
  }
}

// Fetch data on startup and refresh periodically
fetchBackendData();
setInterval(fetchBackendData, 15000);

// Serve backend data as JSON if backend enabled
if (backendUrl) {
  app.get('/data', (req, res) => {
    if (backendCode == 500 || backendCode == 202) {
      res.locals.logMessage = backendData[0].details
    }
    res.status(backendCode).json({ data: backendData });
  });
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
        padding-left: 10px;
      }
      div {
        width: 100%;
      }
      table {
        color: ${res.locals.fontColor};
        width: 80%;
        margin: 20px auto;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid ${res.locals.fontColor};
        padding: 8px;
      }
    </style>
    ${backendUrl ? `<link rel="stylesheet" href="static/${backendConfig.table_style}.css">` : ''}
    <meta charset="UTF-8">
    <title>nodejs-colorizedapp</title>
  </head>
  <body>
    <h1>${message}</h1>
    ${backendUrl ? `
    <script src="static/func.js"></script>
    <h2>Tasks list</h2>
    <div id="table-container">
      <table id="task-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Details</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody id="task-table-body">
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}
    <footer>
      nodejs-colorizedapp, version ${appVersion} (build id: ${buildId})
    </footer>
  </body>
  </html>
  `);
});

// JSON endpoint to expose message in JSON format
app.get('/json', (req, res) => {
  res.status(200).json({ bgColor, fontColor, message });
});

// Readiness check
app.get('/ready', (req, res) => {
  if (!isAppReady) {
    res.status(400).json({ ready: false });
  } else {
    res.status(200).json({ ready: true });
  }
});

// Liveness check
app.get('/live', (req, res) => {
  res.status(200).json({ ready: true });
});

module.exports = { app, server };
