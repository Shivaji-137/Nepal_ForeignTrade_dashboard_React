import * as XLSX from 'xlsx';

// Load product data from Excel file
export const loadProductData = async () => {
  try {
    const basePath = process.env.PUBLIC_URL || '';
    const response = await fetch(`${basePath}/data/impexp_Productdata.xlsx`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error('Error loading product data:', error);
    return [];
  }
};

// Get available years from the data
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

// Filter data by selected year and prepare for visualization
export const selectProductYearData = (data, yearSelected) => {
  if (!data || data.length === 0) return [];
  
  // Use the year format as-is from the Excel file (e.g., "2081/082")
  const importColumn = `${yearSelected}_import`;
  const exportColumn = `${yearSelected}_export`;
  
  console.log('selectProductYearData - yearSelected:', yearSelected);
  console.log('selectProductYearData - looking for columns:', importColumn, exportColumn);
  
  const result = data.map(row => {
    // Excel data is in thousands of NPR, multiply by 1000 to get actual NPR (like Python version)
    const importValue = (parseFloat(row[importColumn]) || 0) * 1000;
    const exportValue = (parseFloat(row[exportColumn]) || 0) * 1000;
    const tradeBalance = exportValue - importValue;
    
    return {
      product: row.Products || '',
      imports: importValue,
      exports: exportValue,
      tradeBalance: tradeBalance,
      totalTrade: importValue + exportValue
    };
  }).filter(item => item.product && (item.imports > 0 || item.exports > 0));
  
  console.log('selectProductYearData - result length:', result.length);
  console.log('selectProductYearData - first few items:', result.slice(0, 3));
  
  return result;
};

// Get top N products by specified metric
export const getTopProducts = (data, metric = 'imports', count = 10) => {
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

// Get trend data for a specific product across all years
export const getProductTrendData = (allData, productName) => {
  if (!allData || allData.length === 0) return null;
  
  const productRow = allData.find(row => row.Products === productName);
  if (!productRow) return null;

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
    // Use the year format as-is (e.g., "2081/082")
    // Excel data is in thousands of NPR, multiply by 1000 to get actual NPR (like Python version)
    const importValue = (parseFloat(productRow[`${year}_import`]) || 0) * 1000;
    const exportValue = (parseFloat(productRow[`${year}_export`]) || 0) * 1000;
    
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
export const prepareChartData = (topProducts, metric, chartType = 'bar') => {
  if (!topProducts || topProducts.length === 0) return null;
  
  const labels = topProducts.map(item => {
    let productName = item.product;
    
    // Handle specific long product names like in the Python version
    if (productName.toLowerCase().includes("electrical machinery and equipment and parts thereof")) {
      productName = "Electrical machinery; sound recorders and reproducers; television image, parts of such articles";
    } else if (productName.toLowerCase().includes("natural, cultured pearls; precious, semi-precious stones; precious metals, metals clad with precious metal")) {
      productName = "Natural, cultured pearls; precious, semi-precious stones; precious metals, imitation jewellery; coin";
    }
    
    // Truncate long product names based on screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxLength = isMobile ? 40 : 60; // Slightly longer for mobile to be more readable
    
    return productName.length > maxLength 
      ? productName.substring(0, maxLength) + '...' 
      : productName;
  });
  
  let data, color, label;
  
  switch (metric.toLowerCase()) {
    case 'import':
    case 'imports':
      data = topProducts.map(item => item.imports);
      color = '#2ECC71';
      label = 'Imports';
      break;
    case 'export':
    case 'exports':
      data = topProducts.map(item => item.exports);
      color = '#3498DB';
      label = 'Exports';
      break;
    case 'trade balance':
      data = topProducts.map(item => item.tradeBalance);
      color = '#9B59B6';
      label = 'Trade Balance';
      break;
    default:
      data = topProducts.map(item => item.imports);
      color = '#2ECC71';
      label = 'Imports';
  }
  
  return {
    labels,
    datasets: [{
      label,
      data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1
    }]
  };
};

// Prepare trend chart data
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
        tension: 0.1
      },
      {
        label: 'Exports',
        data: trendData.exports,
        borderColor: '#3498DB',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Trade Balance',
        data: trendData.tradeBalance,
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Total Trade',
        data: trendData.totalTrade,
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderWidth: 2,
        tension: 0.1
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

// Prepare treemap data for visualization
export const prepareTreemapData = (topProducts, metric) => {
  if (!topProducts || topProducts.length === 0) return null;
  
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(255, 99, 255, 0.8)',
    'rgba(99, 255, 132, 0.8)'
  ];
  
  const data = topProducts.map((item, index) => {
    let value;
    switch (metric.toLowerCase()) {
      case 'import':
      case 'imports':
        value = item.imports;
        break;
      case 'export':
      case 'exports':
        value = item.exports;
        break;
      case 'trade balance':
        value = item.tradeBalance;
        break;
      default:
        value = item.imports;
    }
    
    // Truncate product name for display
    const displayName = item.product.length > 15 ? 
      item.product.substring(0, 15) + '...' : item.product;
    
    return {
      // chartjs-chart-treemap expects these specific properties
      value: Math.abs(value), // treemap needs positive values
      label: displayName,
      productName: item.product,
      originalValue: value,
      metric: metric,
      backgroundColor: colors[index % colors.length],
      borderColor: 'rgba(255, 255, 255, 1)'
    };
  });

  return {
    datasets: [{
      label: metric,
      tree: data, // chartjs-chart-treemap expects 'tree' property
      key: 'value', // the property to use for sizing
      spacing: 0.5,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 1)',
      backgroundColor: function(ctx) {
        return ctx.raw.backgroundColor;
      },
      labels: {
        display: true,
        color: 'white',
        font: {
          size: 12,
          weight: 'bold'
        },
        formatter: function(ctx) {
          const data = ctx.raw;
          if (data) {
            return [data.label, formatValue(data.originalValue)];
          }
          return '';
        }
      }
    }]
  };
};

const productDataService = {
  loadProductData,
  getAvailableYears,
  getAvailableYearsForDropdown,
  selectProductYearData,
  getTopProducts,
  getProductTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData,
  prepareTreemapData
};

export default productDataService;
