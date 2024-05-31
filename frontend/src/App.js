import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './components/Chart';
import Filter from './components/Filter';
import Export from './components/Export';

const App = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Covid Stats</h1>
      <Filter />
      <Chart data={stats} />
      <Export data={stats} />
    </div>
  );
}

export default App;