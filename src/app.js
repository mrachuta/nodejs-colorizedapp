const express = require('express');
const health = require('@cloudnative/health-connect');
const helmet = require("helmet");
const app = express();
const port = 3000;

// Set environment variables or use default values
const message = process.env.MESSAGE || 'Hello, World!';
const bgColor = process.env.BG_COLOR || '#1162E8';
const fontColor = process.env.FONT_COLOR || '#ffffff';
const pingAddr = process.env.PING_ADDR || 'example.com'

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

let healthCheck = new health.HealthChecker();

// Logic to handle liveness check
const livePromise = () => new Promise((resolve, reject) => {
  const appFunctioning = true;
  if (appFunctioning) {
    resolve();
  } else {
    reject(new Error("App is not functioning correctly"));
  }
});
let liveCheck = new health.LivenessCheck("LivenessCheck", livePromise);
healthCheck.registerLivenessCheck(liveCheck);

// Logic to handle readiness check
let readyCheck = new health.PingCheck(pingAddr);
healthCheck.registerReadinessCheck(readyCheck);

// Security recommendations
//app.disable('x-powered-by')
app.use(helmet())

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

app.use('/live', health.LivenessEndpoint(healthCheck));

app.use('/ready', health.ReadinessEndpoint(healthCheck));

module.exports = { app, server };
