const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// routes
const provinces = require('./routes/api/provinces');
const armies    = require('./routes/api/armies');
const players   = require('./routes/api/players');
const sessions   = require('./routes/api/sessions');

const app = express();

// Connect Database
connectDB();

// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Hello world!'));

// use Routes
app.use('/api/provinces', provinces);
app.use('/api/armies',    armies);
app.use('/api/players',   players);
app.use('/api/sessions',  sessions);

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));