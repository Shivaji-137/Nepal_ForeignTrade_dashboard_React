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

const KPIContent = styled.div`
  display: flex;
  align-items: center;
  color: white;
`;

const KPIIcon = styled.div`
  font-size: 32px;
  margin-right: 12px;
  line-height: 1;
`;

const KPIText = styled.div`
  display: flex;
  flex-direction: column;
`;

const KPILabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const KPIValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
`;

const KPIDelta = styled.div`
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: ${props => props.positive ? '#27AE60' : '#E74C3C'};
  align-self: flex-end;
`;

const MetricCard = styled(Card)`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  margin: 24px 0;
  border: 1px solid #e5e7eb;
`;

const MetricTitle = styled.h3`
  color: #1e40af;
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 600;
`;

const MetricSubtitle = styled.p`
  color: #64748b;
  margin: 0;
  line-height: 1.6;
`;

const MetricDefinition = styled(Card)`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.02) 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 0 10px 10px 0;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
`;

const MetricPoint = styled.div`
  background: #374151;
  border-left: 3px solid #10b981;
  padding: 12px 18px;
  margin: 8px 0;
  border-radius: 0 6px 6px 0;
  
  p {
    margin: 0;
    color: white;
    font-weight: 500;
    line-height: 1.6;
  }
`;

const ReferenceCard = styled(Card)`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid #fbbf24;
  
  p {
    margin: 0;
    color: #92400e;
    font-weight: 500;
  }
  
  a {
    color: #dc2626;
    text-decoration: none;
    font-weight: 600;
  }
`;

const SummaryDashboard = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [filteredSummaryData, setFilteredSummaryData] = useState([]);
  const [filteredGrowthData, setFilteredGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearRange, setYearRange] = useState(['2075/76', '2081/82']);
  const [yearFormat, setYearFormat] = useState('BS');
  const [selectedMetric, setSelectedMetric] = useState('Imports');
  const [availableYears, setAvailableYears] = useState([]);

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
        setAvailableYears(yearInfo.options);
        setYearRange([yearInfo.min, yearInfo.max]);
        
        // Initially filter data to show default range
        const defaultFiltered = filterDataByYearRange(summary, yearInfo.min, yearInfo.max);
        const defaultGrowthFiltered = filterDataByYearRange(growth, yearInfo.min, yearInfo.max);
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

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Nepal Trade Summary: Values and Growth Rates',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Value (Rs. in 000s)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Growth Rate (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Metric definitions
  const metricDefinitions = {
    "Imports": {
      points: [
        "Total value of goods/services bought from abroad.",
        "Reflects domestic demand and local production gaps.",
        "High imports can widen a trade deficit if not offset by exports.",
      ],
      link: "https://en.wikipedia.org/wiki/Import"
    },
    "Exports": {
      points: [
        "Total value of goods/services sold to foreign markets.",
        "Indicative of global competitiveness & production capacity.",
        "Growth in exports is generally positive for GDP and currency strength.",
      ],
      link: "https://en.wikipedia.org/wiki/Export"
    },
    "Trade Deficit": {
      points: [
        "Difference between imports and exports (Imports – Exports).",
        "A positive value indicates more imports than exports (net outflow).",
        "Financed via foreign borrowing or investment; sustained deficits may weaken currency.",
      ],
      link: "https://en.wikipedia.org/wiki/Trade_deficit"
    },
    "Trade Balance": {
      points: [
        "The difference between a country's total exports and total imports over a specific period.",
        "Calculated as Exports – Imports.",
        "A positive trade balance (trade surplus) means exports exceed imports; a negative balance (trade deficit) means imports exceed exports.",
        "It is a major component of a country's current account in the balance of payments."
      ],
      link: "https://en.wikipedia.org/wiki/Balance_of_trade"
    },
    "Total Trade": {
      points: [
        "Sum of imports and exports.",
        "Overall scale of a country's engagement in international trade.",
        "Useful to compare trade volume vs peers or over time.",
      ],
      link: "https://en.wikipedia.org/wiki/Balance_of_trade#Total_trade"
    },
    "Import/Export Ratio": {
      points: [
        "Ratio = Imports / Exports.",
        "Shows reliance on foreign goods relative to export earnings.",
        "A rising ratio can signal growing dependency on imports.",
      ],
      link: "https://www.tradeatlas.com/en/blog/the-ratio-of-exports-to-imports"
    }
  };

  const getKPIIcon = (label) => {
    switch (label) {
      case 'Imports': return <ImportOutlined />;
      case 'Exports': return <ExportOutlined />;
      case 'Trade Deficit': return <TrendingDownOutlined />;
      case 'Imp/Exp Ratio': return <ScaleOutlined />;
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
    <div style={{ padding: '24px' }}>
      {/* Information Card */}
      <InfoCard>
        <InfoText>
          This section provides a comprehensive analysis of Nepal's trade performance across different years. Here, you can filter data range by fiscal year and visualize trends. Key performance indicators (KPIs) shows trade performance of current fiscal year. Also, you can see definition of each term used in this dashboard below. Explore the data to understand significant economic shifts over time.
        </InfoText>
      </InfoCard>

      {/* Year Range Selector */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Text strong>Select Fiscal Year Range:</Text>
            <Slider
              range
              value={[availableYears.indexOf(yearRange[0]), availableYears.indexOf(yearRange[1])]}
              min={0}
              max={availableYears.length - 1}
              onChange={(values) => {
                setYearRange([availableYears[values[0]], availableYears[values[1]]]);
              }}
              marks={availableYears.reduce((acc, year, index) => {
                acc[index] = year;
                return acc;
              }, {})}
              step={1}
            />
          </Col>
          <Col span={12}>
            <Text strong>Year Format:</Text>
            <Radio.Group 
              value={yearFormat} 
              onChange={(e) => setYearFormat(e.target.value)}
              style={{ marginLeft: '12px' }}
            >
              <Radio.Button value="BS">BS</Radio.Button>
              <Radio.Button value="AD">AD</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Chart Section */}
        <Col xs={24} lg={18}>
          <Card 
            title="Trade Summary: Values and Growth Rates"
            style={{ height: '500px' }}
          >
            <div style={{ height: '400px' }}>
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Note: The growth rate data of fiscal year 2071/72 is not available, hence it is set to 0%.
            </Text>
          </Card>
        </Col>

        {/* KPI Section */}
        <Col xs={24} lg={6}>
          <Text strong style={{ fontSize: '16px', marginBottom: '16px', display: 'block' }}>
            KPI: First 11 month of Fiscal Year (2081/82) in comparison with previous year
          </Text>
          {kpiCards.map((card, index) => (
            <KPICard key={index} className={getKPIClass(card.label)}>
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
          ))}
        </Col>
      </Row>

      {/* Trade Metrics Reference Section */}
      <MetricCard>
        <MetricTitle>📊 Trade Metrics Reference Guide</MetricTitle>
        <MetricSubtitle>
          Understanding key trade indicators and their economic implications for Nepal's international commerce.
        </MetricSubtitle>
      </MetricCard>

      <Card>
        <Select
          value={selectedMetric}
          onChange={setSelectedMetric}
          style={{ width: '100%', marginBottom: '16px' }}
          placeholder="🔍 Select Trade Metric for Detailed Analysis"
        >
          {Object.keys(metricDefinitions).map(metric => (
            <Option key={metric} value={metric}>{metric}</Option>
          ))}
        </Select>

        <MetricDefinition>
          <Text strong style={{ color: '#1e40af', fontSize: '18px' }}>
            📋 {selectedMetric} - Comprehensive Overview
          </Text>
        </MetricDefinition>

        {metricDefinitions[selectedMetric]?.points.map((point, index) => (
          <MetricPoint key={index}>
            <p><strong>{index + 1}.</strong> {point}</p>
          </MetricPoint>
        ))}

        <ReferenceCard>
          <p>
            📚 <strong>Additional Resources:</strong>{' '}
            <a 
              href={metricDefinitions[selectedMetric]?.link} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Learn more about {selectedMetric} →
            </a>
          </p>
        </ReferenceCard>
      </Card>
    </div>
  );
};

export default SummaryDashboard;
