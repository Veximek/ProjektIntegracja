import React from 'react';

const Export = ({ data }) => {
  const handleExport = () => {
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
  };

  return (
    <button onClick={handleExport}>Export Data</button>
  );
}