import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Slider, Radio, Select, Typography, Spin, message } from 'antd';
import { TrendingUpOutlined, TrendingDownOutlined, ImportOutlined, ExportOutlined, BarChartOutlined, ScaleOutlined } from '@ant-design/icons';
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

const { Option } = Select;
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
  height: 140px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  
  &.imports { background: #2ECC71; }
  &.exports { background: #3498DB; }
  &.deficit { background: #E74C3C; }
  &.ratio { background: #F8A4D5; }
  
  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

  // Sample data - replace with actual data processing
  const summaryData = useMemo(() => {
    // Mock data structure matching your Python dashboard
    const years = ['2075/76', '2076/77', '2077/78', '2078/79', '2079/80', '2080/81', '2081/82'];
    const adYears = ['2018/19', '2019/20', '2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
    
    return {
      years: yearFormat === 'BS' ? years : adYears,
      imports: [1200, 1350, 1450, 1600, 1750, 1850, 1950],
      exports: [800, 900, 950, 1050, 1150, 1200, 1300],
      tradeDeficit: [400, 450, 500, 550, 600, 650, 650],
      totalTrade: [2000, 2250, 2400, 2650, 2900, 3050, 3250],
      growthRates: {
        imports: [0, 12.5, 7.4, 10.3, 9.4, 5.7, 5.4],
        exports: [0, 12.5, 5.6, 10.5, 9.5, 4.3, 8.3],
        tradeDeficit: [0, 12.5, 11.1, 10.0, 9.1, 8.3, 0.0],
        totalTrade: [0, 12.5, 6.7, 10.4, 9.4, 5.2, 6.6]
      }
    };
  }, [yearFormat, yearRange]);

  // KPI data for current year
  const currentYearKPIs = useMemo(() => {
    const currentIndex = summaryData.years.length - 1;
    const previousIndex = currentIndex - 1;
    
    return [
      {
        title: 'Imports',
        value: '1.95B',
        growth: summaryData.growthRates.imports[currentIndex],
        previousGrowth: summaryData.growthRates.imports[previousIndex],
        icon: '📥',
        type: 'imports'
      },
      {
        title: 'Exports',
        value: '1.30B',
        growth: summaryData.growthRates.exports[currentIndex],
        previousGrowth: summaryData.growthRates.exports[previousIndex],
        icon: '📤',
        type: 'exports'
      },
      {
        title: 'Trade Deficit',
        value: '650M',
        growth: summaryData.growthRates.tradeDeficit[currentIndex],
        previousGrowth: summaryData.growthRates.tradeDeficit[previousIndex],
        icon: '📉',
        type: 'deficit'
      },
      {
        title: 'Imp/Exp Ratio',
        value: '1.50',
        growth: 2.3,
        previousGrowth: 1.8,
        icon: '⚖️',
        type: 'ratio'
      }
    ];
  }, [summaryData]);

  // Chart configuration
  const chartData = {
    labels: summaryData.years,
    datasets: [
      {
        label: 'Imports',
        data: summaryData.imports,
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
        borderColor: '#2ECC71',
        borderWidth: 2,
        type: 'bar'
      },
      {
        label: 'Exports',
        data: summaryData.exports,
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: '#3498DB',
        borderWidth: 2,
        type: 'bar'
      },
      {
        label: 'Trade Deficit',
        data: summaryData.tradeDeficit,
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: '#E74C3C',
        borderWidth: 2,
        type: 'bar'
      },
      {
        label: 'Total Trade',
        data: summaryData.totalTrade,
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: '#9B59B6',
        borderWidth: 2,
        type: 'bar'
      },
      {
        label: 'Imports Growth',
        data: summaryData.growthRates.imports,
        borderColor: '#27AE60',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        type: 'line',
        yAxisID: 'y1',
        pointRadius: 4
      },
      {
        label: 'Exports Growth',
        data: summaryData.growthRates.exports,
        borderColor: '#2980B9',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        type: 'line',
        yAxisID: 'y1',
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Nepal Trade Summary (${yearFormat})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Fiscal Year (${yearFormat})`,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Amount (in billion NPR)',
          color: '#1f77b4',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#1f77b4'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Growth Rate (%)',
          color: '#d62728',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#d62728'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Metric definitions
  const metricDefinitions = {
    'Imports': {
      points: [
        'Total value of goods/services bought from abroad.',
        'Reflects domestic demand and local production gaps.',
        'High imports can widen a trade deficit if not offset by exports.'
      ],
      link: 'https://en.wikipedia.org/wiki/Import'
    },
    'Exports': {
      points: [
        'Total value of goods/services sold to foreign markets.',
        'Indicative of global competitiveness & production capacity.',
        'Growth in exports is generally positive for GDP and currency strength.'
      ],
      link: 'https://en.wikipedia.org/wiki/Export'
    },
    'Trade Deficit': {
      points: [
        'Difference between imports and exports (Imports – Exports).',
        'A positive value indicates more imports than exports (net outflow).',
        'Financed via foreign borrowing or investment; sustained deficits may weaken currency.'
      ],
      link: 'https://en.wikipedia.org/wiki/Trade_deficit'
    },
    'Trade Balance': {
      points: [
        'The difference between a country\'s total exports and total imports over a specific period.',
        'Calculated as Exports – Imports.',
        'A positive trade balance (trade surplus) means exports exceed imports.',
        'It is a major component of a country\'s current account in the balance of payments.'
      ],
      link: 'https://en.wikipedia.org/wiki/Balance_of_trade'
    },
    'Total Trade': {
      points: [
        'Sum of imports and exports.',
        'Overall scale of a country\'s engagement in international trade.',
        'Useful to compare trade volume vs peers or over time.'
      ],
      link: 'https://en.wikipedia.org/wiki/Balance_of_trade#Total_trade'
    },
    'Import/Export Ratio': {
      points: [
        'Ratio = Imports / Exports.',
        'Shows reliance on foreign goods relative to export earnings.',
        'A rising ratio can signal growing dependency on imports.'
      ],
      link: 'https://www.tradeatlas.com/en/blog/the-ratio-of-exports-to-imports'
    }
  };

  const [selectedMetric, setSelectedMetric] = useState('Imports');

  return (
    <div>
      {/* Description */}
      <div className="description-box">
        <p style={{ fontSize: '13px' }}>
          This section provides a comprehensive analysis of Nepal's trade performance across different years. 
          Here, you can filter data range by fiscal year and visualize trends. Key performance indicators (KPIs) 
          shows trade performance of current fiscal year. Also, you can see definition of each term used in this 
          dashboard below. Explore the data to understand significant economic shifts over time.
        </p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div className="control-group">
              <label className="control-label">Fiscal Year Range</label>
              <Slider
                range
                min={2071}
                max={2081}
                value={yearRange}
                onChange={setYearRange}
                marks={{
                  2071: '2071/72',
                  2075: '2075/76',
                  2081: '2081/82'
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div className="control-group">
              <label className="control-label">Year Format</label>
              <Radio.Group value={yearFormat} onChange={(e) => setYearFormat(e.target.value)}>
                <Radio.Button value="BS">BS</Radio.Button>
                <Radio.Button value="AD">AD</Radio.Button>
              </Radio.Group>
            </div>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Chart Section */}
        <Col xs={24} lg={18}>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} height={100} />
            <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '1rem', textAlign: 'center' }}>
              Note: The growth rate data of fiscal year 2071/72 is not available, hence it is set to 0%.
            </p>
          </div>
        </Col>

        {/* KPI Section */}
        <Col xs={24} lg={6}>
          <Card 
            title="KPI: First 11 month of Fiscal Year (2081/82)" 
            size="small"
            style={{ height: 'fit-content' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentYearKPIs.map((kpi, index) => (
                <div key={index} className={`kpi-card ${kpi.type}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="kpi-icon">{kpi.icon}</div>
                      <div>
                        <div className="kpi-label">{kpi.title}</div>
                        <div className="kpi-value">{kpi.value}</div>
                      </div>
                    </div>
                    <div className={`kpi-delta ${kpi.growth > kpi.previousGrowth ? 'positive' : 'negative'}`}>
                      {kpi.growth.toFixed(2)}%{kpi.growth > kpi.previousGrowth ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Trade Metrics Reference Guide */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        margin: '1.5rem 0', 
        border: '1px solid #e5e7eb' 
      }}>
        <h3 style={{ color: '#1e40af', margin: '0 0 1rem 0', fontSize: '1.4rem', fontWeight: 600 }}>
          📊 Trade Metrics Reference Guide
        </h3>
        <p style={{ color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
          Understanding key trade indicators and their economic implications for Nepal's international commerce.
        </p>
        
        <Select
          value={selectedMetric}
          onChange={setSelectedMetric}
          style={{ width: '100%', marginBottom: '1rem' }}
          placeholder="📊 Select Trade Metric for Detailed Analysis"
        >
          {Object.keys(metricDefinitions).map(metric => (
            <Option key={metric} value={metric}>{metric}</Option>
          ))}
        </Select>

        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.02) 100%)',
          borderLeft: '4px solid #3b82f6',
          padding: '1.5rem',
          margin: '1rem 0',
          borderRadius: '0 10px 10px 0',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
        }}>
          <h4 style={{ color: '#1e40af', margin: '0 0 1rem 0', fontSize: '1.3rem', fontWeight: 600 }}>
            📋 {selectedMetric} - Comprehensive Overview
          </h4>
          
          {metricDefinitions[selectedMetric].points.map((point, index) => (
            <div key={index} style={{
              background: '#374151',
              borderLeft: '3px solid #10b981',
              padding: '0.8rem 1.2rem',
              margin: '0.5rem 0',
              borderRadius: '0 6px 6px 0'
            }}>
              <p style={{ margin: 0, color: 'white', fontWeight: 500, lineHeight: 1.6 }}>
                <span style={{ color: 'white', fontWeight: 600 }}>{index + 1}.</span> {point}
              </p>
            </div>
          ))}
          
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            border: '1px solid #fbbf24'
          }}>
            <p style={{ margin: 0, color: '#92400e', fontWeight: 500 }}>
              📚 <strong>Additional Resources:</strong>{' '}
              <a 
                href={metricDefinitions[selectedMetric].link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}
              >
                Learn more about {selectedMetric} →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
