const express = require('express');
const sseExpress = require('sse-express');
const cors = require('cors');

const app = express();
const sseApp = express(); // Separate Express app for SSE functionality

// CORS middleware
app.use(cors());

// Route to send messages to clients
app.get('/send', (req, res) => {
  const message = req.query.message || 'Default message'; // Get message from query parameter

  if (sseStream) {
    sseStream.send(message); // Send message to connected clients
    res.send('Message sent to clients');
  } else {
    res.status(400).send('No SSE connection established');
  }
});

// Create an SSE stream
let sseStream = null;

// Route to initiate the SSE connection
sseApp.get('/sse', (req, res) => {
  // Create the SSE stream
  sseStream = sseExpress();

  // Set headers for SSE
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Flush the headers to establish SSE with the client

  // Send initial message to client
  sseStream.send('Connected to SSE');

  // Handle SSE connection close
  req.on('close', () => {
    sseStream = null; // Reset SSE stream
  });
});

// Mount the SSE app to a specific route
app.use('/api/sse', sseApp);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});