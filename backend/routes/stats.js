const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query, validationResult } = require('express-validator');
const authenticateJWT = require('../middleware/auth');
const Stat = require('../models/Stat');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const Cache = require('../models/Cache');

// Helper function to fetch data from the COVID API
async function fetchCovidData(startDate, endDate, country) {
  const transformedCovidData = [];
  const startYear = parseInt(startDate.slice(0, 4), 10);
  const endYear = parseInt(endDate.slice(0, 4), 10);

  for (let year = startYear; year <= endYear; year++) {
    const date = `${year}-12-31`;
    const covidApiUrl = "https://covid-api.com/api/reports";
    const params = { date };

    if (country) {
      params.iso = country;
    }

    try {
      const covidResponse = await axios.get(covidApiUrl, { params });

      if (covidResponse.data && covidResponse.data.data && covidResponse.data.data.length > 0) {
        const covidData = covidResponse.data.data[0];
        transformedCovidData.push({
          year: year.toString(),
          country: covidData.region.iso.toUpperCase(),
          cases: covidData.confirmed,
          deaths: covidData.deaths,
          recovered: covidData.recovered,
          active: covidData.active,
          fatalityRate: covidData.fatality_rate,
        });
      } else {
        console.warn(`No COVID data found for year ${year} and country ${country}`);
        transformedCovidData.push({
          year: year.toString(),
          country: country.toUpperCase() || "Unknown",
          cases: null,
          deaths: null,
          recovered: null,
          active: null,
          fatalityRate: null,
        });
      }
    } catch (error) {
      console.error(`Error fetching COVID data for year ${year}:`, error);
    }
  }

  return transformedCovidData;
}

// Helper function to fetch GDP data from the World Bank API
async function fetchGdpData(startDate, endDate, country) {
  try {
    const worldBankApiUrl = `https://api.worldbank.org/v2/country/${country}/indicator/NY.GDP.PCAP.CD?format=json&per_page=1000&date=${startDate.slice(0, 4)}:${endDate.slice(0, 4)}`;
    const gdpResponse = await axios.get(worldBankApiUrl);

    if (gdpResponse.data && gdpResponse.data.length > 1) {
      const gdpData = gdpResponse.data[1];

      return gdpData.filter((item) => {
        const year = parseInt(item.date, 10);
        return year >= parseInt(startDate.slice(0, 4), 10) && year <= parseInt(endDate.slice(0, 4), 10);
      }).map((item) => ({
        year: item.date,
        country: country.toUpperCase(),
        gdpPerCapita: item.value,
      }));
    } else {
      console.warn("No GDP data found.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching GDP data:", error);
    throw error;
  }
}

// Helper function to merge COVID and GDP data
function mergeData(covidData, gdpData) {
  const mergedData = covidData.map((covidEntry) => {
    const gdpEntry = gdpData.find(
      (gdpEntry) => gdpEntry.year === covidEntry.year && (gdpEntry.country === covidEntry.country || gdpEntry.country === 'US' && covidEntry.country === 'USA')
    );
    return {
      ...covidEntry,
      gdpPerCapita: gdpEntry ? gdpEntry.gdpPerCapita : null,
    };
  });

  return mergedData;
}

// Helper function to save data to the database
async function saveDataToDatabase(data, dataType) {
  for (let item of data) {
    item.dataType = dataType;
    const stat = new Stat(item);
    await stat.save();
  }
}

// Combined route for fetching and saving COVID and GDP data
router.get(
  "/combined-stats", authenticateJWT,
  [
    query("startDate").isISO8601().withMessage("Invalid start date format. Use YYYY-MM-DD."),
    query("endDate").isISO8601().withMessage("Invalid end date format. Use YYYY-MM-DD."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { startDate, endDate, country } = req.query;
      const cacheKey = `${startDate}-${endDate}-${country || 'all-countries'}`;

      // Check MongoDB for cached data
      const cachedData = await Cache.findOne({ cacheKey });

      if (cachedData) {
        console.log("Serving from MongoDB cache!");
        return res.json(cachedData.data);
      }

      // Fetch new data if not in cache
      const [covidData, gdpData] = await Promise.all([
        fetchCovidData(startDate, endDate, country),
        fetchGdpData(startDate, endDate, country)
      ]);

      console.log('COVID Data:', covidData);
      console.log('GDP Data:', gdpData);

      const aggregatedData = mergeData(covidData, gdpData);

      const resultData = {
        startDate,
        endDate,
        country: country || "Global",
        data: aggregatedData,
      };

      await saveDataToDatabase(aggregatedData, new Date(endDate) < new Date('2020-03-01') ? 'pre-pandemic' : 'during-pandemic');

      // Save new data to MongoDB cache
      await Cache.create({ cacheKey, data: resultData });

      res.json(resultData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error fetching data", details: error.message });
    }
  }
);

// Export data route
router.get('/export', authenticateJWT, async (req, res) => {
  const { format } = req.query;
  try {
    const stats = await Stat.find();
    let responseData;

    if (format === 'xml') {
      responseData = json2xml({ stats });
      res.header('Content-Type', 'application/xml');
    } else {
      responseData = stats;
      res.header('Content-Type', 'application/json');
    }

    res.send(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', details: error.message });
  }
});

module.exports = router;
