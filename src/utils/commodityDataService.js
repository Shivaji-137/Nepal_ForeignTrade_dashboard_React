import * as XLSX from 'xlsx';

// Cache for loaded data to avoid re-loading the same Excel files
const dataCache = new Map();

// Load commodity data from Excel files (imports and exports separately)
export const loadCommodityData = async (selectedYear) => {
  try {
    // Check cache first
    if (dataCache.has(selectedYear)) {
      console.log(`Using cached data for year ${selectedYear}`);
      return dataCache.get(selectedYear);
    }

    console.log(`Loading data for year ${selectedYear}...`);
    
    // Convert year format from 2081/082 to 2081-082
    const year = selectedYear.replace("/", "-");
    
    // Add timeout to the fetch request to fail fast if file is not available
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const basePath = process.env.PUBLIC_URL || '';
    const response = await fetch(`${basePath}/data/${year}.xlsx`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to load file for year ${year}: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Read imports sheet
    const impSheetName = "5_Imports_By_Commodity";
    const impWorksheet = workbook.Sheets[impSheetName];
    if (!impWorksheet) {
      console.warn(`Sheet "${impSheetName}" not found in ${year}.xlsx`);
    }
    const impData = impWorksheet ? XLSX.utils.sheet_to_json(impWorksheet, { header: 1 }) : [];
    
    // Read exports sheet  
    const expSheetName = "7_Exports_By_Commodity";
    const expWorksheet = workbook.Sheets[expSheetName];
    if (!expWorksheet) {
      console.warn(`Sheet "${expSheetName}" not found in ${year}.xlsx`);
    }
    const expData = expWorksheet ? XLSX.utils.sheet_to_json(expWorksheet, { header: 1 }) : [];
    
    // Skip first 2 rows (header=2 in pandas means skip first 2 rows)
    const processedImpData = impData.slice(2).map(row => {
      if (!row[0] || !row[1]) return null; // Skip empty rows
      return {
        HSCode: row[0],
        Description: row[1],
        Unit: row[2],
        Quantity: parseFloat(row[3]) || 0,
        Imports_Value: parseFloat(row[4]) || 0, // Already in thousands NPR
        Imports_Revenue: parseFloat(row[5]) || 0, // Already in thousands NPR
        type: 'import'
      };
    }).filter(Boolean);
    
    const processedExpData = expData.slice(2).map(row => {
      if (!row[0] || !row[1]) return null; // Skip empty rows
      return {
        HSCode: row[0],
        Description: row[1],
        Unit: row[2],
        Quantity: parseFloat(row[3]) || 0,
        Exports_Value: parseFloat(row[4]) || 0, // Already in thousands NPR
        type: 'export'
      };
    }).filter(Boolean);

    const result = { imports: processedImpData, exports: processedExpData };
    
    // Cache the result
    dataCache.set(selectedYear, result);
    
    console.log('Loaded commodity data - imports:', processedImpData.length, 'exports:', processedExpData.length);
    return result;
  } catch (error) {
    console.error('Error loading commodity data:', error);
    throw error;
  }
};

// Get available years from fixed list
export const getAvailableYearsForDropdown = () => {
  return ['2081/082', '2080/081', '2079/080', '2078/079', '2077/078', '2076/077', '2075/076', '2074/075'];
};

// Clear cache (useful for memory management)
export const clearDataCache = () => {
  dataCache.clear();
  console.log('Commodity data cache cleared');
};

// Get cache size for debugging
export const getCacheInfo = () => {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys())
  };
};

// Process commodity data for a specific year
export const processCommodityData = (commodityData) => {
  if (!commodityData || (!commodityData.imports && !commodityData.exports)) return [];
  
  // Combine imports and exports data
  const combinedData = [];
  
  // Create a map to combine import and export data by HSCode
  const dataMap = new Map();
  
  // Add import data
  if (commodityData.imports) {
    commodityData.imports.forEach(item => {
      dataMap.set(item.HSCode, {
        hsCode: item.HSCode,
        commodity: item.Description,
        unit: item.Unit,
        imports: (item.Imports_Value || 0) * 1000, // Convert thousands to actual NPR
        exports: 0,
        importQuantity: item.Quantity || 0,
        exportQuantity: 0,
        importRevenue: (item.Imports_Revenue || 0) * 1000
      });
    });
  }
  
  // Add export data
  if (commodityData.exports) {
    commodityData.exports.forEach(item => {
      if (dataMap.has(item.HSCode)) {
        const existing = dataMap.get(item.HSCode);
        existing.exports = (item.Exports_Value || 0) * 1000; // Convert thousands to actual NPR
        existing.exportQuantity = item.Quantity || 0;
      } else {
        dataMap.set(item.HSCode, {
          hsCode: item.HSCode,
          commodity: item.Description,
          unit: item.Unit,
          imports: 0,
          exports: (item.Exports_Value || 0) * 1000, // Convert thousands to actual NPR
          importQuantity: 0,
          exportQuantity: item.Quantity || 0,
          importRevenue: 0
        });
      }
    });
  }
  
  // Convert map to array and calculate additional metrics
  dataMap.forEach(item => {
    item.tradeBalance = item.exports - item.imports;
    item.totalTrade = item.imports + item.exports;
    combinedData.push(item);
  });
  
  // Filter out zero trade items
  return combinedData.filter(item => item.imports > 0 || item.exports > 0);
};

// Get top N commodities by specified metric
export const getTopCommodities = (data, metric = 'imports', count = 10) => {
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

// Get trend data for a specific commodity across all years (optimized with caching)
export const getCommodityTrendData = async (commodityName, maxYears = 4) => {
  const years = getAvailableYearsForDropdown().slice(0, maxYears); // Limit years to reduce loading time
  const trendData = {
    years: years,
    imports: [],
    exports: [],
    tradeBalance: [],
    totalTrade: []
  };

  console.log(`Loading trend data for commodity: ${commodityName} across ${years.length} years`);
  
  // Load data for each year to build trend
  const promises = years.map(async (year) => {
    try {
      const yearData = await loadCommodityData(year);
      const processedData = processCommodityData(yearData);
      
      // Find the specific commodity (case-insensitive partial match)
      const commodityItem = processedData.find(item => 
        item.commodity && item.commodity.toLowerCase().includes(commodityName.toLowerCase())
      );
      
      return commodityItem ? {
        imports: commodityItem.imports,
        exports: commodityItem.exports,
        tradeBalance: commodityItem.tradeBalance,
        totalTrade: commodityItem.totalTrade
      } : {
        imports: 0,
        exports: 0,
        tradeBalance: 0,
        totalTrade: 0
      };
    } catch (error) {
      console.warn(`Failed to load data for year ${year}:`, error);
      return {
        imports: 0,
        exports: 0,
        tradeBalance: 0,
        totalTrade: 0
      };
    }
  });

  const results = await Promise.all(promises);
  
  results.forEach(result => {
    trendData.imports.push(result.imports);
    trendData.exports.push(result.exports);
    trendData.tradeBalance.push(result.tradeBalance);
    trendData.totalTrade.push(result.totalTrade);
  });

  console.log(`Trend data loaded for ${commodityName}:`, trendData);
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
export const prepareChartData = (topCommodities, metric, chartType = 'bar') => {
  if (!topCommodities || topCommodities.length === 0) return null;
  
  const labels = topCommodities.map(item => {
    let commodityName = item.commodity;
    
    // Truncate long commodity names for better display
    if (commodityName.length > 40) {
      commodityName = commodityName.substring(0, 40) + '...';
    }
    
    return commodityName;
  });
  
  const values = topCommodities.map(item => {
    switch (metric.toLowerCase()) {
      case 'import':
      case 'imports':
        return item.imports;
      case 'export':
      case 'exports':
        return item.exports;
      case 'trade balance':
        return item.tradeBalance;
      case 'total trade':
        return item.totalTrade;
      default:
        return item.imports;
    }
  });
  
  let backgroundColor, borderColor;
  switch (metric.toLowerCase()) {
    case 'export':
    case 'exports':
      backgroundColor = '#3498DB';
      borderColor = '#2980B9';
      break;
    case 'trade balance':
      backgroundColor = values.map(val => val >= 0 ? '#2ECC71' : '#E74C3C');
      borderColor = values.map(val => val >= 0 ? '#27AE60' : '#C0392B');
      break;
    case 'total trade':
      backgroundColor = '#9B59B6';
      borderColor = '#8E44AD';
      break;
    default: // imports
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
      borderWidth: 2
    }]
  };
};

// Prepare trend line chart data
export const prepareTrendChartData = (trendData) => {
  if (!trendData) return null;
  
  console.log('prepareTrendChartData input:', trendData);
  
  // Add mobile-specific debugging
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) {
    console.log('Mobile device detected - Chart data analysis:', {
      screenWidth: window.innerWidth,
      years: trendData.years,
      importsData: trendData.imports?.map((val, idx) => ({ year: trendData.years[idx], value: val })),
      exportsData: trendData.exports?.map((val, idx) => ({ year: trendData.years[idx], value: val })),
      minImportValue: Math.min(...(trendData.imports || [])),
      maxImportValue: Math.max(...(trendData.imports || [])),
      minExportValue: Math.min(...(trendData.exports || [])),
      maxExportValue: Math.max(...(trendData.exports || []))
    });
  }
  
  const chartData = {
    labels: trendData.years,
    datasets: [
      {
        label: 'Imports',
        data: trendData.imports,
        borderColor: '#2ECC71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#2ECC71',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Exports',
        data: trendData.exports,
        borderColor: '#3498DB',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3498DB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Trade Balance',
        data: trendData.tradeBalance,
        borderColor: '#E74C3C',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#E74C3C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Total Trade',
        data: trendData.totalTrade,
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#9B59B6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };
  
  console.log('prepareTrendChartData output:', chartData);
  return chartData;
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

const commodityDataService = {
  loadCommodityData,
  getAvailableYearsForDropdown,
  processCommodityData,
  getTopCommodities,
  getCommodityTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData,
  clearDataCache,
  getCacheInfo
};

export default commodityDataService;
