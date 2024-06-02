import React from 'react';

const Export = ({ data }) => {
  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/stats/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const text = await response.text();
      const blob = new Blob([text], { type: format === 'xml' ? 'application/xml' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div>
      <button onClick={() => handleExport('json')}>Export as JSON</button>
      <button onClick={() => handleExport('xml')}>Export as XML</button>
    </div>
  );
};

export default Export;
