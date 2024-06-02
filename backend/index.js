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
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,  
    useUnifiedTopology: true, 
    serverSelectionTimeoutMS: 4000,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    }); 
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); 
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routes
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);