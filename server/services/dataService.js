const axios = require('axios');
const Stat = require('../models/Stat');

async function fetchData() {
  const response = await axios.get('URL_DO_API');
  const data = response.data;
  // Przykładowa struktura zapisu danych
  data.forEach(async (item) => {
    const stat = new Stat({
      category: item.category,
      item: item.item,
      date: new Date(item.date),
      price: item.price,
    });
    await stat.save();
  });
}

module.exports = { fetchData };