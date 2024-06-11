import React, { useState } from 'react';
import axios from 'axios';

const Filter = ({ 
  filters = { preStartDate: '', preEndDate: '', postStartDate: '', postEndDate: '', country: '', region: '' }, 
  onFilterChange = () => {},
  onGetRegions = () => {}
}) => {
  const [regions, setRegions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleGetRegions = async () => {
    if (filters.country) {
      try {
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('http://localhost:5000/api/stats/regions', {
          params: { country: filters.country },
          headers: authHeader,
        });
        setRegions(response.data.regions);
        onGetRegions(response.data.regions);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    }
  };

  return (
    <div>
      <div>
        <label>
          Pre-Pandemic Start Date:
          <input
            type="date"
            name="preStartDate"
            value={filters.preStartDate}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Pre-Pandemic End Date:
          <input
            type="date"
            name="preEndDate"
            value={filters.preEndDate}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Post-Pandemic Start Date:
          <input
            type="date"
            name="postStartDate"
            value={filters.postStartDate}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Post-Pandemic End Date:
          <input
            type="date"
            name="postEndDate"
            value={filters.postEndDate}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Country:
          <input
            type="text"
            name="country"
            value={filters.country}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <button onClick={handleGetRegions} disabled={!filters.country}>
          Get Regions
        </button>
      </div>
      <div>
        <label>
          Region:
          <select
            name="region"
            value={filters.region}
            onChange={handleChange}
            disabled={!filters.country || regions.length === 0}
          >
            <option value="">Select a region</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default Filter;
