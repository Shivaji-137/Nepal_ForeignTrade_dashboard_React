import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Select, Card, Row, Col, Table, Statistic, Space, Spin, message, Tooltip, Button } from 'antd';
import { ShopOutlined, GlobalOutlined, BarChartOutlined, QuestionCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  loadCommodityData,
  getAvailableYearsForDropdown,
  processCommodityData,
  getTopCommodities,
  formatValue,
  prepareChartData,
  clearDataCache,
  getCacheInfo
} from '../utils/commodityDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const { Option } = Select;

const CommodityDashboard = ({ data }) => {
  const [commodityData, setCommodityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2081/082');
  const [analysisType, setAnalysisType] = useState('imports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [isDetailedAnalysisCollapsed, setIsDetailedAnalysisCollapsed] = useState(true);

  // Chart refs for proper cleanup
  const topCommoditiesChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup chart instances on unmount
  useEffect(() => {
    return () => {
      // Clear cache on unmount to free up memory
      clearDataCache();
    };
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const years = getAvailableYearsForDropdown();
        setAvailableYears(years);
        
        // Set default year to the latest available
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error loading commodity data:', error);
        message.error('Failed to load commodity data from Excel files');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load data when year changes
  useEffect(() => {
    if (!selectedYear) return;
    
    const loadYearData = async () => {
      try {
        setLoading(true);
        const rawData = await loadCommodityData(selectedYear);
        const processedData = processCommodityData(rawData);
        setCommodityData(processedData);
      } catch (error) {
        console.error('Error loading commodity data for year:', selectedYear, error);
        message.error(`Failed to load commodity data for year ${selectedYear}`);
      } finally {
        setLoading(false);
      }
    };

    loadYearData();
  }, [selectedYear]);

  // Process current year data
  const currentYearData = useMemo(() => {
    return commodityData || [];
  }, [commodityData]);

  // Get all commodity names for search
  const allCommodities = useMemo(() => {
    if (!commodityData || !commodityData.length) return [];
    return commodityData.map(item => item.commodity).filter(Boolean);
  }, [commodityData]);

  // Filtered commodities for search
  const filteredCommodities = useMemo(() => {
    if (!searchTerm) return allCommodities;
    return allCommodities.filter(commodity =>
      commodity.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCommodities, searchTerm]);

  // Get trend data for selected commodity
  const [trendData, setTrendData] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  // Load trend data when commodity is selected
  useEffect(() => {
    if (!selectedCommodity || !commodityData || !commodityData.length) {
      setTrendData(null);
      return;
    }

    const loadTrendData = async () => {
      try {
        setLoadingTrend(true);
        
        // Calculate previous year similar to Python version
        const currentYearNum = parseInt(selectedYear.split('/')[0]);
        const currentYearSuffix = selectedYear.split('/')[1];
        const previousYearNum = currentYearNum - 1;
        const previousYearSuffix = String(parseInt(currentYearSuffix) - 1).padStart(3, '0');
        const previousYear = `${previousYearNum}/${previousYearSuffix}`;

        const historicalTrendData = {
          years: [previousYear, selectedYear],
          imports: [],
          exports: [],
          tradeBalance: [],
          totalTrade: [],
          importQuantity: [],
          exportQuantity: [],
          unit: null,
          growthData: {
            importValueChange: 0,
            exportValueChange: 0,
            importQuantityChange: 0,
            exportQuantityChange: 0
          }
        };

        // Load data for both years
        // Find by exact match first, then by HS code as fallback
        const currentCommodityItem = commodityData.find(item => 
          item.commodity === selectedCommodity
        );

        let previousCommodityItem = null;
        try {
          // Load previous year data
          console.log(`Loading previous year data for ${previousYear}...`);
          const previousYearRawData = await loadCommodityData(previousYear);
          const previousYearProcessedData = processCommodityData(previousYearRawData);
          
          console.log(`Found ${previousYearProcessedData.length} commodities in previous year data`);
          
          // First try exact match by commodity name
          previousCommodityItem = previousYearProcessedData.find(item => 
            item.commodity === selectedCommodity
          );
          
          // If no exact match, try by HS code (more reliable across years)
          if (!previousCommodityItem && currentCommodityItem) {
            console.log(`Trying to find by HS code: ${currentCommodityItem.hsCode}`);
            previousCommodityItem = previousYearProcessedData.find(item => 
              item.hsCode === currentCommodityItem.hsCode
            );
          }
          
          // If still no match, try partial name matching
          if (!previousCommodityItem) {
            console.log(`Trying partial name matching for: ${selectedCommodity}`);
            previousCommodityItem = previousYearProcessedData.find(item => 
              item.commodity && item.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())
            );
          }
          
          console.log('Previous year commodity item found:', previousCommodityItem ? 'Yes' : 'No');
        } catch (error) {
          console.warn(`Failed to load data for previous year ${previousYear}:`, error);
        }

        // Populate data for both years
        if (previousCommodityItem) {
          console.log('Adding previous year data:', {
            commodity: previousCommodityItem.commodity,
            imports: previousCommodityItem.imports,
            exports: previousCommodityItem.exports
          });
          historicalTrendData.imports.push(previousCommodityItem.imports);
          historicalTrendData.exports.push(previousCommodityItem.exports);
          historicalTrendData.tradeBalance.push(previousCommodityItem.tradeBalance);
          historicalTrendData.totalTrade.push(previousCommodityItem.totalTrade);
          historicalTrendData.importQuantity.push(previousCommodityItem.importQuantity || 0);
          historicalTrendData.exportQuantity.push(previousCommodityItem.exportQuantity || 0);
        } else {
          console.log('No previous year data found, using zeros');
          historicalTrendData.imports.push(0);
          historicalTrendData.exports.push(0);
          historicalTrendData.tradeBalance.push(0);
          historicalTrendData.totalTrade.push(0);
          historicalTrendData.importQuantity.push(0);
          historicalTrendData.exportQuantity.push(0);
        }

        if (currentCommodityItem) {
          console.log('Adding current year data:', {
            commodity: currentCommodityItem.commodity,
            imports: currentCommodityItem.imports,
            exports: currentCommodityItem.exports
          });
          historicalTrendData.imports.push(currentCommodityItem.imports);
          historicalTrendData.exports.push(currentCommodityItem.exports);
          historicalTrendData.tradeBalance.push(currentCommodityItem.tradeBalance);
          historicalTrendData.totalTrade.push(currentCommodityItem.totalTrade);
          historicalTrendData.importQuantity.push(currentCommodityItem.importQuantity || 0);
          historicalTrendData.exportQuantity.push(currentCommodityItem.exportQuantity || 0);
          historicalTrendData.unit = currentCommodityItem.unit;
        } else {
          console.log('No current year data found, using zeros');
          historicalTrendData.imports.push(0);
          historicalTrendData.exports.push(0);
          historicalTrendData.tradeBalance.push(0);
          historicalTrendData.totalTrade.push(0);
          historicalTrendData.importQuantity.push(0);
          historicalTrendData.exportQuantity.push(0);
        }

        console.log('Final historical trend data arrays:', {
          years: historicalTrendData.years,
          imports: historicalTrendData.imports,
          exports: historicalTrendData.exports,
          importQuantity: historicalTrendData.importQuantity,
          exportQuantity: historicalTrendData.exportQuantity
        });

        // Calculate growth percentages like Python version
        const prevImport = historicalTrendData.imports[0];
        const currImport = historicalTrendData.imports[1];
        const prevExport = historicalTrendData.exports[0];
        const currExport = historicalTrendData.exports[1];
        const prevImportQty = historicalTrendData.importQuantity[0];
        const currImportQty = historicalTrendData.importQuantity[1];
        const prevExportQty = historicalTrendData.exportQuantity[0];
        const currExportQty = historicalTrendData.exportQuantity[1];

        historicalTrendData.growthData = {
          importValueChange: prevImport > 0 ? ((currImport - prevImport) / prevImport * 100) : 0,
          exportValueChange: prevExport > 0 ? ((currExport - prevExport) / prevExport * 100) : 0,
          importQuantityChange: prevImportQty > 0 ? ((currImportQty - prevImportQty) / prevImportQty * 100) : 0,
          exportQuantityChange: prevExportQty > 0 ? ((currExportQty - prevExportQty) / prevExportQty * 100) : 0
        };
        
        console.log('Historical trend data loaded:', historicalTrendData);
        setTrendData(historicalTrendData);
      } catch (error) {
        console.error('Error loading trend data:', error);
        setTrendData(null);
      } finally {
        setLoadingTrend(false);
      }
    };

    loadTrendData();
  }, [selectedCommodity, commodityData, selectedYear]);

  // Prepare trend chart data
  const trendChartData = useMemo(() => {
    if (!trendData) {
      console.log('No trend data available for chart');
      return null;
    }
    
    try {
      let chartData;
      // Create bar chart data to show growth indicators
      chartData = {
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
          }
        ]
      };
      
      console.log('Prepared chart data:', chartData);
      
      // Validate chart data - ensure we have data arrays even if they contain zeros
      if (!chartData || !chartData.datasets || !chartData.datasets.length) {
        console.log('Chart data validation failed: missing datasets');
        return null;
      }
      
      // Ensure all datasets have data arrays
      const hasValidData = chartData.datasets.every(dataset => 
        dataset.data && Array.isArray(dataset.data) && dataset.data.length > 0
      );
      
      if (!hasValidData) {
        console.log('Chart data validation failed: datasets missing data arrays');
        return null;
      }
      
      return chartData;
    } catch (error) {
      console.error('Error preparing trend chart data:', error);
      return null;
    }
  }, [trendData]);

  // Get top 10 commodities based on analysis type
  const top10Data = useMemo(() => {
    if (!currentYearData || !currentYearData.length) return null;
    
    try {
      const topCommodities = getTopCommodities(currentYearData, analysisType, 10);
      if (!topCommodities || !topCommodities.length) return null;
      
      const chartData = prepareChartData(topCommodities, analysisType);
      
      // Validate chart data before returning
      if (!chartData || !chartData.datasets || !chartData.datasets[0]) return null;
      
      return chartData;
    } catch (error) {
      console.error('Error preparing top 10 chart data:', error);
      return null;
    }
  }, [currentYearData, analysisType]);

  // Calculate trade metrics from real data
  const tradeMetrics = useMemo(() => {
    if (!currentYearData.length) return {
      totalImports: 0,
      totalExports: 0,
      tradeBalance: 0,
      totalTrade: 0,
      coverageRatio: '0.0',
      avgGrowth: '0.0'
    };

    const totalImports = currentYearData.reduce((sum, item) => sum + item.imports, 0);
    const totalExports = currentYearData.reduce((sum, item) => sum + item.exports, 0);
    const tradeBalance = totalExports - totalImports;
    const totalTrade = totalImports + totalExports;
    
    return {
      totalImports,
      totalExports,
      tradeBalance,
      totalTrade,
      coverageRatio: totalImports > 0 ? ((totalExports / totalImports) * 100).toFixed(1) : '0.0',
      avgGrowth: '8.5' // Mock growth for now as it requires historical data
    };
  }, [currentYearData]);

  // Get current stats for selected commodity
  const currentCommodityStats = useMemo(() => {
    if (!selectedCommodity || !currentYearData.length) return null;
    
    const commodityData = currentYearData.find(item => 
      item.commodity === selectedCommodity
    );
    
    if (!commodityData) return null;
    
    return {
      hsCode: commodityData.hsCode,
      imports: commodityData.imports,
      exports: commodityData.exports,
      tradeBalance: commodityData.tradeBalance,
      totalTrade: commodityData.totalTrade,
      importQuantity: commodityData.importQuantity || 0,
      exportQuantity: commodityData.exportQuantity || 0,
      unit: commodityData.unit || '',
      importRevenue: commodityData.importRevenue || 0
    };
  }, [selectedCommodity, currentYearData]);

  // Chart options for top 10 commodities
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Make horizontal bar chart
    plugins: {
      title: {
        display: true,
        text: `Top 10 Commodities by ${analysisType}`,
        font: { size: isMobile ? 12 : 16, weight: 'bold' }
      },
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            if (context && context.dataset && context.parsed) {
              return `${context.dataset.label}: ${formatValue(context.parsed.x)}`;
            }
            return '';
          }
        }
      },
      datalabels: {
        display: true, // Always show labels
        anchor: 'end',
        align: 'right', // Position labels outside (to the right) of bars
        formatter: function(value, context) {
          // Use the actual value from the dataset if value parameter is not reliable
          const actualValue = context && context.parsed ? context.parsed.x : value;
          return formatValue(actualValue);
        },
        color: '#374151',
        font: {
          size: isMobile ? 10 : 12,
          weight: 'bold'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 4,
        padding: {
          top: 4,
          bottom: 4,
          left: 6,
          right: 6
        },
        offset: 8 // Add some space between bar and label
      }
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: 'Value (NPR)'
        },
        ticks: {
          callback: function(value) {
            return formatValue(value);
          }
        }
      },
      y: {
        title: { display: true, text: 'Commodities' },
        ticks: { 
          maxRotation: 0,
          minRotation: 0,
          font: { size: isMobile ? 8 : 10 }
        }
      }
    },
    elements: {
      bar: {
        borderWidth: isMobile ? 1 : 2,
      }
    },
    layout: {
      padding: {
        left: isMobile ? 5 : 10,
        right: isMobile ? 80 : 120, // More right padding for external data labels
        top: 10,
        bottom: 10
      }
    }
  }), [analysisType, isMobile]);

  // Trend chart options
  const trendChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: selectedCommodity ? `${selectedCommodity} - Trade Trend Analysis` : 'Trade Trend Analysis',
        font: { size: isMobile ? 12 : 16, weight: 'bold' }
      },
      legend: {
        position: isMobile ? 'bottom' : 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: function(context) {
            if (context && context.dataset && context.parsed) {
              return `${context.dataset.label}: ${formatValue(context.parsed.y)}`;
            }
            return '';
          }
        }
      },
      datalabels: {
        display: true, // Always show labels
        anchor: 'end',
        align: 'top',
        formatter: function(value, context) {
          // Show the actual value with growth indicator for current year
          const actualValue = context.parsed ? context.parsed.y : value;
          const datasetLabel = context.dataset.label;
          
          if (context.dataIndex === 1 && trendData && trendData.growthData) {
            // Current year - show value + growth
            const { growthData } = trendData;
            let growthText = '';
            
            if (datasetLabel === 'Imports') {
              const change = growthData.importValueChange;
              const arrow = change >= 0 ? '↗' : '↘';
              growthText = ` (${arrow}${Math.abs(change).toFixed(1)}%)`;
            } else if (datasetLabel === 'Exports') {
              const change = growthData.exportValueChange;
              const arrow = change >= 0 ? '↗' : '↘';
              growthText = ` (${arrow}${Math.abs(change).toFixed(1)}%)`;
            }
            
            return `${formatValue(actualValue)}${growthText}`;
          } else {
            // Previous year - show just value
            return formatValue(actualValue);
          }
        },
        color: function(context) {
          if (!trendData || !trendData.growthData) return '#333';
          
          const { growthData } = trendData;
          const datasetLabel = context.dataset.label;
          
          if (datasetLabel === 'Imports') {
            return growthData.importValueChange >= 0 ? '#2ECC71' : '#E74C3C';
          } else if (datasetLabel === 'Exports') {
            return growthData.exportValueChange >= 0 ? '#2ECC71' : '#E74C3C';
          }
          
          return '#333';
        },
        font: {
          size: isMobile ? 10 : 12,
          weight: 'bold'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: function(context) {
          if (!trendData || !trendData.growthData) return '#ccc';
          
          const { growthData } = trendData;
          const datasetLabel = context.dataset.label;
          
          if (datasetLabel === 'Imports') {
            return growthData.importValueChange >= 0 ? '#2ECC71' : '#E74C3C';
          } else if (datasetLabel === 'Exports') {
            return growthData.exportValueChange >= 0 ? '#2ECC71' : '#E74C3C';
          }
          
          return '#ccc';
        },
        borderWidth: 1,
        borderRadius: 4,
        padding: {
          top: 4,
          bottom: 4,
          left: 6,
          right: 6
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Fiscal Year' },
        ticks: { 
          font: { size: isMobile ? 8 : 10 }
        }
      },
      y: {
        title: { display: true, text: 'Value (NPR)' },
        ticks: {
          callback: function(value) {
            return formatValue(value);
          }
        }
      }
    }
  }), [selectedCommodity, isMobile, trendData]);

  return (
    <div>
      {/* Description */}
      <div style={{
        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        borderLeft: '6px solid #1f77b4',
        borderRadius: '8px',
        marginBottom: '20px',
        padding: '15px'
      }}>
        <p style={{ 
          fontSize: '13px',
          color: 'white',
          fontWeight: '600',
          margin: 0,
          fontFamily: "'Inter', sans-serif"
        }}>
          Analyze Nepal's trade by commodity chapters according to the Harmonized System (HS) classification. 
          Explore import/export patterns, growth trends, and trade performance across different commodity groups. 
          Each chapter represents a specific category of goods traded internationally.
        </p>
      </div>

      {/* Controls */}
      <div className="controls-section" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="control-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  color: '#374151',
                  margin: 0
                }}>Fiscal Year</label>
                <Tooltip title="Select the fiscal year to view commodity trade data for that specific period. Data shows Nepal's imports and exports by commodity chapters.">
                  <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                </Tooltip>
              </div>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: '100%' }}
                loading={loading}
              >
                {availableYears.map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="control-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  color: '#374151',
                  margin: 0
                }}>Analysis Type</label>
                <Tooltip title="Choose what type of commodity trade data to analyze: Imports (commodities Nepal buys), Exports (commodities Nepal sells), Trade Balance (difference), or Total Trade (combined volume).">
                  <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                </Tooltip>
              </div>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: '100%' }}
              >
                <Option value="imports">Imports</Option>
                <Option value="exports">Exports</Option>
                <Option value="trade balance">Trade Balance</Option>
                <Option value="total trade">Total Trade</Option>
              </Select>
            </div>
          </Col>
          {process.env.NODE_ENV === 'development' && (
            <Col xs={24} sm={12} md={6}>
              <div className="control-group">
                <label className="control-label">Cache Info</label>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {getCacheInfo().size} files cached
                  <button 
                    onClick={() => {
                      clearDataCache();
                      message.success('Cache cleared');
                    }}
                    style={{ 
                      marginLeft: '8px', 
                      padding: '2px 6px', 
                      fontSize: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: '#f5f5f5',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} md={8}>
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
          }}>
            <Statistic
              title={<span style={{ color: '#fff', fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>Total Imports</span>}
              value={tradeMetrics.totalImports}
              formatter={(value) => `${formatValue(value)} NPR`}
              valueStyle={{ 
                color: '#fff', 
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: 'bold'
              }}
              prefix={<BarChartOutlined style={{ color: '#fff', fontSize: isMobile ? '16px' : '20px' }} />}
            />
          </div>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3498DB, #2980B9)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
          }}>
            <Statistic
              title={<span style={{ color: '#fff', fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>Total Exports</span>}
              value={tradeMetrics.totalExports}
              formatter={(value) => `${formatValue(value)} NPR`}
              valueStyle={{ 
                color: '#fff', 
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: 'bold'
              }}
              prefix={<GlobalOutlined style={{ color: '#fff', fontSize: isMobile ? '16px' : '20px' }} />}
            />
          </div>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: tradeMetrics.tradeBalance >= 0 
              ? 'linear-gradient(135deg, #2ECC71, #27AE60)' 
              : 'linear-gradient(135deg, #E74C3C, #C0392B)',
            textAlign: 'center',
            boxShadow: tradeMetrics.tradeBalance >= 0 
              ? '0 4px 12px rgba(46, 204, 113, 0.3)'
              : '0 4px 12px rgba(231, 76, 60, 0.3)'
          }}>
            <Statistic
              title={<span style={{ color: '#fff', fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>Trade Balance</span>}
              value={tradeMetrics.tradeBalance}
              formatter={(value) => `${formatValue(value)} NPR`}
              valueStyle={{ 
                color: '#fff', 
                fontSize: isMobile ? '18px' : '24px',
                fontWeight: 'bold'
              }}
              prefix={<ShopOutlined style={{ color: '#fff', fontSize: isMobile ? '16px' : '20px' }} />}
            />
          </div>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px' }}>
            Loading commodity data for {selectedYear}...
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {selectedYear === '2081/082' ? 'Loading latest data (~13MB)...' : 'This may take a few moments...'}
          </p>
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <Row gutter={[24, 24]}>
            {/* Top Commodities Chart */}
            <Col xs={24}>
              <Card title={`Top 10 Commodities by ${analysisType}`} extra={<BarChartOutlined />}>
                <div className="chart-container" style={{ height: isMobile ? '500px' : '400px' }}>
                  {top10Data ? (
                    <Bar 
                      ref={topCommoditiesChartRef}
                      key={`commodity-top10-${selectedYear}-${analysisType}-${Date.now()}`}
                      data={top10Data} 
                      options={chartOptions} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <p>No data available for the selected criteria</p>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Summary Statistics */}
          <Row gutter={[16, 16]} style={{ margin: '24px 0' }}>
            <Col xs={24} sm={8}>
              <Card title="Active Commodities" size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', color: '#9B59B6' }}>
                    {currentYearData.length}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem' }}>
                    Total Commodities
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Search Commodity Section */}
          <div className="controls-section" style={{ 
            marginTop: isMobile ? '24px' : '32px',
            marginBottom: isMobile ? '16px' : '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16} lg={18}>
                <div className="control-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <label style={{ 
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      display: 'block',
                      color: '#374151',
                      margin: 0
                    }}>
                      Search Commodity for Trend Analysis
                    </label>
                    <Tooltip title="Search and select a specific commodity chapter to view detailed trade trends over time. Analyze import/export patterns and growth trends for individual commodity categories according to HS classification.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '14px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={selectedCommodity}
                    onChange={setSelectedCommodity}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder="Type to search and select a commodity..."
                    optionFilterProp="children"
                    allowClear
                    onSearch={setSearchTerm}
                    filterOption={false}
                    size={isMobile ? 'middle' : 'large'}
                  >
                    {filteredCommodities.slice(0, 50).map((commodity, index) => (
                      <Option key={index} value={commodity}>
                        {commodity.length > 60 ? `${commodity.substring(0, 60)}...` : commodity}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </div>

          {/* Current Commodity Stats */}
          {selectedCommodity && currentCommodityStats && (
            <Row gutter={[16, 16]} style={{ margin: '24px 0' }}>
              <Col xs={24}>
                <Card 
                  title={`Current Stats for: ${selectedCommodity}`} 
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                  headStyle={{
                    background: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 'bold'
                  }}
                  bodyStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '0 0 12px 12px',
                    padding: isMobile ? '16px' : '24px'
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>HS Code</span>}
                          value={currentCommodityStats.hsCode ? currentCommodityStats.hsCode.toString().replace(/,/g, '') : ''}
                          valueStyle={{ 
                            color: '#fff', 
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>Import Value</span>}
                          value={formatValue(currentCommodityStats.imports)}
                          suffix="NPR"
                          valueStyle={{ 
                            color: '#fff',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #3498DB, #2980B9)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>Export Value</span>}
                          value={formatValue(currentCommodityStats.exports)}
                          suffix="NPR"
                          valueStyle={{ 
                            color: '#fff',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #F39C12, #E67E22)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>{`Import Quantity${currentCommodityStats.unit ? ` (${currentCommodityStats.unit})` : ''}`}</span>}
                          value={currentCommodityStats.importQuantity.toLocaleString()}
                          valueStyle={{ 
                            color: '#fff',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8E44AD, #71368A)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>{`Export Quantity${currentCommodityStats.unit ? ` (${currentCommodityStats.unit})` : ''}`}</span>}
                          value={currentCommodityStats.exportQuantity.toLocaleString()}
                          valueStyle={{ 
                            color: '#fff',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: currentCommodityStats.tradeBalance >= 0 
                          ? 'linear-gradient(135deg, #2ECC71, #27AE60)' 
                          : 'linear-gradient(135deg, #E74C3C, #C0392B)',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <Statistic
                          title={<span style={{ color: '#fff', fontSize: isMobile ? '12px' : '14px' }}>Trade Balance</span>}
                          value={formatValue(currentCommodityStats.tradeBalance)}
                          suffix="NPR"
                          valueStyle={{ 
                            color: '#fff',
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                  
                  {/* Growth Indicators */}
                  {trendData && trendData.growthData && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <Row gutter={16}>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold',
                              color: trendData.growthData.importValueChange >= 0 ? '#2ECC71' : '#E74C3C'
                            }}>
                              Import Value {trendData.growthData.importValueChange >= 0 ? '↗' : '↘'} {Math.abs(trendData.growthData.importValueChange).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>vs Previous Year</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold',
                              color: trendData.growthData.exportValueChange >= 0 ? '#2ECC71' : '#E74C3C'
                            }}>
                              Export Value {trendData.growthData.exportValueChange >= 0 ? '↗' : '↘'} {Math.abs(trendData.growthData.exportValueChange).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>vs Previous Year</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold',
                              color: trendData.growthData.importQuantityChange >= 0 ? '#2ECC71' : '#E74C3C'
                            }}>
                              Import Qty {trendData.growthData.importQuantityChange >= 0 ? '↗' : '↘'} {Math.abs(trendData.growthData.importQuantityChange).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>vs Previous Year</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold',
                              color: trendData.growthData.exportQuantityChange >= 0 ? '#2ECC71' : '#E74C3C'
                            }}>
                              Export Qty {trendData.growthData.exportQuantityChange >= 0 ? '↗' : '↘'} {Math.abs(trendData.growthData.exportQuantityChange).toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>vs Previous Year</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )}

          {/* Trend Chart for Selected Commodity */}
          {selectedCommodity && trendChartData && (
            <Row gutter={[24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              {/* Value Chart */}
              <Col xs={24} lg={12}>
                <Card 
                  title={`Value Trend: ${selectedCommodity}`}
                  size="small"
                >
                  <div className="chart-container" style={{ height: '300px' }}>
                    {loadingTrend ? (
                      <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin />
                        <p>Loading trend data...</p>
                      </div>
                    ) : (
                      <Bar 
                        ref={trendChartRef}
                        key={`commodity-trend-bar-${selectedCommodity}-${selectedYear}-${Date.now()}`}
                        data={trendChartData} 
                        options={trendChartOptions} 
                      />
                    )}
                  </div>
                </Card>
              </Col>
              
              {/* Quantity Chart */}
              {trendData && trendData.unit && (
                <Col xs={24} lg={12}>
                  <Card 
                    title={`Quantity Trend: ${selectedCommodity}`}
                    size="small"
                  >
                    <div className="chart-container" style={{ height: '300px' }}>
                      {loadingTrend ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                          <Spin />
                          <p>Loading trend data...</p>
                        </div>
                      ) : (
                        <Bar 
                          key={`commodity-qty-trend-bar-${selectedCommodity}-${selectedYear}-${Date.now()}`}
                          data={{
                            labels: trendData.years,
                            datasets: [
                              {
                                label: `Import Quantity (${trendData.unit})`,
                                data: trendData.importQuantity,
                                backgroundColor: '#F39C12',
                                borderColor: '#F39C12',
                                borderWidth: 1
                              },
                              {
                                label: `Export Quantity (${trendData.unit})`,
                                data: trendData.exportQuantity,
                                backgroundColor: '#8E44AD',
                                borderColor: '#8E44AD',
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              title: {
                                display: true,
                                text: `Quantity Growth (${trendData.unit})`,
                                font: { size: isMobile ? 10 : 14, weight: 'bold' }
                              },
                              legend: {
                                position: 'top'
                              },
                              datalabels: {
                                display: true,
                                anchor: 'end',
                                align: 'top',
                                formatter: function(value, context) {
                                  return value.toLocaleString();
                                },
                                color: '#374151',
                                font: {
                                  size: isMobile ? 10 : 12,
                                  weight: 'bold'
                                },
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 4,
                                padding: {
                                  top: 4,
                                  bottom: 4,
                                  left: 6,
                                  right: 6
                                },
                                offset: 8
                              }
                            },
                            scales: {
                              x: {
                                title: { display: true, text: 'Fiscal Year' }
                              },
                              y: {
                                title: { display: true, text: `Quantity (${trendData.unit})` },
                                ticks: {
                                  callback: function(value) {
                                    return value.toLocaleString();
                                  }
                                }
                              }
                            },
                            layout: {
                              padding: {
                                top: 40,
                                bottom: 10,
                                left: 10,
                                right: 10
                              }
                            }
                          }} 
                        />
                      )}
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          )}

          {/* Detailed Commodity Table */}
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card 
                title="Detailed Commodity Analysis" 
                extra={
                  <Space>
                    <ShopOutlined />
                    <Button 
                      type="text" 
                      icon={isDetailedAnalysisCollapsed ? <DownOutlined /> : <UpOutlined />}
                      onClick={() => setIsDetailedAnalysisCollapsed(!isDetailedAnalysisCollapsed)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#1890ff'
                      }}
                    >
                      {isDetailedAnalysisCollapsed ? 'Expand' : 'Collapse'}
                    </Button>
                  </Space>
                }
              >
                {!isDetailedAnalysisCollapsed && (
                  <Table
                    columns={[
                      {
                        title: 'HS Code',
                        dataIndex: 'hsCode',
                        key: 'hsCode',
                        width: 120,
                        fixed: 'left',
                        render: (value) => value ? value.toString().replace(/,/g, '') : '',
                      },
                      {
                        title: 'Commodity Description',
                        dataIndex: 'commodity',
                        key: 'commodity',
                        width: 300,
                        ellipsis: true,
                        render: (text) => (
                          <Space>
                            <ShopOutlined />
                            <span>{text}</span>
                          </Space>
                        )
                      },
                      {
                        title: 'Unit',
                        dataIndex: 'unit',
                        key: 'unit',
                        width: 80,
                      },
                      {
                        title: 'Imports (NPR)',
                        dataIndex: 'imports',
                        key: 'imports',
                        width: 120,
                        render: (value) => formatValue(value),
                        sorter: (a, b) => a.imports - b.imports,
                      },
                      {
                        title: 'Exports (NPR)',
                        dataIndex: 'exports',
                        key: 'exports',
                        width: 120,
                        render: (value) => formatValue(value),
                        sorter: (a, b) => a.exports - b.exports,
                      },
                      {
                        title: 'Trade Balance',
                        dataIndex: 'tradeBalance',
                        key: 'tradeBalance',
                        width: 120,
                        render: (value) => (
                          <span style={{ color: value >= 0 ? '#2ECC71' : '#E74C3C' }}>
                            {formatValue(value)}
                          </span>
                        ),
                        sorter: (a, b) => a.tradeBalance - b.tradeBalance,
                      },
                      {
                        title: 'Total Trade',
                        dataIndex: 'totalTrade',
                        key: 'totalTrade',
                        width: 120,
                        render: (value) => formatValue(value),
                        sorter: (a, b) => a.totalTrade - b.totalTrade,
                      }
                    ]}
                    dataSource={currentYearData.map((item, index) => ({
                      ...item,
                      key: index
                    }))}
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 15,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} commodities`
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default CommodityDashboard;
