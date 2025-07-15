// Data service utilities for loading and processing trade data
// This simulates data loading - replace with actual API calls or file loading

export const loadTradeData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sample trade data structure
  // In production, this would come from your backend API or processed Excel files
  const tradeData = {
    summary: {
      fiscalYears: ['2071/72', '2072/73', '2073/74', '2074/75', '2075/76', '2076/77', '2077/78', '2078/79', '2079/80', '2080/81', '2081/82'],
      totalImports: [551474.4, 768481.5, 819656.8, 1187264.5, 1301438.5, 1366504.6, 1309408.1, 1390610.2, 1552002.9, 1568695.6, 1365952.0],
      totalExports: [91723.1, 109517.4, 83954.9, 78395.4, 73843.1, 75707.2, 81684.0, 84156.9, 91699.0, 183076.4, 201000.0],
      tradeBalance: [-459751.3, -658964.1, -735701.9, -1108869.1, -1227595.4, -1290797.4, -1227724.1, -1306453.3, -1460303.9, -1385619.2, -1164952.0]
    },
    
    products: {
      categories: [
        'Electrical machinery and equipment',
        'Mineral fuels, oils, distillation products', 
        'Vehicles other than railway',
        'Iron and steel',
        'Pearls, precious stones, metals',
        'Cereals',
        'Pharmaceutical products',
        'Organic chemicals',
        'Plastics and articles thereof',
        'Cotton and cotton articles'
      ],
      imports: [380000, 320000, 280000, 220000, 180000, 150000, 140000, 120000, 100000, 95000],
      exports: [15000, 25000, 8000, 12000, 85000, 45000, 5000, 18000, 22000, 120000]
    },
    
    countries: {
      partners: [
        'India', 'China', 'United States', 'Saudi Arabia', 'United Arab Emirates',
        'Singapore', 'Japan', 'Germany', 'Thailand', 'Malaysia',
        'South Korea', 'France', 'United Kingdom', 'Turkey', 'Bangladesh'
      ],
      imports: [850000, 450000, 120000, 180000, 95000, 75000, 85000, 65000, 55000, 45000, 40000, 35000, 30000, 25000, 20000],
      exports: [35000, 15000, 85000, 5000, 25000, 45000, 8000, 12000, 18000, 22000, 15000, 8000, 6000, 12000, 45000],
      regions: ['South Asia', 'East Asia', 'North America', 'Middle East', 'Middle East', 'Southeast Asia', 'East Asia', 'Europe', 'Southeast Asia', 'Southeast Asia', 'East Asia', 'Europe', 'Europe', 'West Asia', 'South Asia']
    },
    
    commodities: {
      chapters: [
        'Live animals; animal products',
        'Vegetable products', 
        'Animal or vegetable fats and oils',
        'Prepared foodstuffs; beverages, spirits and vinegar; tobacco',
        'Mineral products',
        'Products of the chemical or allied industries',
        'Plastics and articles thereof; rubber and articles thereof',
        'Raw hides and skins, leather, furskins',
        'Wood and articles of wood; wood charcoal',
        'Pulp of wood; paper and paperboard',
        'Textiles and textile articles',
        'Footwear, headgear, umbrellas, sun umbrellas',
        'Articles of stone, plaster, cement, asbestos, mica',
        'Natural or cultured pearls, precious stones, metals',
        'Base metals and articles of base metal',
        'Machinery and mechanical appliances; electrical equipment',
        'Vehicles, aircraft, vessels and associated transport equipment',
        'Optical, photographic, cinematographic, measuring instruments',
        'Arms and ammunition; parts and accessories thereof',
        'Miscellaneous manufactured articles',
        'Works of art, collectors\' pieces and antiques'
      ],
      imports: [45000, 125000, 35000, 180000, 320000, 95000, 150000, 25000, 40000, 55000, 85000, 30000, 60000, 180000, 220000, 450000, 280000, 75000, 5000, 65000, 2000],
      exports: [85000, 180000, 15000, 45000, 25000, 18000, 22000, 120000, 95000, 15000, 250000, 35000, 12000, 85000, 12000, 15000, 8000, 5000, 1000, 25000, 500]
    },
    
    customOffices: {
      offices: [
        'Tribhuvan International Airport (TIA)',
        'Birgunj Customs Office',
        'Biratnagar Customs Office', 
        'Bhairahawa Customs Office',
        'Tatopani Customs Office',
        'Rasuwagadhi Customs Office',
        'Krishnanagar Customs Office',
        'Nepalgunj Customs Office',
        'Dhangadhi Customs Office',
        'Kakarvitta Customs Office',
        'Sirsiya Dry Port',
        'Kodari Customs Office',
        'Belahiya Customs Office',
        'Rupaidiha Customs Office',
        'Jamunaha Customs Office'
      ],
      imports: [380000, 420000, 180000, 160000, 85000, 75000, 95000, 120000, 85000, 140000, 220000, 45000, 65000, 55000, 40000],
      exports: [45000, 85000, 120000, 95000, 35000, 28000, 15000, 25000, 18000, 95000, 35000, 12000, 22000, 18000, 12000],
      regions: ['Central', 'Central', 'Eastern', 'Western', 'Central', 'Central', 'Central', 'Mid-Western', 'Far-Western', 'Eastern', 'Central', 'Central', 'Western', 'Western', 'Western']
    }
  };
  
  return tradeData;
};

// Utility functions for data processing
export const formatCurrency = (value, currency = 'NPR') => {
  const absValue = Math.abs(value);
  let formatted;
  
  if (absValue >= 1000000) {
    formatted = `${(value / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    formatted = `${(value / 1000).toFixed(1)}K`;
  } else {
    formatted = value.toString();
  }
  
  return `${formatted} ${currency}`;
};

export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const calculateTradeBalance = (exports, imports) => {
  return exports - imports;
};

export const calculateCoverageRatio = (exports, imports) => {
  if (imports === 0) return 0;
  return (exports / imports) * 100;
};

// Data aggregation utilities
export const aggregateByYear = (data, metric) => {
  return data.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) {
      acc[year] = 0;
    }
    acc[year] += item[metric];
    return acc;
  }, {});
};

export const getTopNItems = (data, metric, n = 10) => {
  return [...data]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, n);
};

export const filterByDateRange = (data, startYear, endYear) => {
  return data.filter(item => {
    const year = parseInt(item.year.split('/')[0]);
    const start = parseInt(startYear.split('/')[0]);
    const end = parseInt(endYear.split('/')[0]);
    return year >= start && year <= end;
  });
};

// Color schemes for charts
export const colorSchemes = {
  primary: ['#2ECC71', '#3498DB', '#9B59B6', '#F39C12', '#E74C3C'],
  government: ['#1f4e79', '#2980b9', '#3498db', '#5dade2', '#85c1e9'],
  nepal: ['#DC143C', '#003893', '#FFFFFF', '#008000'], // Nepal flag colors
  trade: {
    imports: '#E74C3C',
    exports: '#2ECC71', 
    balance: '#9B59B6',
    total: '#F39C12'
  }
};

// Chart configuration helpers
export const getChartConfig = (type = 'bar') => {
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  };

  switch (type) {
    case 'line':
      return {
        ...baseConfig,
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            radius: 4,
            hoverRadius: 6
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      };
    
    case 'pie':
      return {
        ...baseConfig,
        plugins: {
          ...baseConfig.plugins,
          legend: {
            position: 'right'
          }
        }
      };
    
    default: // bar
      return {
        ...baseConfig,
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            beginAtZero: true
          }
        }
      };
  }
};

// Export all utilities
const dataServiceUtils = {
  loadTradeData,
  formatCurrency,
  calculateGrowthRate,
  calculateTradeBalance,
  calculateCoverageRatio,
  aggregateByYear,
  getTopNItems,
  filterByDateRange,
  colorSchemes,
  getChartConfig
};

export default dataServiceUtils;
