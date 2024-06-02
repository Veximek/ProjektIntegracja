const mongoose = require('mongoose');

const StatSchema = new mongoose.Schema({
  year: String,
  country: String,
  cases: Number,
  deaths: Number,
  recovered: Number,
  active: Number,
  fatalityRate: Number,
  gdpPerCapita: Number,
  dataType: String // pre-pandemic or during-pandemic
});

module.exports = mongoose.model('Stat', StatSchema);
