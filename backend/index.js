// index.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
// Import routes
const statsRoutes = require('./routes/stats'); 
const authRoutes = require('./routes/auth'); 
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// Mongo Connection
mongoose.connect('mongodb://localhost:27017/covidStats', { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routes
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});