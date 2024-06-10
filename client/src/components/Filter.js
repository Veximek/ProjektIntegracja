import React from 'react';

const Filter = ({ 
  filters = { preStartDate: '', preEndDate: '', postStartDate: '', postEndDate: '', country: '' }, 
  onFilterChange = () => {} 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
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
          <datalist id="fruits">
      <option>Apple</option>
      <option>Banana</option>
      <option>Orange</option>
      <option>Pineapple</option>
      <option>Kiwi</option>
    </datalist>
        </label>
      </div>
    </div>
  );
};

export default Filter;
