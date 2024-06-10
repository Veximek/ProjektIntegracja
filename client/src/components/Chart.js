import React from 'react';
import "./Chart.css";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Chart = ({ prePandemicData, duringPandemicData}) => {

  // Data formatting for GDP (adjust to your actual data)
  const formattedPrePandemicData = prePandemicData;
  const formattedDuringPandemicData = duringPandemicData;
  
  return (
    <div>
      <h2>Chart</h2>
      
      <h3>Pre-Pandemic Data</h3>
      <ResponsiveContainer width="80%" height={300}> 
        <LineChart data={formattedPrePandemicData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" /> 
          <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value}`} /> 
          <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value}`} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Cases" />
          <Line type="monotone" dataKey="gdpPerCapita" stroke="#82ca9d" name="GDP per person" yAxisId="right" />
        </LineChart>
      </ResponsiveContainer>

      <h3>During Pandemic Data</h3>
      <ResponsiveContainer width="80%" height={300}> 
        <LineChart data={formattedDuringPandemicData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value}`} /> 
          <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${value}`} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Cases" />
          <Line type="monotone" dataKey="gdpPerCapita" stroke="#82ca9d" name="GDP per person" yAxisId="right" />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default Chart;
