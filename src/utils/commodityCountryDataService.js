import * as XLSX from 'xlsx';

// Cache for loaded data to avoid re-loading the same Excel files
const dataCache = new Map();

// Load commodity-country data from Excel files (imports and exports separately)
export const loadCommodityCountryData = async (selectedYear) => {
  try {
    // Check cache first
    if (dataCache.has(selectedYear)) {
      console.log(`Using cached commodity-country data for year ${selectedYear}`);
      return dataCache.get(selectedYear);
    }

    console.log(`Loading commodity-country data for year ${selectedYear}...`);
    
    // Convert year format from 2081/082 to 2081-082
    const year = selectedYear.replace("/", "-");
    console.log(`Converted year format to: ${year}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log(`Fetching file: /data/${year}.xlsx`);
    const response = await fetch(`/data/${year}.xlsx`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    // Check if response is actually Excel file
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty file received');
    }
    
    console.log('File loaded successfully, parsing with XLSX...');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Read imports sheet
    const impSheetName = "4_Imports_By_Commodity_Partner";
    const impWorksheet = workbook.Sheets[impSheetName];
    if (!impWorksheet) {
      console.warn(`Sheet "${impSheetName}" not found in ${year}.xlsx`);
    }
    const impData = impWorksheet ? XLSX.utils.sheet_to_json(impWorksheet, { header: 1 }) : [];
    
    // Read exports sheet  
    const expSheetName = "6_Exports_By_Commodity_Partner";
    const expWorksheet = workbook.Sheets[expSheetName];
    if (!expWorksheet) {
      console.warn(`Sheet "${expSheetName}" not found in ${year}.xlsx`);
    }
    const expData = expWorksheet ? XLSX.utils.sheet_to_json(expWorksheet, { header: 1 }) : [];
    
    // Skip first 2 rows (header=2 in pandas means skip first 2 rows)
    const processedImpData = impData.slice(2).map(row => {
      if (!row[0] || !row[1] || !row[2]) return null; // Skip empty rows or rows without country
      return {
        HSCode: row[0],
        Description: row[1],
        PartnerCountries: row[2],
        Unit: row[3],
        Quantity: parseFloat(row[4]) || 0,
        Imports_Value: parseFloat(row[5]) || 0, // Already in thousands NPR
        Imports_Revenue: parseFloat(row[6]) || 0, // Already in thousands NPR
        type: 'import'
      };
    }).filter(Boolean);
    
    const processedExpData = expData.slice(2).map(row => {
      if (!row[0] || !row[1] || !row[2]) return null; // Skip empty rows or rows without country
      return {
        HSCode: row[0],
        Description: row[1],
        PartnerCountries: row[2],
        Unit: row[3],
        Quantity: parseFloat(row[4]) || 0,
        Exports_Value: parseFloat(row[5]) || 0, // Already in thousands NPR
        type: 'export'
      };
    }).filter(Boolean);

    const result = { imports: processedImpData, exports: processedExpData };
    
    // Cache the result
    dataCache.set(selectedYear, result);
    
    console.log('Loaded commodity-country data - imports:', processedImpData.length, 'exports:', processedExpData.length);
    return result;
  } catch (error) {
    console.error('Error loading commodity-country data:', error);
    throw error;
  }
};

// Process and combine commodity-country data
export const processCommodityCountryData = (data) => {
  if (!data || !data.imports || !data.exports) {
    return { combinedData: [], commodities: [], countries: [] };
  }

  // Create a map to combine import and export data
  const combinedMap = new Map();
  
  // Process imports
  data.imports.forEach(item => {
    const key = `${item.HSCode}-${item.Description}-${item.PartnerCountries}`;
    combinedMap.set(key, {
      hsCode: item.HSCode,
      commodity: item.Description,
      country: item.PartnerCountries,
      unit: item.Unit,
      imports: item.Imports_Value * 1000, // Convert to actual NPR
      exports: 0,
      importQuantity: item.Quantity,
      exportQuantity: 0,
      importRevenue: item.Imports_Revenue * 1000 // Convert to actual NPR
    });
  });

  // Process exports and merge with imports
  data.exports.forEach(item => {
    const key = `${item.HSCode}-${item.Description}-${item.PartnerCountries}`;
    if (combinedMap.has(key)) {
      const existing = combinedMap.get(key);
      existing.exports = item.Exports_Value * 1000; // Convert to actual NPR
      existing.exportQuantity = item.Quantity;
    } else {
      combinedMap.set(key, {
        hsCode: item.HSCode,
        commodity: item.Description,
        country: item.PartnerCountries,
        unit: item.Unit,
        imports: 0,
        exports: item.Exports_Value * 1000, // Convert to actual NPR
        importQuantity: 0,
        exportQuantity: item.Quantity,
        importRevenue: 0
      });
    }
  });

  // Convert map to array and add calculated fields
  const combinedData = Array.from(combinedMap.values()).map(item => ({
    ...item,
    tradeBalance: item.exports - item.imports,
    totalTrade: item.imports + item.exports,
    // Calculate some basic metrics (simplified for now)
    competitiveness: Math.min(100, Math.max(0, (item.exports / (item.imports + item.exports || 1)) * 100)),
    marketShare: Math.random() * 20, // Placeholder - would need more complex calculation
    growth: (Math.random() - 0.5) * 30 // Placeholder - would need historical data
  }));

  // Get unique commodities and countries
  const commodities = [...new Set(combinedData.map(item => item.commodity))].sort();
  const countries = [...new Set(combinedData.map(item => item.country))].sort();

  return {
    combinedData,
    commodities,
    countries
  };
};

// Get available years from fixed list
export const getAvailableYearsForCommodityCountry = () => {
  return ['2081/082', '2080/081', '2079/080', '2078/079'];
};

// Format values for display
export const formatValue = (value) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.round(value).toString();
};

// Clear cache (useful for memory management)
export const clearCommodityCountryDataCache = () => {
  dataCache.clear();
  console.log('Commodity-country data cache cleared');
};

// Get cache information
export const getCommodityCountryDataCacheInfo = () => {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys())
  };
};
