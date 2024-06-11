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
async function fetchCovidData(startDate, endDate, country, province = null) {
  const transformedCovidData = [];
  const startYear = parseInt(startDate.slice(0, 4), 10);
  const endYear = parseInt(endDate.slice(0, 4), 10);

  for (let year = startYear; year <= endYear; year++) {
    const date = `${year}-12-31`;
    const covidApiUrl = "https://covid-api.com/api/reports";
    const params = { date, iso: country };

    try {
      const covidResponse = await axios.get(covidApiUrl, { params });

      if (covidResponse.data && covidResponse.data.data && covidResponse.data.data.length > 0) {
        if (province) {
          const regionData = covidResponse.data.data.find(r => r.region.province.toLowerCase() === province.toLowerCase());
          if (regionData) {
            transformedCovidData.push({
              year: year.toString(),
              country: country.toUpperCase(),
              region: regionData.region.province || regionData.region.name,
              cases: regionData.confirmed,
              deaths: regionData.deaths,
              recovered: regionData.recovered,
              active: regionData.active,
              fatalityRate: regionData.fatality_rate,
            });
          } else {
            transformedCovidData.push({
              year: year.toString(),
              country: country.toUpperCase(),
              region: province,
              cases: null,
              deaths: null,
              recovered: null,
              active: null,
              fatalityRate: null,
            });
          }
        } else {
          let confirmed = 0;
          let deaths = 0;
          let recovered = 0;
          let active = 0;
          covidResponse.data.data.forEach(regionData => {
            confirmed += regionData.confirmed;
            deaths += regionData.deaths;
            recovered += regionData.recovered;
            active += regionData.active;
          });
          const fatalityRate = deaths / confirmed;

          transformedCovidData.push({
            year: year.toString(),
            country: country.toUpperCase(),
            cases: confirmed,
            deaths: deaths,
            recovered: recovered,
            active: active,
            fatalityRate: fatalityRate,
          });
        }
      } else {
        transformedCovidData.push({
          year: year.toString(),
          country: country.toUpperCase(),
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

router.get('/regions', authenticateJWT, async (req, res) => {
  const { country } = req.query;
  const covidApiUrl = "https://covid-api.com/api/reports";
  const params = { iso: country };

  console.log("/region: req.query", req.query);
  console.log("/region: params", params);

  try {
    const covidResponse = await axios.get(covidApiUrl, { params });
    const regions = covidResponse.data.data.map(regionData => regionData.region.province).filter(Boolean);

    res.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Error fetching regions', details: error.message });
  }
});




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
    query("country").isLength({ min: 2, max: 3 }).withMessage("Invalid country code format. Use ISO 3166-1 alpha-2 or alpha-3."),
    query("region").optional().isLength({ min: 2 }).withMessage("Invalid region code format."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { startDate, endDate, country, region } = req.query;
      const cacheKey = `${startDate}-${endDate}-${country}-${region || 'all-regions'}`;

      // Check MongoDB for cached data
      const cachedData = await Cache.findOne({ cacheKey });

      if (cachedData) {
        console.log("Serving from MongoDB cache!");
        return res.json(cachedData.data);
      }

      // Fetch new data if not in cache
      const [covidData, gdpData] = await Promise.all([
        fetchCovidData(startDate, endDate, country, region),
        fetchGdpData(startDate, endDate, country)
      ]);

      console.log('COVID Data:', covidData);
      console.log('GDP Data:', gdpData);

      const aggregatedData = mergeData(covidData, gdpData);

      const resultData = {
        startDate,
        endDate,
        country: country.toUpperCase(),
        region: region || "All",
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

const express = require('express');
const json2xml = require('json2xml');
const { authenticateJWT } = require('../middleware/auth');

router.get('/export', authenticateJWT, async (req, res) => {
  const { format } = req.query;

  try {
    // Replace this with your actual data fetching logic
    const data = {
      prePandemic: "Pre-Pandemic Data",
      duringPandemic: "During-Pandemic Data"
    };

    if (format === 'xml') {
      const xmlData = json2xml(data);
      res.header('Content-Type', 'application/xml');
      res.send(xmlData);
    } else {
      res.header('Content-Type', 'application/json');
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data', details: error.message });
  }
});

module.exports = router;
