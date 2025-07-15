import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Input, Space, Spin, message, Radio, Tooltip } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Bar, Scatter, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  loadProductData,
  getAvailableYearsForDropdown,
  selectProductYearData,
  getTopProducts,
  getProductTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData
} from '../utils/productDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const { Option } = Select;

const ProductDashboard = ({ data }) => {
  const [allProductData, setAllProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2081/082');
  const [chartType, setChartType] = useState('Import');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productChartType, setProductChartType] = useState('Line Trend');
  const [top10ChartType, setTop10ChartType] = useState('Bar Chart'); // New state for top 10 chart type
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productData = await loadProductData();
        setAllProductData(productData);
        
        const years = getAvailableYearsForDropdown(productData);
        setAvailableYears(years);
        
        // Set default year to the latest available
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error loading product data:', error);
        message.error('Failed to load product data from Excel files');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process current year data
  const currentYearData = useMemo(() => {
    if (!allProductData.length || !selectedYear) return [];
    return selectProductYearData(allProductData, selectedYear);
  }, [allProductData, selectedYear]);

  // Get top 10 products based on selection with chart type support
  const top10Data = useMemo(() => {
    if (!currentYearData.length) return null;
    
    const topProducts = getTopProducts(currentYearData, chartType, 10);
    
    // All chart types now use the same data preparation
    const chartData = prepareChartData(topProducts, chartType);
    
    // Debug logging
    console.log('ProductDashboard - currentYearData length:', currentYearData.length);
    console.log('ProductDashboard - topProducts:', topProducts);
    console.log('ProductDashboard - chartData:', chartData);
    
    return chartData;
  }, [currentYearData, chartType]);

  // Get all product names for search
  const allProducts = useMemo(() => {
    if (!allProductData.length) return [];
    return allProductData.map(item => item.Products).filter(Boolean);
  }, [allProductData]);

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    return allProducts.filter(product =>
      product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  // Get trend data for selected product
  const trendData = useMemo(() => {
    if (!selectedProduct || !allProductData.length) return null;
    
    console.log('Getting trend data for product:', selectedProduct);
    const data = getProductTrendData(allProductData, selectedProduct);
    console.log('Trend data result:', data);
    
    return data;
  }, [selectedProduct, allProductData]);

  // Prepare trend chart data
  const trendChartData = useMemo(() => {
    if (!trendData) return null;
    
    console.log('Preparing trend chart data from:', trendData);
    
    let chartData;
    if (productChartType === 'Line Trend') {
      chartData = prepareTrendChartData(trendData);
    } else {
      chartData = prepareTrendBarChartData(trendData);
    }
    
    console.log('Trend chart data result:', chartData);
    
    return chartData;
  }, [trendData, productChartType]);

  // Get current stats for selected product
  const currentProductStats = useMemo(() => {
    if (!selectedProduct || !currentYearData.length) return null;
    
    const productData = currentYearData.find(item => 
      item.product === selectedProduct
    );
    
    if (!productData) return null;
    
    return {
      imports: productData.imports,
      exports: productData.exports,
      tradeBalance: productData.tradeBalance,
      ratio: productData.imports > 0 ? (productData.imports / productData.exports).toFixed(2) : 'N/A'
    };
  }, [selectedProduct, currentYearData]);

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
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
              Explore Nepal's trade in specific products and commodities. View top 10 traded products by value, 
              analyze trends over time, and search for specific products to see detailed trade patterns. 
              Use the controls below to switch between different views and time periods.
            </p>
          </div>

          {/* Controls */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <div className="control-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <label style={{
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'block',
                      color: '#374151',
                      margin: 0
                    }}>Fiscal Year</label>
                    <Tooltip title="Select the fiscal year to view trade data for that specific period. Data is available from 2073/74 to 2081/82.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: '100%' }}
                  >
                    {availableYears.map(year => (
                      <Option key={year} value={year}>{year}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <div className="control-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <label style={{
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'block',
                      color: '#374151',
                      margin: 0
                    }}>Analysis Type</label>
                    <Tooltip title="Choose what type of trade data to analyze: Imports (goods bought from abroad), Exports (goods sold abroad), or Trade Balance (difference between exports and imports).">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={chartType}
                    onChange={setChartType}
                    style={{ width: '100%' }}
                  >
                    <Option value="Import">Imports</Option>
                    <Option value="Export">Exports</Option>
                    <Option value="Trade Balance">Trade Balance</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <div className="control-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <label style={{
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'block',
                      color: '#374151',
                      margin: 0
                    }}>Chart Type</label>
                    <Tooltip title="Select how to display the top 10 products: Bar Chart for traditional bar visualization or Scatter Plot for value distribution analysis.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Radio.Group
                    value={top10ChartType}
                    onChange={(e) => setTop10ChartType(e.target.value)}
                    style={{ width: '100%' }}
                    size={isMobile ? 'small' : 'middle'}
                  >
                    <Radio.Button 
                      value="Bar Chart"
                      style={{
                        fontSize: isMobile ? '12px' : '14px',
                        height: isMobile ? '28px' : '32px',
                        minWidth: isMobile ? '70px' : '90px'
                      }}
                    >
                      Bar
                    </Radio.Button>
                    <Radio.Button 
                      value="Scatter"
                      style={{
                        fontSize: isMobile ? '12px' : '14px',
                        height: isMobile ? '28px' : '32px',
                        minWidth: isMobile ? '70px' : '90px'
                      }}
                    >
                      Scatter
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </div>

          {/* Top 10 Charts Section */}
          <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
            <Col xs={24}>
              <div className="chart-container" style={{ 
                height: isMobile ? '500px' : '400px',
                minHeight: isMobile ? '500px' : '400px',
                marginBottom: isMobile ? '16px' : '0px'
              }}>
                {top10Data ? (
                  top10ChartType === 'Scatter' ? (
                    <Scatter 
                      data={{
                        datasets: [{
                          label: chartType,
                          data: top10Data.datasets[0].data.map((value, index) => ({
                            x: index,
                            y: value
                          })),
                          backgroundColor: top10Data.datasets[0].backgroundColor,
                          borderColor: top10Data.datasets[0].borderColor,
                          pointRadius: isMobile ? 6 : 8,
                          pointHoverRadius: isMobile ? 8 : 10
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: `Top 10 ${chartType} Products (Value Distribution) - ${selectedYear}`,
                            font: {
                              size: isMobile ? 14 : 16,
                              weight: 'bold'
                            },
                            padding: {
                              top: 10,
                              bottom: 20
                            }
                          },
                          legend: {
                            display: false
                          },
                          datalabels: {
                            display: false // Disable data labels for scatter chart
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            titleFont: {
                              size: isMobile ? 12 : 14
                            },
                            bodyFont: {
                              size: isMobile ? 11 : 13
                            },
                            callbacks: {
                              title: function(context) {
                                const label = top10Data.labels && top10Data.labels[context[0].parsed.x];
                                return isMobile && label && label.length > 25 
                                  ? label.substring(0, 25) + '...'
                                  : label;
                              },
                              label: function(context) {
                                return `${chartType}: ${formatValue(context.parsed.y)} NPR`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Product Index',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              },
                              callback: function(value) {
                                const label = top10Data.labels && top10Data.labels[value];
                                if (!label) return '';
                                return isMobile && label.length > 8 
                                  ? label.substring(0, 8) + '...'
                                  : label.substring(0, 12) + '...';
                              }
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Value (NPR)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              },
                              callback: function(value) {
                                return formatValue(value);
                              }
                            }
                          }
                        },
                        layout: {
                          padding: {
                            left: isMobile ? 5 : 10,
                            right: isMobile ? 5 : 10,
                            top: 10,
                            bottom: 10
                          }
                        }
                      }}
                    />
                  ) : (
                    <Bar 
                      data={top10Data} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y', // Horizontal bar chart for better product name readability
                        plugins: {
                          title: {
                            display: true,
                            text: `Top 10 ${chartType} Products - ${selectedYear}`,
                            font: {
                              size: isMobile ? 14 : 16,
                              weight: 'bold'
                            },
                            padding: {
                              top: 10,
                              bottom: 20
                            }
                          },
                          legend: {
                            display: false
                          },
                          datalabels: {
                            display: function(context) {
                              // Only show labels for values above a certain threshold to avoid clutter
                              const value = context.parsed ? context.parsed.x : (context.dataset.data[context.dataIndex] || 0);
                              const maxValue = Math.max(...context.dataset.data);
                              return value > maxValue * 0.05; // Show label if value is more than 5% of max
                            },
                            anchor: 'end',
                            align: 'end',
                            formatter: function(value, context) {
                              // Use the actual value from the dataset if value parameter is not reliable
                              const actualValue = context && context.parsed ? context.parsed.x : value;
                              return formatValue(actualValue);
                            },
                            color: '#374151',
                            font: {
                              size: isMobile ? 8 : 10,
                              weight: 'bold'
                            },
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderColor: '#d1d5db',
                            borderWidth: 1,
                            borderRadius: 4,
                            padding: {
                              top: 2,
                              bottom: 2,
                              left: 4,
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            titleFont: {
                              size: isMobile ? 12 : 14
                            },
                            bodyFont: {
                              size: isMobile ? 11 : 13
                            },
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed.x; // x for horizontal bars
                                return `${context.dataset.label}: ${formatValue(value)} NPR`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Value (NPR)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              },
                              callback: function(value) {
                                return formatValue(value);
                              }
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Products',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              maxRotation: 0,
                              minRotation: 0,
                              font: {
                                size: isMobile ? 10 : 11
                              },
                              callback: function(value, index) {
                                const label = this.getLabelForValue(value);
                                // Show full product names for better readability
                                if (isMobile && label && label.length > 25) {
                                  return label.substring(0, 25) + '...';
                                }
                                return label;
                              }
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
                            right: isMobile ? 5 : 10,
                            top: 10,
                            bottom: 10
                          }
                        }
                      }}
                    />
                  )
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: isMobile ? '16px' : '18px' }}>No Data Available</h3>
                      <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Loading product data or no products found for the selected criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Search Product Section */}
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
                      Search Products for Trend Analysis
                    </label>
                    <Tooltip title="Search and select a specific product to view its trade trends over time. You can analyze imports, exports, and trade patterns for individual products across different fiscal years.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '14px' }} />
                    </Tooltip>
                  </div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Search for a product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      prefix={<SearchOutlined />}
                      size={isMobile ? 'middle' : 'large'}
                    />
                    <Select
                      placeholder="Select product"
                      style={{ width: '200px' }}
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      showSearch
                      allowClear
                      size={isMobile ? 'middle' : 'large'}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {filteredProducts.map(product => (
                        <Option key={product} value={product}>{product}</Option>
                      ))}
                    </Select>
                  </Space.Compact>
                </div>
              </Col>
              {selectedProduct && (
                <Col xs={24} md={8} lg={6}>
                  <div className="control-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <label style={{
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        display: 'block',
                        color: '#374151',
                        margin: 0
                      }}>Chart Type</label>
                      <Tooltip title="Choose how to display the selected product's trend: Line Chart for continuous trend visualization or Bar Chart for period-by-period comparison.">
                        <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                      </Tooltip>
                    </div>
                    <Radio.Group
                      value={productChartType}
                      onChange={(e) => setProductChartType(e.target.value)}
                      style={{ width: '100%' }}
                      size={isMobile ? 'small' : 'middle'}
                    >
                      <Radio.Button 
                        value="Line Trend"
                        style={{
                          fontSize: isMobile ? '12px' : '14px',
                          height: isMobile ? '28px' : '32px',
                          minWidth: isMobile ? '70px' : '85px'
                        }}
                      >
                        Line
                      </Radio.Button>
                      <Radio.Button 
                        value="Bar Chart"
                        style={{
                          fontSize: isMobile ? '12px' : '14px',
                          height: isMobile ? '28px' : '32px',
                          minWidth: isMobile ? '70px' : '85px'
                        }}
                      >
                        Bar
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                </Col>
              )}
            </Row>
          </div>

          {/* Product Trend Analysis */}
          {selectedProduct && trendChartData && (
            <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              <Col xs={24}>
                <div className="chart-container" style={{ 
                  height: isMobile ? '400px' : '350px',
                  minHeight: isMobile ? '400px' : '350px'
                }}>
                  {productChartType === 'Line Trend' ? (
                    <Line 
                      data={trendChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: `${productChartType} for: ${selectedProduct.length > 25 ? selectedProduct.substring(0, 25) + '...' : selectedProduct}`,
                            font: {
                              size: isMobile ? 14 : 16,
                              weight: 'bold'
                            }
                          },
                          legend: {
                            position: 'bottom',
                            labels: {
                              font: {
                                size: isMobile ? 11 : 12
                              }
                            }
                          },
                          datalabels: {
                            display: false // Disable for line charts to avoid clutter
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            titleFont: {
                              size: isMobile ? 12 : 14
                            },
                            bodyFont: {
                              size: isMobile ? 11 : 13
                            },
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${formatValue(value)} NPR`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Fiscal Year (BS)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              }
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Value (NPR)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              },
                              callback: function(value) {
                                return formatValue(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Bar 
                      data={trendChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: `${productChartType} for: ${selectedProduct.length > 25 ? selectedProduct.substring(0, 25) + '...' : selectedProduct}`,
                            font: {
                              size: isMobile ? 14 : 16,
                              weight: 'bold'
                            }
                          },
                          legend: {
                            position: 'bottom',
                            labels: {
                              font: {
                                size: isMobile ? 11 : 12
                              }
                            }
                          },
                          datalabels: {
                            display: !isMobile,
                            anchor: 'end',
                            align: 'top',
                            color: '#333',
                            font: {
                              size: 9,
                              weight: 'bold'
                            },
                            formatter: function(value) {
                              return formatValue(value);
                            },
                            clip: false
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            titleFont: {
                              size: isMobile ? 12 : 14
                            },
                            bodyFont: {
                              size: isMobile ? 11 : 13
                            },
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${formatValue(value)} NPR`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Fiscal Year (BS)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              }
                            }
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Value (NPR)',
                              font: {
                                size: isMobile ? 12 : 14,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              font: {
                                size: isMobile ? 10 : 12
                              },
                              callback: function(value) {
                                return formatValue(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </Col>
            </Row>
          )}

          {/* Product Statistics */}
          {selectedProduct && currentProductStats && (
            <Row gutter={isMobile ? [12, 12] : [16, 16]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  minHeight: isMobile ? '80px' : '100px',
                  textAlign: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '2rem', 
                      color: '#2ECC71',
                      fontWeight: 'bold'
                    }}>
                      {formatValue(currentProductStats.imports)} NPR
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      marginTop: '4px'
                    }}>
                      Current Import Value
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  minHeight: isMobile ? '80px' : '100px',
                  textAlign: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '2rem', 
                      color: '#3498DB',
                      fontWeight: 'bold'
                    }}>
                      {formatValue(currentProductStats.exports)} NPR
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      marginTop: '4px'
                    }}>
                      Current Export Value
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  minHeight: isMobile ? '80px' : '100px',
                  textAlign: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '2rem', 
                      color: '#E74C3C',
                      fontWeight: 'bold'
                    }}>
                      {formatValue(currentProductStats.tradeBalance)} NPR
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      marginTop: '4px'
                    }}>
                      Trade Balance
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ 
                  minHeight: isMobile ? '80px' : '100px',
                  textAlign: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '2rem', 
                      color: '#9B59B6',
                      fontWeight: 'bold'
                    }}>
                      {currentProductStats.ratio}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      marginTop: '4px'
                    }}>
                      Import/Export Ratio
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDashboard;
