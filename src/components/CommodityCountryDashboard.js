import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Table, Space, Tooltip, Spin, message, Button } from 'antd';
import { GlobalOutlined, ShopOutlined, ExportOutlined, ImportOutlined, QuestionCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  loadCommodityCountryData,
  processCommodityCountryData,
  getAvailableYearsForCommodityCountry,
  formatValue
} from '../utils/commodityCountryDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const { Option } = Select;

const CommodityCountryDashboard = ({ data }) => {
  // Format large numbers with appropriate suffixes
  const formatLargeNumber = (value) => {
    if (value >= 1e12) {
      return (value / 1e12).toFixed(3) + 'T';
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(3) + 'B';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(3) + 'M';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(3) + 'K';
    }
    return value.toFixed(0);
  };

  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2081/082');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCommodity] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [analysisType, setAnalysisType] = useState('Import');
  const [chartType, setChartType] = useState('Value'); // Value, Quantity, Revenue
  const [unitFilter, setUnitFilter] = useState('All');
  const [searchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Country, 2: Product, 3: Details
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [isDetailedTableCollapsed, setIsDetailedTableCollapsed] = useState(true);

  // Load data on component mount and year change
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load data for year:', selectedYear);
        setLoading(true);
        const data = await loadCommodityCountryData(selectedYear);
        console.log('Loaded commodity-country data:', data);
        setRawData(data);
        console.log('Raw data set in state');
      } catch (error) {
        console.error('Error loading commodity-country data:', error);
        message.error(`Failed to load data for ${selectedYear}: ${error.message}`);
      } finally {
        setLoading(false);
        console.log('Loading finished');
      }
    };

    loadData();
  }, [selectedYear]);

  // Set available years
  useEffect(() => {
    const years = getAvailableYearsForCommodityCountry();
    setAvailableYears(years);
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Process raw data into combined commodity-country data
  const combinedData = useMemo(() => {
    if (!rawData) {
      console.log('No raw data available yet');
      return { combinedData: [], commodities: [], countries: [] };
    }

    console.log('Processing commodity-country data...', rawData);
    const processed = processCommodityCountryData(rawData);
    console.log('Processed data result:', {
      combinedDataLength: processed.combinedData.length,
      commoditiesLength: processed.commodities.length, 
      countriesLength: processed.countries.length,
      sampleCommodities: processed.commodities.slice(0, 5),
      sampleCountries: processed.countries.slice(0, 5)
    });
    
    return {
      combinedData: processed.combinedData,
      commodities: processed.commodities,
      countries: processed.countries
    };
  }, [rawData]);

  // Filter data based on selections with unit filtering
  const filteredData = useMemo(() => {
    let filtered = combinedData.combinedData;

    if (selectedCountry !== 'All') {
      filtered = filtered.filter(item => item.country === selectedCountry);
    }
    if (selectedCommodity !== 'All') {
      filtered = filtered.filter(item => item.commodity === selectedCommodity);
    }
    if (unitFilter !== 'All') {
      const unitMap = {
        'Kilogram': 'KG',
        'Kilolitre': 'KL', 
        'Litre': 'LTR',
        'Pieces': 'PCS'
      };
      const targetUnit = unitMap[unitFilter];
      if (targetUnit) {
        filtered = filtered.filter(item => 
          item.unit && item.unit.toUpperCase().includes(targetUnit)
        );
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [combinedData, selectedCommodity, selectedCountry, unitFilter, searchTerm]);

  // Get top 10 commodities for selected country (independent of product search)
  const top10Commodities = useMemo(() => {
    if (selectedCountry === 'All') return [];
    
    // Get country data without product search filter to always show top 10 for the country
    let countryData = combinedData.combinedData;
    
    if (selectedCountry !== 'All') {
      countryData = countryData.filter(item => item.country === selectedCountry);
    }
    if (selectedCommodity !== 'All') {
      countryData = countryData.filter(item => item.commodity === selectedCommodity);
    }
    if (unitFilter !== 'All') {
      const unitMap = {
        'Kilogram': 'KG',
        'Kilolitre': 'KL', 
        'Litre': 'LTR',
        'Pieces': 'PCS'
      };
      const targetUnit = unitMap[unitFilter];
      if (targetUnit) {
        countryData = countryData.filter(item => 
          item.unit && item.unit.toUpperCase().includes(targetUnit)
        );
      }
    }
    if (searchTerm) {
      countryData = countryData.filter(item => 
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Note: We deliberately exclude productSearchTerm here so Top 10 chart always shows all products
    
    let sortKey = 'imports';
    
    switch (chartType) {
      case 'Value':
        sortKey = analysisType === 'Import' ? 'imports' : 'exports';
        break;
      case 'Quantity':
        sortKey = analysisType === 'Import' ? 'importQuantity' : 'exportQuantity';
        break;
      case 'Revenue':
        sortKey = 'importRevenue';
        break;
      default:
        sortKey = 'imports';
    }

    return countryData
      .filter(item => item[sortKey] > 0)
      .sort((a, b) => b[sortKey] - a[sortKey])
      .slice(0, 10);
  }, [combinedData, selectedCountry, selectedCommodity, unitFilter, searchTerm, chartType, analysisType]);

  // Get products for cross-country analysis (all products from all countries)
  const availableProducts = useMemo(() => {
    // Get all products from all countries for cross-country analysis
    return [...new Set(combinedData.combinedData.map(item => item.commodity))].sort();
  }, [combinedData]);

  // Get cross-country data for selected product
  const crossCountryData = useMemo(() => {
    if (!selectedProduct) return { importData: [], exportData: [] };
    
    const productData = combinedData.combinedData.filter(item => 
      item.commodity === selectedProduct
    );
    
    const importData = productData
      .filter(item => item.imports > 0)
      .sort((a, b) => b.imports - a.imports)
      .slice(0, 10);
      
    const exportData = productData
      .filter(item => item.exports > 0)
      .sort((a, b) => b.exports - a.exports)
      .slice(0, 10);
    
    return { importData, exportData };
  }, [combinedData, selectedProduct]);

  // Top 10 commodities chart data
  const top10ChartData = useMemo(() => {
    if (top10Commodities.length === 0) return null;
    
    let values, labels, title;
    
    switch (chartType) {
      case 'Value':
        const valueKey = analysisType === 'Import' ? 'imports' : 'exports';
        values = top10Commodities.map(item => item[valueKey]);
        title = `Top 10 ${analysisType}ed Products by Value - ${selectedCountry}`;
        break;
      case 'Quantity':
        const quantityKey = analysisType === 'Import' ? 'importQuantity' : 'exportQuantity';
        values = top10Commodities.map(item => item[quantityKey]);
        title = `Top 10 ${analysisType}ed Products by Quantity - ${selectedCountry}`;
        break;
      case 'Revenue':
        values = top10Commodities.map(item => item.importRevenue);
        title = `Top 10 Imported Products by Revenue - ${selectedCountry}`;
        break;
      default:
        values = top10Commodities.map(item => item.imports);
        title = `Top 10 Imported Products - ${selectedCountry}`;
    }
    
    labels = top10Commodities.map(item => 
      item.commodity.length > 30 ? item.commodity.substring(0, 30) + '...' : item.commodity
    );
    
    // Don't reverse - keep descending order (highest at top)
    return {
      labels: labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: analysisType === 'Import' ? '#2ECC71' : '#3498DB',
        borderColor: analysisType === 'Import' ? '#27AE60' : '#2980B9',
        borderWidth: 1
      }]
    };
  }, [top10Commodities, chartType, analysisType, selectedCountry]);

  // Cross-country comparison chart data
  const crossCountryChartData = useMemo(() => {
    if (!selectedProduct || (crossCountryData.importData.length === 0 && crossCountryData.exportData.length === 0)) {
      return { valueChart: null, quantityChart: null };
    }
    
    // Combine and get unique countries
    const allCountries = [...new Set([
      ...crossCountryData.importData.map(item => item.country),
      ...crossCountryData.exportData.map(item => item.country)
    ])];
    
    // Value chart data
    const importValues = allCountries.map(country => {
      const item = crossCountryData.importData.find(d => d.country === country);
      return item ? item.imports : 0;
    });
    
    const exportValues = allCountries.map(country => {
      const item = crossCountryData.exportData.find(d => d.country === country);
      return item ? item.exports : 0;
    });
    
    // Quantity chart data
    const importQuantities = allCountries.map(country => {
      const item = crossCountryData.importData.find(d => d.country === country);
      return item ? item.importQuantity : 0;
    });
    
    const exportQuantities = allCountries.map(country => {
      const item = crossCountryData.exportData.find(d => d.country === country);
      return item ? item.exportQuantity : 0;
    });
    
    const valueChart = {
      labels: allCountries,
      datasets: [
        {
          label: 'Import Value',
          data: importValues,
          backgroundColor: '#2ECC71',
          borderColor: '#27AE60',
          borderWidth: 1
        },
        {
          label: 'Export Value', 
          data: exportValues,
          backgroundColor: '#3498DB',
          borderColor: '#2980B9',
          borderWidth: 1
        }
      ]
    };
    
    const quantityChart = {
      labels: allCountries,
      datasets: [
        {
          label: 'Import Quantity',
          data: importQuantities,
          backgroundColor: '#2ECC71',
          borderColor: '#27AE60',
          borderWidth: 1
        },
        {
          label: 'Export Quantity',
          data: exportQuantities,
          backgroundColor: '#3498DB', 
          borderColor: '#2980B9',
          borderWidth: 1
        }
      ]
    };
    
    return { valueChart, quantityChart };
  }, [selectedProduct, crossCountryData]);

  // Table columns
  const tableColumns = [
    {
      title: 'HS Code',
      dataIndex: 'hsCode',
      key: 'hsCode',
      width: 100,
      render: (text) => (
        <span style={{ fontFamily: 'monospace' }}>
          {String(text).replace(/,/g, '')}
        </span>
      )
    },
    {
      title: 'Commodity',
      dataIndex: 'commodity',
      key: 'commodity',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Space>
          <ShopOutlined />
          <Tooltip title={text}>
            <span>{text.substring(0, 30)}...</span>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
      render: (text) => (
        <Space>
          <GlobalOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Imports (NPR)',
      dataIndex: 'imports',
      key: 'imports',
      width: 120,
      render: (value) => (
        <Space>
          <ImportOutlined style={{ color: '#E74C3C' }} />
          {value.toLocaleString()}
        </Space>
      ),
      sorter: (a, b) => a.imports - b.imports,
    },
    {
      title: 'Exports (NPR)',
      dataIndex: 'exports',
      key: 'exports',
      width: 120,
      render: (value) => (
        <Space>
          <ExportOutlined style={{ color: '#2ECC71' }} />
          {value.toLocaleString()}
        </Space>
      ),
      sorter: (a, b) => a.exports - b.exports,
    },
    {
      title: 'Trade Balance',
      dataIndex: 'tradeBalance',
      key: 'tradeBalance',
      width: 120,
      render: (value) => (
        <span style={{ color: value >= 0 ? '#2ECC71' : '#E74C3C' }}>
          {value.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.tradeBalance - b.tradeBalance,
    },
    {
      title: 'Import Quantity',
      dataIndex: 'importQuantity',
      key: 'importQuantity',
      width: 120,
      render: (value, record) => `${value.toLocaleString()} ${record.unit || ''}`,
      sorter: (a, b) => a.importQuantity - b.importQuantity,
    },
    {
      title: 'Export Quantity',
      dataIndex: 'exportQuantity',
      key: 'exportQuantity',
      width: 120,
      render: (value, record) => `${value.toLocaleString()} ${record.unit || ''}`,
      sorter: (a, b) => a.exportQuantity - b.exportQuantity,
    },
    {
      title: 'Competitiveness',
      dataIndex: 'competitiveness',
      key: 'competitiveness',
      width: 120,
      render: (value) => (
        <span style={{ color: value >= 70 ? '#2ECC71' : value >= 40 ? '#F39C12' : '#E74C3C' }}>
          {value.toFixed(1)}%
        </span>
      ),
      sorter: (a, b) => a.competitiveness - b.competitiveness,
    }
  ];

  return (
    <div>
      {/* Description */}
      <div style={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        color: '#ffffff'
      }}>
        <p style={{ fontSize: '13px', margin: 0 }}>
          <strong>Explore Nepal's Trade Relationships:</strong> This dashboard provides a comprehensive analysis of Nepal's international trade data through multiple interactive sections:
          <br/>• <strong>Country Selection:</strong> Choose any trading partner to see Nepal's top imported/exported products with that country
          <br/>• <strong>Top 10 Products Chart:</strong> Visual ranking of the most traded products by value or quantity with the selected country
          <br/>• <strong>Product Analysis:</strong> Select a specific product to compare how Nepal trades it across different countries worldwide
          <br/>• <strong>Cross-Country Charts:</strong> Side-by-side comparison of trade values and quantities for your selected product
          <br/>• <strong>Data Table:</strong> Detailed breakdown with exact figures, trade balances, and competitiveness scores for thorough analysis
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6} md={4}>
            <div className="control-group">
              <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: '500' }}>
                Fiscal Year
                <Tooltip title="Select the fiscal year for trade data analysis">
                  <QuestionCircleOutlined style={{ color: '#64748b' }} />
                </Tooltip>
              </label>
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
          <Col xs={24} sm={6} md={4}>
            <div className="control-group">
              <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: '500' }}>
                Analysis Type
                <Tooltip title="Choose between import and export trade analysis">
                  <QuestionCircleOutlined style={{ color: '#64748b' }} />
                </Tooltip>
              </label>
              <Select
                value={analysisType}
                onChange={setAnalysisType}
                style={{ width: '100%' }}
              >
                <Option value="Import">Imports</Option>
                <Option value="Export">Exports</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <div className="control-group">
              <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: '500' }}>
                Chart Type
                <Tooltip title="Select how to display trade data: by value, quantity, or revenue">
                  <QuestionCircleOutlined style={{ color: '#64748b' }} />
                </Tooltip>
              </label>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: '100%' }}
              >
                <Option value="Value">{analysisType} Value</Option>
                <Option value="Quantity">Quantity</Option>
                {analysisType === 'Import' && <Option value="Revenue">Revenue</Option>}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <div className="control-group">
              <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: '500' }}>
                Unit Filter
                <Tooltip title="Filter products by measurement unit (kg, liters, pieces, etc.)">
                  <QuestionCircleOutlined style={{ color: '#64748b' }} />
                </Tooltip>
              </label>
              <Select
                value={unitFilter}
                onChange={setUnitFilter}
                style={{ width: '100%' }}
              >
                <Option value="All">All Units</Option>
                <Option value="Kilogram">Kilogram (Kg)</Option>
                <Option value="Kilolitre">Kilolitre (Kl)</Option>
                <Option value="Litre">Litre (LTR)</Option>
                <Option value="Pieces">Pieces (PCS)</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Step 1: Country Selection */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= 1 ? '#1890ff' : '#d9d9d9',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    1
                  </div>
                  Search & Select Country for Top 10 {analysisType}ed Products
                  <Tooltip title={`Choose a trading partner country to see Nepal's top 10 ${analysisType.toLowerCase()}ed products with that country`}>
                    <QuestionCircleOutlined style={{ color: '#64748b' }} />
                  </Tooltip>
                </div>
              }
              size="small"
            >
              <Select
                placeholder="Search and choose a country to analyze"
                value={selectedCountry}
                onChange={(value) => {
                  setSelectedCountry(value);
                  setSelectedProduct(null);
                  setCurrentStep(value !== 'All' ? 2 : 1);
                }}
                style={{ width: '100%' }}
                showSearch
                disabled={loading}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="All">All Countries</Option>
                {combinedData.countries.map(country => (
                  <Option key={country} value={country}>{country}</Option>
                ))}
              </Select>
              {selectedCountry !== 'All' && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Selected: <strong>{selectedCountry}</strong>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Top 10 Traded Products Chart - Appears immediately after country selection */}
      {selectedCountry !== 'All' && top10ChartData && (
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card title={`Top 10 ${analysisType}ed Products - ${selectedCountry}`}>
              <div className="chart-container" style={{ height: '500px' }}>
                <Bar 
                  data={top10ChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                      title: {
                        display: true,
                        text: `Top 10 ${analysisType}ed Products by ${chartType} - ${selectedCountry}`,
                        font: { size: isMobile ? 14 : 16, weight: 'bold' }
                      },
                      legend: { display: false },
                      datalabels: {
                        anchor: 'end',
                        align: 'right',
                        color: '#333',
                        font: {
                          weight: 'bold',
                          size: 10
                        },
                        formatter: (value) => formatLargeNumber(value),
                        clip: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const item = top10Commodities[context.dataIndex];
                            const lines = [`${chartType}: ${formatValue(context.parsed.x)}`];
                            
                            if (chartType === 'Value') {
                              const qtyKey = analysisType === 'Import' ? 'importQuantity' : 'exportQuantity';
                              lines.push(`Quantity: ${formatValue(item[qtyKey])} ${item.unit || ''}`);
                            } else if (chartType === 'Quantity') {
                              const valueKey = analysisType === 'Import' ? 'imports' : 'exports';
                              lines.push(`Value: ${formatValue(item[valueKey])} NPR`);
                            }
                            
                            return lines;
                          }
                        }
                      },
                      layout: {
                        padding: {
                          right: 80 // Add padding for external labels
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          title: { 
                            display: true, 
                            text: chartType === 'Value' ? `${analysisType} Value (NPR)` : 
                                 chartType === 'Revenue' ? 'Revenue (NPR)' : 'Quantity'
                          },
                          ticks: {
                            callback: function(value) {
                              return formatLargeNumber(value);
                            }
                          }
                        },
                        y: {
                          title: { display: true, text: 'Products' }
                        }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Next Steps Guide */}
      <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: '#1e293b', 
            fontSize: '18px',
            fontWeight: '600'
          }}>
            � Dive Deeper into Cross-Country Analysis
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#475569', 
            fontSize: '14px' 
          }}>
            {selectedCountry !== 'All' 
              ? "Explore cross-country trade patterns by selecting any product below. See how Nepal trades your chosen product across all countries worldwide."
              : "Select any product below to discover Nepal's global trade patterns for that item across all countries. explore any product's worldwide trade distribution."
            }
          </p>
      </div>

      {/* Step 2: Product Selection for Cross-Country Analysis */}
      <div style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: currentStep >= 2 ? '#1890ff' : '#d9d9d9',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      2
                    </div>
                    Select Product for Cross-Country Analysis
                    <Tooltip title="Choose any product to see how Nepal trades it with different countries worldwide. Works independently of country selection above.">
                      <QuestionCircleOutlined style={{ color: '#64748b' }} />
                    </Tooltip>
                  </div>
                }
                size="small"
              >
                <Select
                  placeholder="Search and choose a product to analyze across countries"
                  value={selectedProduct}
                  onChange={(value) => {
                    setSelectedProduct(value);
                    setCurrentStep(value ? 3 : 2);
                  }}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  disabled={loading}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent="No products found"
                  allowClear
                >
                  {availableProducts.map(product => (
                    <Option key={product} value={product}>
                      {product.length > 50 ? product.substring(0, 50) + '...' : product}
                    </Option>
                  ))}
                </Select>
                {selectedProduct && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Selected: <strong>{selectedProduct.substring(0, 40)}...</strong>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>

      {/* Step 3: Analysis Ready Indicator */}
      {selectedProduct && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    3
                  </div>
                  Cross-Country Analysis Ready
                </div>
              }
              size="small"
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                  ✓ Ready for detailed cross-country analysis
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  Analyzing <strong>{selectedProduct.substring(0, 50)}...</strong> across different countries
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px' }}>
            Loading commodity-country data for {selectedYear}...
          </p>
        </div>
      ) : (
        <>
          {/* Main Charts - Step-based Display */}
          {/* Cross-Country Product Analysis */}
          {selectedProduct && crossCountryChartData.valueChart && (
            <>
              <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24}>
                  <Card title={`${selectedProduct} - Cross-Country Trade Analysis`}>
                    <Row gutter={[16, 16]}>
                      {/* Product Details */}
                      <Col xs={24}>
                        <div style={{
                          padding: '16px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                            Product Details
                          </h4>
                          <div style={{ fontSize: '14px' }}>
                            <strong>Selected Product:</strong> {selectedProduct}
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            <strong>Analysis Type:</strong> {analysisType}
                          </div>
                          <div style={{ fontSize: '14px' }}>
                            <strong>Countries Found:</strong> {crossCountryData.importData.length + crossCountryData.exportData.length} unique trading partners
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[24, 24]}>
                {/* Trade Value Comparison */}
                <Col xs={24} lg={12}>
                  <Card title={`${selectedProduct} - Trade Value by Country`}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Bar 
                        data={crossCountryChartData.valueChart}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `Trade Value Comparison`,
                              font: { size: isMobile ? 12 : 14 }
                            },
                            legend: {
                              position: 'top'
                            },
                            datalabels: {
                              anchor: 'end',
                              align: 'top',
                              color: '#333',
                              font: {
                                weight: 'bold',
                                size: 10
                              },
                              formatter: (value) => formatLargeNumber(value),
                              clip: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} NPR`;
                                }
                              }
                            }
                          },
                          layout: {
                            padding: {
                              top: 30
                            }
                          },
                          scales: {
                            x: {
                              title: { display: true, text: 'Countries' }
                            },
                            y: {
                              title: { display: true, text: 'Trade Value (NPR)' },
                              ticks: {
                                callback: function(value) {
                                  return formatLargeNumber(value);
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Card>
                </Col>

                {/* Trade Quantity Comparison */}
                <Col xs={24} lg={12}>
                  <Card title={`${selectedProduct} - Trade Quantity by Country`}>
                    <div className="chart-container" style={{ height: '400px' }}>
                      <Bar 
                        data={crossCountryChartData.quantityChart}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            title: {
                              display: true,
                              text: `Trade Quantity Comparison`,
                              font: { size: isMobile ? 12 : 14 }
                            },
                            legend: {
                              position: 'top'
                            },
                            datalabels: {
                              anchor: 'end',
                              align: 'top',
                              color: '#333',
                              font: {
                                weight: 'bold',
                                size: 10
                              },
                              formatter: (value, context) => {
                                const countryName = context.chart.data.labels[context.dataIndex];
                                const productData = combinedData.combinedData.find(item => 
                                  item.commodity === selectedProduct && item.country === countryName
                                );
                                const unit = productData ? productData.unit : '';
                                return `${formatLargeNumber(value)} ${unit}`;
                              },
                              clip: false
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const countryName = context.label;
                                  const productData = combinedData.combinedData.find(item => 
                                    item.commodity === selectedProduct && item.country === countryName
                                  );
                                  const unit = productData ? productData.unit : '';
                                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${unit}`;
                                }
                              }
                            }
                          },
                          layout: {
                            padding: {
                              top: 30
                            }
                          },
                          scales: {
                            x: {
                              title: { display: true, text: 'Countries' }
                            },
                            y: {
                              title: { display: true, text: 'Trade Quantity' },
                              ticks: {
                                callback: function(value) {
                                  return formatLargeNumber(value);
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          )}

      {/* Detailed Table */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title="Detailed Commodity-Country Analysis" 
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tooltip title="Comprehensive data table with trade details">
                  <QuestionCircleOutlined style={{ color: '#64748b' }} />
                </Tooltip>
                <Button
                  type="link"
                  onClick={() => setIsDetailedTableCollapsed(!isDetailedTableCollapsed)}
                  style={{ padding: 0 }}
                >
                  {isDetailedTableCollapsed ? <DownOutlined /> : <UpOutlined />}
                  {isDetailedTableCollapsed ? ' Expand' : ' Collapse'}
                </Button>
                <GlobalOutlined />
              </div>
            }
          >
            {!isDetailedTableCollapsed && (
              <Table
                columns={tableColumns}
                dataSource={filteredData}
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} combinations`
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

export default CommodityCountryDashboard;
