const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { gameSessionSetupClients } = require('./broadcast');

// routes
const provinces = require('./routes/api/provinces');
const armies = require('./routes/api/armies');
const players = require('./routes/api/players');
const sessions = require('./routes/api/sessions');
const upgrades = require('./routes/api/upgrades');

const app = express();
const appSSE = express();

// Connect Database
connectDB();

// CORS
app.use(cors({ origin: true, credentials: true }));
appSSE.use(cors());

// Init Middleware
app.use(express.json({ extended: false }));

// SSE clients
let clients = [];

// Function to send SSE messages to all clients
function broadcastMessage(message) {
  clients.forEach(client => {
    const current = client['client'];
    current.res.write(`data: ${message}\n\n`); // Send SSE message to client
  });
}

// Route to initiate SSE connection
appSSE.get('/rec', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const token = new Date().getTime();
  const dataPackage = JSON.stringify({purpose: 'connect', package: token});
  // Send initial SSE message to client
  res.write(`data: ${dataPackage}\n\n`);
  
  const client = { client: {res}, token: token, session: '', player: '' };
  
  // Add the client to the list of connected clients
  clients.push(client);

  // Handle client disconnection
  req.on('close', () => {
    // Remove the client from the list of connected clients
    const index = clients.indexOf(client['client']);
    if (index !== -1) {
      clients.splice(index, 1);
    }

  });
  
  gameSessionSetupClients(clients, broadcastMessage);
  broadcastMessage('data: Test of broadcast\n\n');
});

// A default message for the backend screens
app.get('/', (req, res) => {
  res.send('Hearts of Steel Backend!');
});

appSSE.get('/', (req, res) => {
  res.send('Hearts of Steel SSE Backend!');
});

// Use Routes
app.use('/api/provinces', provinces);
app.use('/api/armies', armies);
app.use('/api/players', players);
app.use('/api/sessions', sessions);
app.use('/api/upgrades', upgrades);

const port = process.env.PORT || 8082;
const port2 = 5001;

//module.exports = { broadcastMessage };

app.listen(port, () => console.log(`Server running on port ${port}`));

appSSE.listen(port2, () => console.log(`SSE server running on port ${port2}`));
