import * as XLSX from 'xlsx';

// Excel data loading functions
export const loadExcelData = async (filePath) => {
  try {
    console.log('Loading Excel data from:', filePath);
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty file received');
    }
    
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('Available sheets:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Excel data loaded:', jsonData.length, 'records');
    
    return jsonData;
  } catch (error) {
    console.error('Error loading Excel data from', filePath, ':', error);
    console.error('Error details:', error.message);
    return [];
  }
};

export const loadSummaryData = async () => {
  return await loadExcelData('/data/trade_2071_082.xlsx');
};

export const loadGrowthData = async () => {
  return await loadExcelData('/data/trad_Percechange2072_to_82.xlsx');
};

// Data processing functions matching Python logic
export const filterDataByYearRange = (data, startYear, endYear) => {
  return data.filter(row => {
    const year = row['Fiscal Year'];
    return year >= startYear && year <= endYear;
  });
};

export const formatValue = (value) => {
  // Handle null, undefined, or non-numeric values
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0.00';
  }
  
  if (numValue >= 1000000000) {
    return `${(numValue / 1000000000).toFixed(2)}B`;
  } else if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(2)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(2)}K`;
  } else {
    return numValue.toFixed(2);
  }
};

export const calculateKPICards = (summaryData, growthData) => {
  if (!summaryData.length || !growthData.length) return [];

  const currentSummary = summaryData[summaryData.length - 1];
  const currentGrowth = growthData[growthData.length - 1];
  const previousGrowth = growthData[growthData.length - 2] || {};

  const kpiData = {
    "Imports": {
      value: (currentSummary['Imports (Rs.in `000)'] || 0) * 1000,
      growth: currentGrowth['Imports (Rs.in `000)'] || 0,
      previousGrowth: previousGrowth['Imports (Rs.in `000)'] || 0
    },
    "Exports": {
      value: (currentSummary['Exports (Rs.in `000)'] || 0) * 1000,
      growth: currentGrowth['Exports (Rs.in `000)'] || 0,
      previousGrowth: previousGrowth['Exports (Rs.in `000)'] || 0
    },
    "Trade Deficit": {
      value: (currentSummary['Trade Deficit (Rs.in `000)'] || 0) * 1000,
      growth: currentGrowth['Trade Deficit (Rs.in `000)'] || 0,
      previousGrowth: previousGrowth['Trade Deficit (Rs.in `000)'] || 0
    },
    "Imp/Exp Ratio": {
      value: currentSummary['Imports/Exports Ratio (Rs.in `000)'] || 0,
      growth: currentGrowth['Imports/Exports Ratio (Rs.in `000)'] || 0,
      previousGrowth: previousGrowth['Imports/Exports Ratio (Rs.in `000)'] || 0
    }
  };

  return Object.entries(kpiData).map(([label, data]) => {
    // Safely convert growth to number
    const growth = typeof data.growth === 'number' ? data.growth : parseFloat(data.growth) || 0;
    const previousGrowth = typeof data.previousGrowth === 'number' ? data.previousGrowth : parseFloat(data.previousGrowth) || 0;
    const isPositive = growth > previousGrowth;
    
    return {
      label,
      value: formatValue(data.value),
      delta: `${growth.toFixed(2)}%${isPositive ? '▲' : '▼'}`,
      deltaColor: isPositive ? 'green' : 'red'
    };
  });
};

// Convert fiscal years for display
export const convertFiscalYears = (data, format = 'BS') => {
  if (format === 'AD') {
    const fiscalYearAD = [
      "2014/15", "2015/16", "2016/17", "2017/18", "2018/19", 
      "2019/20", "2020/21", "2021/22", "2022/23", "2023/24", "2024/25"
    ];
    const rangeYr = fiscalYearAD.length - data.length;
    return fiscalYearAD.slice(rangeYr);
  }
  return data.map(row => row['Fiscal Year']);
};

// Prepare chart data for display
export const prepareChartData = (summaryData, growthData, yearFormat = 'BS') => {
  const fiscalYears = convertFiscalYears(summaryData, yearFormat);
  
  const summaryColumns = [
    'Imports (Rs.in `000)',
    'Exports (Rs.in `000)', 
    'Trade Deficit (Rs.in `000)',
    'Total Foreign Trade (Rs.in `000)'
  ];
  
  const growthColumns = [
    'Imports (Rs.in `000)',
    'Exports (Rs.in `000)', 
    'Trade Deficit (Rs.in `000)',
    'Total Foreign Trade (Rs.in `000)',
    'Imports/Exports Ratio (Rs.in `000)'
  ];

  const summaryDatasets = summaryColumns.map((column, index) => ({
    label: ['Imports', 'Exports', 'Trade Deficit', 'Total Trade'][index],
    data: summaryData.map(row => (row[column] || 0) * 1000),
    backgroundColor: ['#2ECC71', '#3498DB', '#E74C3C', '#9B59B6'][index],
    type: 'bar'
  }));

  const growthDatasets = growthColumns.map((column, index) => ({
    label: ['Imports Growth', 'Exports Growth', 'Trade Deficit Growth', 'Total Trade Growth', 'Imp/Exp Ratio Growth'][index],
    data: growthData.map(row => row[column] || 0),
    borderColor: ['#2ECC71', '#3498DB', '#E74C3C', '#9B59B6', '#F8A4D5'][index],
    backgroundColor: ['#2ECC71', '#3498DB', '#E74C3C', '#9B59B6', '#F8A4D5'][index],
    type: 'line',
    yAxisID: 'y1'
  }));

  return {
    labels: fiscalYears,
    datasets: [...summaryDatasets, ...growthDatasets]
  };
};

// Get available year range for slider
export const getYearRange = (data) => {
  if (!data.length) return { min: '2071/72', max: '2081/82' };
  
  const years = data.map(row => row['Fiscal Year']).sort();
  return {
    min: years[0],
    max: years[years.length - 1],
    options: years
  };
};
