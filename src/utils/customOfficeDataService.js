import * as XLSX from 'xlsx';

// Load custom office data from Excel file
export const loadCustomOfficeData = async () => {
  try {
    console.log('Loading custom office data...');
    const basePath = process.env.PUBLIC_URL || '';
    const response = await fetch(`${basePath}/data/customoffice_trade_allyr.xlsx`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    console.log('Response status:', response.status, response.statusText);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty file received');
    }
    
    console.log('Parsing Excel file...');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    console.log('Available sheet names:', workbook.SheetNames);
    console.log('Using sheet:', sheetName);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Custom Office Data loaded:', jsonData.length, 'records');
    console.log('Sample row:', jsonData[0]);
    
    return jsonData;
  } catch (error) {
    console.error('Error loading custom office data:', error);
    console.error('Error details:', error.message);
    throw new Error(`Failed to load custom office data from Excel files: ${error.message}`);
  }
};

// Get available years from the data (ascending order for charts)
export const getAvailableYears = (data) => {
  if (!data || data.length === 0) return [];
  
  const sampleRow = data[0];
  const years = Object.keys(sampleRow)
    .filter(key => key.includes('_import') || key.includes('_export'))
    .map(key => key.split('_')[0])
    .filter((year, index, arr) => arr.indexOf(year) === index)
    .sort((a, b) => a.localeCompare(b)); // Sort in ascending order (oldest to newest)
  
  return years;
};

// Get years for dropdown selection (newest first for user convenience)
export const getAvailableYearsForDropdown = (data) => {
  if (!data || data.length === 0) return [];
  
  const sampleRow = data[0];
  const years = Object.keys(sampleRow)
    .filter(key => key.includes('_import') || key.includes('_export'))
    .map(key => key.split('_')[0])
    .filter((year, index, arr) => arr.indexOf(year) === index)
    .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
  
  return years;
};

// Select data for a specific year
export const selectCustomOfficeYearData = (data, selectedYear) => {
  if (!data || data.length === 0) return [];
  
  return data.map(row => {
    // Excel data is in thousands of NPR, multiply by 1000 to get actual NPR
    const imports = (parseFloat(row[`${selectedYear}_import`]) || 0) * 1000;
    const exports = (parseFloat(row[`${selectedYear}_export`]) || 0) * 1000;
    
    return {
      office: row.Custom_offices || row.custom_offices || row.Office || row.office,
      imports: imports,
      exports: exports,
      tradeBalance: exports - imports,
      totalTrade: imports + exports
    };
  }).filter(item => item.office); // Filter out rows without office names
};

// Get top N custom offices by specified metric
export const getTopCustomOffices = (data, metric = 'imports', count = 10) => {
  const sortedData = [...data].sort((a, b) => {
    switch (metric.toLowerCase()) {
      case 'import':
      case 'imports':
        return b.imports - a.imports;
      case 'export':
      case 'exports':
        return b.exports - a.exports;
      case 'trade balance':
        return b.tradeBalance - a.tradeBalance;
      case 'total trade':
        return b.totalTrade - a.totalTrade;
      default:
        return b.imports - a.imports;
    }
  });
  
  return sortedData.slice(0, count);
};

// Get trend data for a specific custom office across all years
export const getCustomOfficeTrendData = (allData, officeName) => {
  if (!allData || allData.length === 0) return null;
  
  const officeRow = allData.find(row => 
    (row.Custom_offices || row.custom_offices || row.Office || row.office) === officeName
  );
  if (!officeRow) return null;

  // Get years in chronological order (oldest to newest) for trend charts
  const years = getAvailableYears(allData);
  const trendData = {
    years: years, // Already sorted in ascending order (oldest to newest)
    imports: [],
    exports: [],
    tradeBalance: [],
    totalTrade: []
  };
  
  years.forEach(year => {
    // Excel data is in thousands of NPR, multiply by 1000 to get actual NPR (like Python version)
    const importValue = (parseFloat(officeRow[`${year}_import`]) || 0) * 1000;
    const exportValue = (parseFloat(officeRow[`${year}_export`]) || 0) * 1000;
    
    trendData.imports.push(importValue);
    trendData.exports.push(exportValue);
    trendData.tradeBalance.push(exportValue - importValue);
    trendData.totalTrade.push(importValue + exportValue);
  });
  
  return trendData;
};

// Format large numbers with appropriate suffixes
export const formatValue = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000000) {
    return `${sign}${(absValue / 1000000000).toFixed(3)}B`;
  } else if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(3)}M`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(3)}K`;
  } else {
    return `${sign}${absValue.toFixed(3)}`;
  }
};

// Prepare chart data for visualization
export const prepareChartData = (topOffices, metric, chartType = 'bar') => {
  if (!topOffices || topOffices.length === 0) return null;
  
  const labels = topOffices.map(item => {
    let officeName = item.office;
    
    // Truncate long office names for better display
    if (officeName.length > 25) {
      officeName = officeName.substring(0, 25) + '...';
    }
    
    return officeName;
  });

  let data, color, borderColor;
  
  switch (metric.toLowerCase()) {
    case 'import':
    case 'imports':
      data = topOffices.map(item => item.imports);
      color = '#2ECC71';
      borderColor = '#27AE60';
      break;
    case 'export':
    case 'exports':
      data = topOffices.map(item => item.exports);
      color = '#3498DB';
      borderColor = '#2980B9';
      break;
    case 'trade balance':
      data = topOffices.map(item => item.tradeBalance);
      color = '#E74C3C';
      borderColor = '#C0392B';
      break;
    case 'total trade':
      data = topOffices.map(item => item.totalTrade);
      color = '#9B59B6';
      borderColor = '#8E44AD';
      break;
    default:
      data = topOffices.map(item => item.imports);
      color = '#2ECC71';
      borderColor = '#27AE60';
  }

  return {
    labels,
    datasets: [{
      label: metric,
      data,
      backgroundColor: color,
      borderColor: borderColor,
      borderWidth: 2
    }]
  };
};

// Prepare trend chart data for line charts
export const prepareTrendChartData = (trendData) => {
  if (!trendData) return null;
  
  return {
    labels: trendData.years,
    datasets: [
      {
        label: 'Imports',
        data: trendData.imports,
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Exports',
        data: trendData.exports,
        borderColor: '#3498DB',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Trade Balance',
        data: trendData.tradeBalance,
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Total Trade',
        data: trendData.totalTrade,
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };
};

// Prepare trend bar chart data
export const prepareTrendBarChartData = (trendData) => {
  if (!trendData) return null;
  
  return {
    labels: trendData.years,
    datasets: [
      {
        label: 'Imports',
        data: trendData.imports,
        backgroundColor: '#2ECC71',
        borderColor: '#2ECC71',
        borderWidth: 1
      },
      {
        label: 'Exports',
        data: trendData.exports,
        backgroundColor: '#3498DB',
        borderColor: '#3498DB',
        borderWidth: 1
      },
      {
        label: 'Trade Balance',
        data: trendData.tradeBalance,
        backgroundColor: '#E74C3C',
        borderColor: '#E74C3C',
        borderWidth: 1
      },
      {
        label: 'Total Trade',
        data: trendData.totalTrade,
        backgroundColor: '#9B59B6',
        borderColor: '#9B59B6',
        borderWidth: 1
      }
    ]
  };
};

const customOfficeDataService = {
  loadCustomOfficeData,
  getAvailableYears,
  getAvailableYearsForDropdown,
  selectCustomOfficeYearData,
  getTopCustomOffices,
  getCustomOfficeTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData
};

export default customOfficeDataService;
