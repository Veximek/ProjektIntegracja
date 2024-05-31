const express = require('express');
const router = express.Router();
const Stat = require('../models/Stat');
const { fetchData } = require('../services/dataService');

router.get('/fetch', async (req, res) => {
  await fetchData();
  res.send('Data fetched and stored');
});

router.get('/stats', async (req, res) => {
  const stats = await Stat.find({});
  res.json(stats);
});

module.exports = router;