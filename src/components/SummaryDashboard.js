import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Slider, Radio, Typography, Spin, message, Button } from 'antd';
import { FallOutlined, ImportOutlined, ExportOutlined, BarChartOutlined, SwapOutlined } from '@ant-design/icons';
import styled from 'styled-components';
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
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
  loadSummaryData,
  loadGrowthData,
  filterDataByYearRange,
  calculateKPICards,
  prepareChartData,
  getYearRange
} from '../utils/excelDataService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const { Text, Paragraph } = Typography;

// Styled components
const InfoCard = styled(Card)`
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-left: 6px solid #1f77b4;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .ant-card-body {
    padding: 15px;
  }
`;

const InfoText = styled(Paragraph)`
  color: white;
  font-weight: 600;
  font-size: 13px;
  margin: 0;
  font-family: 'Inter', sans-serif;
`;

const KPICard = styled(Card)`
  height: 100px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-bottom: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &.imports { background: #2ECC71; }
  &.exports { background: #3498DB; }
  &.deficit { background: #E74C3C; }
  &.ratio { background: #F8A4D5; }
  
  .ant-card-body {
    padding: 8px 12px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    height: 95px;
    
    .ant-card-body {
      padding: 8px 6px;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      gap: 4px;
    }
  }

  @media (min-width: 992px) {
    height: 100px;
    display: flex;
    flex-direction: column;
  }
`;

const KPIContent = styled.div`
  display: flex;
  align-items: center;
  color: white;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    justify-content: center;
    margin-bottom: 2px;
  }
`;

const KPIIcon = styled.div`
  font-size: 24px;
  margin-right: 8px;
  line-height: 1;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-right: 6px;
  }
`;

const KPIText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const KPILabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 2px;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 9px;
    margin-bottom: 1px;
  }
`;

const KPIValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const KPIDelta = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.positive ? '#ffffff' : '#ffffff'};
  background: ${props => props.positive ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)'};
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid ${props => props.positive ? '#2ecc71' : '#e74c3c'};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 2px 4px;
    margin: 0 auto;
    display: block;
    width: fit-content;
  }
`;

const SummaryDashboard = ({ onNavigate }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [filteredSummaryData, setFilteredSummaryData] = useState([]);
  const [filteredGrowthData, setFilteredGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearRange, setYearRange] = useState(['2079/80', '2081/82']);
  const [yearFormat, setYearFormat] = useState('BS');
  const [availableYears, setAvailableYears] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
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
        const [summary, growth] = await Promise.all([
          loadSummaryData(),
          loadGrowthData()
        ]);
        
        setSummaryData(summary);
        setGrowthData(growth);
        
        // Set up available years for slider
        const yearInfo = getYearRange(summary);
        const years = yearInfo.options || [];
        setAvailableYears(years);
        
        // Validate and set initial year range
        let validStartYear = yearRange[0];
        let validEndYear = yearRange[1];
        
        if (years.length > 0) {
          // If our default years don't exist in data, use the available range
          if (!years.includes(validStartYear)) {
            validStartYear = years[Math.max(0, years.length - 3)]; // Default to 3rd last year
          }
          if (!years.includes(validEndYear)) {
            validEndYear = years[years.length - 1]; // Default to last year
          }
          setYearRange([validStartYear, validEndYear]);
        }
        
        // Initially filter data to show default range
        const defaultFiltered = filterDataByYearRange(summary, validStartYear, validEndYear);
        const defaultGrowthFiltered = filterDataByYearRange(growth, validStartYear, validEndYear);
        setFilteredSummaryData(defaultFiltered);
        setFilteredGrowthData(defaultGrowthFiltered);
        
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Failed to load data from Excel files');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter data when year range changes
  useEffect(() => {
    if (summaryData.length && growthData.length) {
      const filteredSummary = filterDataByYearRange(summaryData, yearRange[0], yearRange[1]);
      const filteredGrowth = filterDataByYearRange(growthData, yearRange[0], yearRange[1]);
      setFilteredSummaryData(filteredSummary);
      setFilteredGrowthData(filteredGrowth);
    }
  }, [yearRange, summaryData, growthData]);

  // Calculate KPI cards
  const kpiCards = calculateKPICards(filteredSummaryData, filteredGrowthData);

  // Prepare chart data
  const chartData = prepareChartData(filteredSummaryData, filteredGrowthData, yearFormat);

  // Format Y-axis values with shortcuts
  const formatAxisValue = (value) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1000000000000) {
      return `${sign}${(absValue / 1000000000000).toFixed(1)}T`;
    } else if (absValue >= 1000000000) {
      return `${sign}${(absValue / 1000000000).toFixed(1)}B`;
    } else if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(1)}K`;
    } else {
      return value.toString();
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: isMobile ? 'Nepal Trade Summary' : 'Nepal Trade Summary: Values and Growth Rates',
        font: {
          size: isMobile ? 14 : 16
        }
      },
      datalabels: {
        display: false // Explicitly disable data labels in Summary Dashboard
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            
            // Check if this is a growth rate (percentage) or value
            if (context.dataset.yAxisID === 'y1') {
              // Growth rate - show as percentage
              label += context.parsed.y.toFixed(1) + '%';
            } else {
              // Value - format with B/M/T/K rounded to 3 decimal places
              const value = context.parsed.y;
              const absValue = Math.abs(value);
              const sign = value < 0 ? '-' : '';
              
              if (absValue >= 1000000000000) {
                label += `${sign}${(absValue / 1000000000000).toFixed(3)}T`;
              } else if (absValue >= 1000000000) {
                label += `${sign}${(absValue / 1000000000).toFixed(3)}B`;
              } else if (absValue >= 1000000) {
                label += `${sign}${(absValue / 1000000).toFixed(3)}M`;
              } else if (absValue >= 1000) {
                label += `${sign}${(absValue / 1000).toFixed(3)}K`;
              } else {
                label += value.toFixed(3);
              }
            }
            
            return label;
          },
          afterLabel: function(context) {
            // Add NPR currency for value datasets
            if (context.dataset.yAxisID !== 'y1') {
              return 'NPR';
            }
            return null;
          }
        },
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: isMobile ? 45 : 0,
          font: {
            size: isMobile ? 9 : 11
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: isMobile ? 'NPR' : 'Amount (NPR)',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        ticks: {
          callback: function(value) {
            return formatAxisValue(value);
          },
          font: {
            size: isMobile ? 9 : 11
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: isMobile ? '%' : 'Growth Rate (%)',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + '%';
          },
          font: {
            size: isMobile ? 9 : 11
          }
        }
      },
    },
  };

  const getKPIIcon = (label) => {
    switch (label) {
      case 'Imports': return <ImportOutlined />;
      case 'Exports': return <ExportOutlined />;
      case 'Trade Deficit': return <FallOutlined />;
      case 'Imp/Exp Ratio': return <SwapOutlined />;
      default: return <BarChartOutlined />;
    }
  };

  const getKPIClass = (label) => {
    switch (label) {
      case 'Imports': return 'imports';
      case 'Exports': return 'exports';
      case 'Trade Deficit': return 'deficit';
      case 'Imp/Exp Ratio': return 'ratio';
      default: return 'imports';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '12px' : '24px',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Information Card */}
      <InfoCard>
        <InfoText>
          This section provides a comprehensive analysis of Nepal's trade performance across different years. Here, you can filter data range by fiscal year and visualize trends. Key performance indicators (KPIs) shows trade performance of current fiscal year. Also, you can see definition of each term used in this dashboard below. Explore the data to understand significant economic shifts over time.
        </InfoText>
      </InfoCard>

      {/* KPI Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Text strong style={{ fontSize: '14px', marginBottom: '16px', display: 'block' }}>
          KPI: First 11 month of Fiscal Year (2081/82) in comparison with previous year
        </Text>
        <Row gutter={[8, 8]}>
          {kpiCards.map((card, index) => (
            <Col xs={12} sm={6} md={6} lg={6} key={index}>
              <KPICard className={getKPIClass(card.label)} style={{ width: '100%' }}>
                <KPIContent>
                  <KPIIcon>
                    {getKPIIcon(card.label)}
                  </KPIIcon>
                  <KPIText>
                    <KPILabel>{card.label}</KPILabel>
                    <KPIValue>{card.value}</KPIValue>
                  </KPIText>
                </KPIContent>
                <KPIDelta positive={card.deltaColor === 'green'}>
                  {card.delta}
                </KPIDelta>
              </KPICard>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Year Range Selector */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="top">
          <Col xs={24} sm={24} md={14} lg={14}>
            <Text strong>Select Fiscal Year Range:</Text>
            <div style={{ marginTop: '12px', marginRight: '20px' }}>
              <Slider
                range
                value={availableYears.length > 0 ? [
                  Math.max(0, availableYears.indexOf(yearRange[0])),
                  Math.max(0, availableYears.indexOf(yearRange[1]))
                ] : [0, 1]}
                min={0}
                max={Math.max(1, availableYears.length - 1)}
                disabled={loading || availableYears.length === 0}
                onChange={(values) => {
                  if (availableYears.length === 0) return;
                  // Only allow changing the left handle (start year)
                  // Keep the right handle (end year) fixed at the latest year
                  const fixedEndIndex = availableYears.length - 1;
                  const startIndex = Math.min(values[0], fixedEndIndex);
                  setYearRange([availableYears[startIndex], availableYears[fixedEndIndex]]);
                }}
                marks={availableYears.length > 0 ? availableYears.reduce((acc, year, index) => {
                  // On mobile, show fewer marks to prevent overlap
                  if (isMobile) {
                    // Show only every other year on mobile
                    if (index % 2 === 0 || index === 0 || index === availableYears.length - 1) {
                      acc[index] = year.split('/')[0]; // Show only first part of year
                    }
                  } else {
                    acc[index] = year;
                  }
                  return acc;
                }, {}) : {}}
                step={1}
                handleStyle={[
                  { backgroundColor: '#1890ff', borderColor: '#1890ff' }, // Left handle (movable)
                  { backgroundColor: '#d9d9d9', borderColor: '#d9d9d9', cursor: 'not-allowed' } // Right handle (fixed)
                ]}
              />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Selected: {yearRange[0]} to {yearRange[1]}
            </div>
          </Col>
          <Col xs={24} sm={24} md={10} lg={10}>
            <Text strong>Year Format:</Text>
            <Radio.Group 
              value={yearFormat} 
              onChange={(e) => setYearFormat(e.target.value)}
              style={{ marginTop: '8px', width: '100%' }}
            >
              <Radio.Button value="BS" style={{ width: '50%', textAlign: 'center' }}>BS</Radio.Button>
              <Radio.Button value="AD" style={{ width: '50%', textAlign: 'center' }}>AD</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Chart Section */}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Card 
            title="Trade Summary: Values and Growth Rates"
            style={{ minHeight: '450px' }}
          >
            <div style={{ height: '350px' }}>
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Note: The growth rate data of fiscal year 2071/72 is not available, hence it is set to 0%.
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Footer Section with Learning Resources */}
      <Card style={{ 
        marginTop: '32px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
            � Want to Learn More?
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Text style={{ color: '#475569', fontSize: '14px' }}>
              Understand key trade terms like <strong>Import</strong>, <strong>Export</strong>, <strong>Trade Balance</strong>, 
              <strong> Trade Deficit</strong>, <strong>Imp/Exp Ratio</strong>, <strong>Import Revenue</strong>, 
              <strong> Custom Tariff</strong>, <strong>Custom Office</strong>, and more.
            </Text>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Button 
              type="link"
              onClick={() => onNavigate && onNavigate('about')} 
              style={{ 
                color: '#1890ff', 
                fontWeight: '600',
                fontSize: '14px',
                padding: 0
              }}
            >
              Visit About Section →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SummaryDashboard;
