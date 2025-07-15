import * as XLSX from 'xlsx';

// Load country data from Excel file
export const loadCountryData = async () => {
  try {
    const response = await fetch('/data/impexp_countrydata.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Country data loaded:', data.slice(0, 3)); // Debug log
    return data;
  } catch (error) {
    console.error('Error loading country data:', error);
    throw error;
  }
};

// Get available years from data
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

// Select country year data
export const selectCountryYearData = (data, yearSelected) => {
  if (!data || data.length === 0) return [];
  
  const countryData = data.map(row => {
    const importValue = (parseFloat(row[`${yearSelected}_import`]) || 0) * 1000; // Convert to NPR
    const exportValue = (parseFloat(row[`${yearSelected}_export`]) || 0) * 1000; // Convert to NPR
    const tradeBalance = exportValue - importValue;
    const totalTrade = importValue + exportValue;
    
    return {
      country: row.Countries || row.countries || row.Country || row.country,
      imports: importValue,
      exports: exportValue,
      tradeBalance: tradeBalance,
      totalTrade: totalTrade
    };
  }).filter(item => item.country); // Filter out any invalid entries
  
  return countryData;
};

// Get top N countries by specified metric
export const getTopCountries = (data, metric = 'imports', count = 10) => {
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

// Get trend data for a specific country across all years
export const getCountryTrendData = (allData, countryName) => {
  if (!allData || allData.length === 0) return null;
  
  const countryRow = allData.find(row => 
    (row.Countries || row.countries || row.Country || row.country) === countryName
  );
  if (!countryRow) return null;

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
    const importValue = (parseFloat(countryRow[`${year}_import`]) || 0) * 1000;
    const exportValue = (parseFloat(countryRow[`${year}_export`]) || 0) * 1000;
    
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
export const prepareChartData = (topCountries, metric, chartType = 'bar') => {
  if (!topCountries || topCountries.length === 0) return null;
  
  const labels = topCountries.map(item => {
    let countryName = item.country;
    
    // Handle specific long country names
    if (countryName.toLowerCase().includes("united states")) {
      countryName = "USA";
    } else if (countryName.toLowerCase().includes("united kingdom")) {
      countryName = "UK";
    } else if (countryName.toLowerCase().includes("united arab emirates")) {
      countryName = "UAE";
    } else if (countryName.toLowerCase().includes("saudi arabia")) {
      countryName = "Saudi Arabia";
    }
    
    return countryName;
  });
  
  let values, backgroundColor, borderColor;
  
  switch (metric.toLowerCase()) {
    case 'import':
    case 'imports':
      values = topCountries.map(item => item.imports);
      backgroundColor = '#2ECC71';
      borderColor = '#27AE60';
      break;
    case 'export':
    case 'exports':
      values = topCountries.map(item => item.exports);
      backgroundColor = '#3498DB';
      borderColor = '#2980B9';
      break;
    case 'trade balance':
      values = topCountries.map(item => item.tradeBalance);
      backgroundColor = '#E74C3C';
      borderColor = '#C0392B';
      break;
    case 'total trade':
      values = topCountries.map(item => item.totalTrade);
      backgroundColor = '#9B59B6';
      borderColor = '#8E44AD';
      break;
    default:
      values = topCountries.map(item => item.imports);
      backgroundColor = '#2ECC71';
      borderColor = '#27AE60';
  }
  
  return {
    labels: labels,
    datasets: [{
      label: metric,
      data: values,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      borderWidth: 1
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
        tension: 0.4,
        fill: false
      },
      {
        label: 'Exports',
        data: trendData.exports,
        borderColor: '#3498DB',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Trade Balance',
        data: trendData.tradeBalance,
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Total Trade',
        data: trendData.totalTrade,
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false
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

const countryDataService = {
  loadCountryData,
  getAvailableYears,
  getAvailableYearsForDropdown,
  selectCountryYearData,
  getTopCountries,
  getCountryTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData
};

export default countryDataService;
