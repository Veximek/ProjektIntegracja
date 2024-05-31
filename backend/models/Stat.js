const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statSchema = new Schema({
  category: String,
  item: String,
  date: Date,
  price: Number,
});

module.exports = mongoose.model('Stat', statSchema);