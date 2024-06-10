const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
  cacheKey: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // expires after 1 hour
});

module.exports = mongoose.model('Cache', CacheSchema);
