const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const statsRouter = require('./routes/stats');

mongoose.connect('mongodb://localhost:27017/covidStats', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());


app.use('/api', statsRouter);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});