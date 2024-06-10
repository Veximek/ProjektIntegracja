import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './components/Chart';
import Filter from './components/Filter';
import Export from './components/Export';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const [stats, setStats] = useState({ prePandemic: "", duringPandemic: ""});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filters, setFilters] = useState({
    preStartDate: '2018-01-01',
    preEndDate: '2020-12-31',
    postStartDate: '2020-01-01',
    postEndDate: new Date().toISOString().slice(0, 10),
    country: 'USA'
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const prePandemicResponse = await axios.get('http://localhost:5000/api/stats/combined-stats', {
        params: {
          startDate: filters.preStartDate,
          endDate: filters.preEndDate,
          country: filters.country
        },
        headers: authHeader
      });

      const duringPandemicResponse = await axios.get('http://localhost:5000/api/stats/combined-stats', {
        params: {
          startDate: filters.postStartDate,
          endDate: filters.postEndDate,
          country: filters.country
        },
        headers: authHeader
      });

      setStats({
        prePandemic: prePandemicResponse.data.data,
        duringPandemic: duringPandemicResponse.data.data
      });
      console.log("Pre-pandemic data for Chart:", prePandemicResponse.data.data);
      console.log("During-pandemic data for Chart:", duringPandemicResponse.data.data);
      console.log("Pre-pandemic data for Chart:", stats.prePandemic);
      console.log("During-pandemic data for Chart:", stats.duringPandemic);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  const logout = () =>{
    setIsLoggedIn(false);
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchData();
  };

  return (
    <div>
      <h1>COVID-19 Statistics vs. GDP per person</h1>
      {!isLoggedIn ? (
        <>
          <Login onLogin={handleLogin} />
          <Register />
        </>
      ) : (
        <>
              <button onClick={logout}>Wyloguj</button>

          <Filter filters={filters} onFilterChange={handleFilterChange} />
          <button onClick={fetchData} disabled={isLoading}>
            {isLoading ? 'Fetching Data...' : 'Fetch Data'}
          </button>

          {isLoading && <div>Loading data...</div>}
          {error && <div>Error: {error.message}</div>}

          {!isLoading && !error && (
            <>
              <Chart prePandemicData={stats.prePandemic} duringPandemicData={stats.duringPandemic} />
              <Export data={stats} />

            </>
          )}
        </>
      )}
    </div>
  );
};



export default App;
