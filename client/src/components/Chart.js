import React, { useState } from 'react';
import "./Chart.css";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Chart = ({ prePandemicData, duringPandemicData }) => {
  const [selectedFields, setSelectedFields] = useState({
    cases: true,
    deaths: true,
    recovered: false,
    active: false,
    fatalityRate: true, // Add fatalityRate to the selected fields
    gdpPerCapita: true,
  });

  const handleFieldChange = (field) => {
    setSelectedFields(prevState => ({ ...prevState, [field]: !prevState[field] }));
  };

  const renderLines = (data) => {
    return Object.keys(selectedFields).map(field => {
      if (selectedFields[field]) {
        let color;
        switch (field) {
          case 'cases':
            color = "#8884d8";
            break;
          case 'deaths':
            color = "#ff0000";
            break;
          case 'recovered':
            color = "#00ff00";
            break;
          case 'active':
            color = "#0000ff";
            break;
          case 'fatalityRate':
            color = "#ff00ff";
            break;
          case 'gdpPerCapita':
            color = "#82ca9d";
            break;
          default:
            color = "#000000";
            break;
        }
        return <Line key={field} type="monotone" dataKey={field} stroke={color} name={field.charAt(0).toUpperCase() + field.slice(1)} />;
      }
      return null;
    });
  };

  return (
    <div>
      <h2>Chart</h2>
      <div>
        {Object.keys(selectedFields).map(field => (
          <label key={field}>
            <input
              type="checkbox"
              checked={selectedFields[field]}
              onChange={() => handleFieldChange(field)}
            />
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
        ))}
      </div>

      <h3>Pre-Pandemic Data</h3>
      <ResponsiveContainer width="80%" height={300}>
        <LineChart data={prePandemicData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {renderLines(prePandemicData)}
        </LineChart>
      </ResponsiveContainer>

      <h3>During Pandemic Data</h3>
      <ResponsiveContainer width="80%" height={300}>
        <LineChart data={duringPandemicData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {renderLines(duringPandemicData)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
