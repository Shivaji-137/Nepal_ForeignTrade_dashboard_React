import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Input, Space, Spin, message, Radio } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Bar, Scatter, Line } from 'react-chartjs-2';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
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
} from '../utils/productDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TreemapController,
  TreemapElement
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
    
    let chartData;
    if (top10ChartType === 'Treemap') {
      chartData = prepareTreemapData(topProducts, chartType);
    } else {
      chartData = prepareChartData(topProducts, chartType);
    }
    
    // Debug logging
    console.log('ProductDashboard - currentYearData length:', currentYearData.length);
    console.log('ProductDashboard - topProducts:', topProducts);
    console.log('ProductDashboard - chartData:', chartData);
    
    return chartData;
  }, [currentYearData, chartType, top10ChartType]);

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
          <div className="description-box">
            <p style={{ fontSize: '13px' }}>
              Explore Nepal's trade in specific products and commodities. View top 10 traded products by value, 
              analyze trends over time, and search for specific products to see detailed trade patterns. 
              Use the controls below to switch between different views and time periods.
            </p>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <div className="control-group">
                  <label className="control-label">Fiscal Year</label>
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
                  <label className="control-label">Analysis Type</label>
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
                  <label className="control-label">Chart Type</label>
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
                        minWidth: isMobile ? '60px' : '80px'
                      }}
                    >
                      Bar
                    </Radio.Button>
                    <Radio.Button 
                      value="Treemap"
                      style={{
                        fontSize: isMobile ? '12px' : '14px',
                        height: isMobile ? '28px' : '32px',
                        minWidth: isMobile ? '70px' : '90px'
                      }}
                    >
                      Treemap
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Col>
            </Row>
          </div>

          <p>Top 10 chart would be rendered here based on top10ChartType</p>
          <p>Rest of the component would continue...</p>
        </>
      )}
    </div>
  );
};

export default ProductDashboard;
