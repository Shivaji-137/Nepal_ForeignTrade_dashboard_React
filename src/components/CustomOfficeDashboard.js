import React, { useState, useMemo, useEffect } from 'react';
import { Select, Row, Col, Spin, message, Radio, Card, Tooltip } from 'antd';
import { EnvironmentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  loadCustomOfficeData,
  getAvailableYearsForDropdown,
  selectCustomOfficeYearData,
  getTopCustomOffices,
  getCustomOfficeTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData
} from '../utils/customOfficeDataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const { Option } = Select;

// Custom Office coordinates in Nepal
const getCustomOfficeCoordinates = (officeName) => {
  const officeCoordinates = {
    // Major border points and custom offices
    'Birgunj': [27.0067, 84.8728],
    'Biratnagar': [26.4525, 87.2718],
    'Bhairahawa': [27.5094, 83.4542],
    'Nepalgunj': [28.0504, 81.6176],
    'Kakarbhitta': [26.6520, 88.1439],
    'Kodari': [27.9667, 85.9167],
    'Rasuwa': [28.1636, 85.3228],
    'Tatopani': [27.9667, 85.9167],
    'Mahendranagar': [28.9644, 80.1847],
    'Dhangadhi': [28.6833, 80.5833],
    'Kanchanpur': [28.8417, 80.1556],
    'Janakpur': [26.7288, 85.9256],
    'Rajbiraj': [26.5423, 86.7378],
    'Siraha': [26.6586, 86.2106],
    'Gaur': [26.7667, 85.2667],
    'Jaleshwar': [26.6500, 85.8000],
    'Malangawa': [26.8500, 85.5667],
    'Raxaul': [26.9833, 84.8500],
    'Thankot': [27.6833, 85.2000],
    'Tribhuvan International Airport': [27.6966, 85.3591],
    'TI_AIRPORT': [27.6966, 85.3591],
    'TI AIRPORT': [27.6966, 85.3591],
    'Gautam Buddha Airport': [27.5058, 83.4165],
    'Pokhara Airport': [28.2009, 83.9821],
    'Simara Airport': [27.1594, 84.9806],
    'Chandragadhi': [26.5631, 87.1789],
    'Jhapa': [26.6500, 87.9000],
    'Morang': [26.6500, 87.2000],
    'Sunsari': [26.6270, 87.1780],
    'Saptari': [26.6000, 86.9000],
    'Udayapur': [26.8500, 86.5500],
    'Khotang': [27.2000, 86.8000],
    'Bhojpur': [27.1667, 87.0500],
    'Dhankuta': [26.9833, 87.3333],
    'Terhathum': [27.1167, 87.4667],
    'Panchthar': [27.2000, 87.6000],
    'Ilam': [26.9000, 87.9000],
    'Taplejung': [27.3500, 87.6667],
    'Sankhuwasabha': [27.6000, 87.3000],
    'Solukhumbu': [27.7000, 86.7000],
    'Okhaldhunga': [27.3167, 86.5000],
    'Sarlahi': [26.9000, 85.5500],
    'Mahottari': [26.8000, 85.7500],
    'Dhanusa': [26.7500, 85.9500],
    'Bara': [27.0500, 84.9000],
    'Parsa': [27.1000, 84.9500],
    'Chitwan': [27.5833, 84.5000],
    'Makwanpur': [27.4333, 85.0333],
    'Lalitpur': [27.6667, 85.3333],
    'Bhaktapur': [27.6833, 85.4167],
    'Kathmandu': [27.7167, 85.3167],
    'Kavrepalanchok': [27.5833, 85.5667],
    'Sindhupalchok': [27.8333, 85.6833],
    'Dolakha': [27.6667, 86.1667],
    'Ramechhap': [27.3333, 86.0833],
    'Sindhuli': [27.2500, 85.9667],
    'Nuwakot': [27.9167, 85.1667],
    'Dhading': [27.8667, 84.9000],
    'Gorkha': [28.0000, 84.6167],
    'Lamjung': [28.2333, 84.3833],
    'Tanahun': [27.9167, 84.2500],
    'Syangja': [27.8667, 83.8667],
    'Kaski': [28.2000, 83.9833],
    'Manang': [28.6667, 84.0167],
    'Mustang': [28.9833, 83.8000],
    'Myagdi': [28.6000, 83.5667],
    'Parbat': [28.2333, 83.6833],
    'Baglung': [28.2667, 83.5833],
    'Gulmi': [28.0833, 83.2167],
    'Palpa': [27.8667, 83.5500],
    'Nawalparasi': [27.6167, 83.9167],
    'Rupandehi': [27.5833, 83.4500],
    'Kapilvastu': [27.5500, 83.0500],
    'Arghakhanchi': [27.9500, 83.1167],
    'Pyuthan': [28.1000, 82.8167],
    'Rolpa': [28.2833, 82.6167],
    'Rukum': [28.6000, 82.5500],
    'Salyan': [28.3833, 82.1667],
    'Dang': [28.0167, 82.3000],
    'Banke': [28.1500, 81.6167],
    'Bardiya': [28.3333, 81.4167],
    'Surkhet': [28.6000, 81.6167],
    'Dailekh': [28.8500, 81.7167],
    'Jajarkot': [28.7000, 82.1500],
    'Dolpa': [29.0000, 82.8167],
    'Jumla': [29.2667, 82.1667],
    'Kalikot': [29.1000, 81.2167],
    'Mugu': [29.6833, 82.0833],
    'Humla': [30.1167, 81.5167],
    'Bajura': [29.5500, 81.6667],
    'Bajhang': [29.5333, 81.2000],
    'Achham': [29.2667, 81.1333],
    'Doti': [29.2667, 80.9833],
    'Kailali': [28.4167, 80.7667],
    'Dadeldhura': [29.3000, 80.5833],
    'Baitadi': [29.5333, 80.4667],
    'Darchula': [29.8500, 80.5500],
    
    // Additional custom offices from data
    'chobhar': [27.6167, 85.2667], // Near Kathmandu
    'Chobhar': [27.6167, 85.2667],
    'maheshpaur': [26.8000, 85.1500], // Bara district
    'Maheshpaur': [26.8000, 85.1500],
    'krishnanagar': [26.9000, 85.0500], // Kapilvastu district
    'Krishnanagar': [26.9000, 85.0500],
    'pasupatinagar': [26.8000, 88.1000], // Ilam district, border with India
    'Pasupatinagar': [26.8000, 88.1000],
    'SATI': [28.4167, 80.7667], // Kailali district
    'Sati': [28.4167, 80.7667],
    'sati': [28.4167, 80.7667],
    'Suthauli': [26.7500, 85.9000], // Central region
    'suthauli': [26.7500, 85.9000],
    'thadhi': [26.8500, 85.8500], // Central region
    'Thadhi': [26.8500, 85.8500],
    'triveni': [27.4000, 83.5000], // Nawalparasi district
    'Triveni': [27.4000, 83.5000],
    'jaleshwor': [26.6500, 85.8000], // Mahottari district
    'Jaleshwor': [26.6500, 85.8000],
    'bhadrapur': [26.5631, 87.8500], // Jhapa district, near airport
    'Bhadrapur': [26.5631, 87.8500]
  };

  // Normalize office name for lookup
  const normalizedName = officeName?.trim();
  
  // Direct lookup
  if (officeCoordinates[normalizedName]) {
    return officeCoordinates[normalizedName];
  }
  
  // Try partial matching for variations
  for (const [name, coords] of Object.entries(officeCoordinates)) {
    if (normalizedName && (
      normalizedName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(normalizedName.toLowerCase())
    )) {
      return coords;
    }
  }
  
  return null;
};

// Nepal Map Component
const NepalMap = ({ customOfficeData, analysisType, isMobile, selectedOffice }) => {
  // Prepare map data with rankings
  const mapOffices = React.useMemo(() => {
    if (!customOfficeData.length) return [];
    
    return customOfficeData
      .map(office => {
        const officeName = office.Custom_offices || office.custom_offices || office.Office || office.office;
        const coords = getCustomOfficeCoordinates(officeName);
        
        let value;
        switch (analysisType) {
          case 'Import':
            value = office.imports || 0;
            break;
          case 'Export':
            value = office.exports || 0;
            break;
          case 'Trade Balance':
            value = office.tradeBalance || 0;
            break;
          default:
            value = office.totalTrade || 0;
        }
        
        return coords ? {
          name: officeName,
          coordinates: coords,
          value,
          formattedValue: formatValue(value),
          ...office
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value)
      .map((office, index) => ({ ...office, rank: index + 1 }));
  }, [customOfficeData, analysisType]);

  // Create custom marker icons based on rank and selection
  const createOfficeMarker = (office) => {
    const isSelected = selectedOffice && office.name === selectedOffice;
    const isAirport = office.name && (
      office.name.toLowerCase().includes('airport') ||
      office.name.toLowerCase().includes('tribhuvan') ||
      office.name.toLowerCase().includes('gautam buddha') ||
      office.name.toLowerCase().includes('pokhara airport') ||
      office.name.toLowerCase().includes('simara airport')
    );
    
    if (isAirport) {
      // Special airplane icon for airports
      let size = isSelected ? 40 : (office.rank <= 3 ? 36 : 32);
      let color = isSelected ? '#FF6B35' : (office.rank <= 3 ? '#FF6B6B' : '#42A5F5');
      
      return L.divIcon({
        className: 'airport-marker',
        html: `
          <div style="
            color: ${color};
            font-size: ${size}px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${isSelected ? 'animation: selectedAirportPulse 2s infinite;' : office.rank <= 3 ? 'animation: topAirportPulse 3s infinite;' : ''}
          ">
            ✈️
          </div>
          <style>
            @keyframes selectedAirportPulse {
              0%, 100% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.1) rotate(-5deg); }
              50% { transform: scale(1.15) rotate(0deg); }
              75% { transform: scale(1.1) rotate(5deg); }
            }
            @keyframes topAirportPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
      });
    } else {
      // Regular circular markers for other offices
      let backgroundColor, size, fontSize;
      
      if (isSelected) {
        // Highlighted selected office
        backgroundColor = 'linear-gradient(45deg, #FF6B35, #DC143C)';
        size = 40;
        fontSize = 12;
      } else if (office.rank <= 3) {
        // Top 3 offices
        backgroundColor = 'linear-gradient(45deg, #FF6B6B, #4ECDC4)';
        size = 32;
        fontSize = 10;
      } else if (office.rank <= 10) {
        // Top 4-10 offices
        backgroundColor = 'linear-gradient(45deg, #FFA726, #FF7043)';
        size = 28;
        fontSize = 9;
      } else {
        // Other offices
        backgroundColor = 'linear-gradient(45deg, #42A5F5, #26C6DA)';
        size = 24;
        fontSize = 8;
      }
      
      return L.divIcon({
        className: 'custom-office-marker',
        html: `
          <div style="
            background: ${backgroundColor};
            color: white;
            border-radius: 50%;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${fontSize}px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ${isSelected ? 'animation: selectedPulse 2s infinite;' : office.rank <= 5 ? 'animation: topOfficePulse 3s infinite;' : ''}
          ">
            ${office.rank}
          </div>
          <style>
            @keyframes selectedPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 2px 6px rgba(255, 107, 53, 0.5); }
              50% { transform: scale(1.15); box-shadow: 0 4px 12px rgba(255, 107, 53, 0.8); }
            }
            @keyframes topOfficePulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        popupAnchor: [0, -size/2]
      });
    }
  };

  return (
    <MapContainer
      center={[28.3949, 84.1240]} // Center of Nepal
      zoom={isMobile ? 6 : 7}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={!isMobile}
      maxBounds={[[26.3, 80.0], [30.5, 88.3]]} // Restrict to Nepal bounds
      maxBoundsViscosity={1.0}
    >
      {/* Base satellite layer with reduced opacity to focus on Nepal */}
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.8}
      />
      
      {/* Terrain overlay focused on Nepal region */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        opacity={0.6}
      />
      
      {/* Nepal boundary overlay to highlight the country */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.3}
      />
      
      {/* Custom Office Markers */}
      {mapOffices.map((office) => {
        const isAirport = office.name && (
          office.name.toLowerCase().includes('airport') ||
          office.name.toLowerCase().includes('tribhuvan') ||
          office.name.toLowerCase().includes('gautam buddha') ||
          office.name.toLowerCase().includes('pokhara airport') ||
          office.name.toLowerCase().includes('simara airport')
        );
        
        return (
          <Marker
            key={`${office.name}-${office.rank}`}
            position={[office.coordinates[0], office.coordinates[1]]}
            icon={createOfficeMarker(office)}
          >
            <Popup>
              <div style={{ textAlign: 'center', minWidth: '200px' }}>
                <strong style={{ 
                  fontSize: '16px', 
                  color: office.rank <= 3 ? '#FF6B6B' : 
                         office.rank <= 10 ? '#FFA726' : '#42A5F5'
                }}>
                  {isAirport ? '✈️ ' : ''}#{office.rank} {office.name}
                </strong>
                <br />
                <div style={{ margin: '8px 0', fontSize: '14px', textAlign: 'left' }}>
                  <div><strong>Imports:</strong> {formatValue(office.imports || 0)} NPR</div>
                  <div><strong>Exports:</strong> {formatValue(office.exports || 0)} NPR</div>
                  <div><strong>Trade Balance:</strong> {formatValue(office.tradeBalance || 0)} NPR</div>
                  <div><strong>Total Trade:</strong> {formatValue(office.totalTrade || 0)} NPR</div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  {isAirport ? '✈️ Airport Customs Office' :
                   office.rank <= 3 ? '🥇 Top 3 custom office' :
                   office.rank <= 10 ? '🥈 Top 10 custom office' :
                   `Rank ${office.rank} custom office`}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  Current analysis: {analysisType}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

const CustomOfficeDashboard = ({ data }) => {
  const [allCustomOfficeData, setAllCustomOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2081/082');
  const [analysisType, setAnalysisType] = useState('Import');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [officeChartType, setOfficeChartType] = useState('Line Trend'); // New state for office chart type
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

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
        const customOfficeData = await loadCustomOfficeData();
        setAllCustomOfficeData(customOfficeData);
        
        const years = getAvailableYearsForDropdown(customOfficeData);
        setAvailableYears(years);
        
        // Set default year to the latest available
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error loading custom office data:', error);
        message.error('Failed to load custom office data from Excel files');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process current year data
  const currentYearData = useMemo(() => {
    if (!allCustomOfficeData.length || !selectedYear) return [];
    return selectCustomOfficeYearData(allCustomOfficeData, selectedYear);
  }, [allCustomOfficeData, selectedYear]);

  // Get top 10 custom offices based on analysis type
  const top10Data = useMemo(() => {
    if (!currentYearData.length) return null;
    
    const topOffices = getTopCustomOffices(currentYearData, analysisType, 10);
    const chartData = prepareChartData(topOffices, analysisType);
    
    console.log('CustomOfficeDashboard - currentYearData length:', currentYearData.length);
    console.log('CustomOfficeDashboard - topOffices:', topOffices);
    console.log('CustomOfficeDashboard - chartData:', chartData);
    
    return chartData;
  }, [currentYearData, analysisType]);

  // Get all office names for search
  const allOffices = useMemo(() => {
    if (!allCustomOfficeData.length) return [];
    return allCustomOfficeData.map(item => 
      item.Custom_offices || item.custom_offices || item.Office || item.office
    ).filter(Boolean);
  }, [allCustomOfficeData]);

  // Get trend data for selected office
  const trendData = useMemo(() => {
    if (!selectedOffice || !allCustomOfficeData.length) return null;
    
    console.log('Getting trend data for office:', selectedOffice);
    const data = getCustomOfficeTrendData(allCustomOfficeData, selectedOffice);
    console.log('Trend data result:', data);
    
    return data;
  }, [selectedOffice, allCustomOfficeData]);

  // Prepare trend chart data
  const trendChartData = useMemo(() => {
    if (!trendData) return null;
    
    console.log('Preparing trend chart data from:', trendData);
    
    let chartData;
    if (officeChartType === 'Line Trend') {
      chartData = prepareTrendChartData(trendData);
    } else {
      chartData = prepareTrendBarChartData(trendData);
    }
    
    console.log('Trend chart data result:', chartData);
    
    return chartData;
  }, [trendData, officeChartType]);

  // Chart options for top 10 offices
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Top 10 ${analysisType} Custom Offices - ${selectedYear}`,
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
        display: true, // Always show labels for all bars
        anchor: 'end', // Position at end of bar for horizontal bars
        align: 'end', // Align to end (outside the bar)
        formatter: function(value) {
          return formatValue(value);
        },
        color: '#333', // Dark color for outside labels
        font: {
          size: isMobile ? 9 : 11,
          weight: 'bold'
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
          text: 'Custom Offices',
          font: {
            size: isMobile ? 12 : 14,
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: isMobile ? 11 : 12
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            if (isMobile && label && label.length > 20) {
              return label.substring(0, 20) + '...';
            }
            return label;
          }
        }
      }
    },
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: isMobile ? 1 : 2,
      }
    },
    layout: {
      padding: {
        left: isMobile ? 5 : 10,
        right: isMobile ? 20 : 30, // More right padding for data labels
        top: 10,
        bottom: 10
      }
    }
  }), [analysisType, selectedYear, isMobile]);

  const trendChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${officeChartType} for: ${selectedOffice ? 
          (selectedOffice.length > 30 ? selectedOffice.substring(0, 30) + '...' : selectedOffice) 
          : 'Select an Office'}`,
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
        display: false // Don't show labels in trend chart
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
    },
    layout: {
      padding: {
        left: isMobile ? 5 : 10,
        right: isMobile ? 5 : 10,
        top: officeChartType === 'Bar Chart' && !isMobile ? 20 : 10,
        bottom: 10
      }
    }
  }), [selectedOffice, officeChartType, isMobile]);

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
              Monitor performance and trade volumes across Nepal's custom offices and border points. 
              Analyze import/export processing, revenue collection, and operational efficiency at different 
              entry/exit points. Compare performance across regions and office types.
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
                    <Tooltip title="Select the fiscal year to view custom office trade data for that specific period.">
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
                    <Tooltip title="Choose what type of trade data to analyze through custom offices: Imports (goods entering Nepal), Exports (goods leaving Nepal), or Trade Balance (difference between imports and exports at each office).">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={analysisType}
                    onChange={setAnalysisType}
                    style={{ width: '100%' }}
                  >
                    <Option value="Import">Imports</Option>
                    <Option value="Export">Exports</Option>
                    <Option value="Trade Balance">Trade Balance</Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </div>

          {/* Nepal Map Visualization */}
          <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined />
                    <span>Nepal Custom Offices Map - {analysisType} Values - {selectedYear}</span>
                  </div>
                }
                style={{ marginBottom: isMobile ? '16px' : '24px' }}
              >
                <div style={{ 
                  height: isMobile ? '400px' : '500px',
                  width: '100%',
                  position: 'relative'
                }}>
                  {currentYearData.length > 0 ? (
                    <>
                      <NepalMap 
                        customOfficeData={currentYearData}
                        analysisType={analysisType}
                        isMobile={isMobile}
                        selectedOffice={selectedOffice}
                      />
                      
                      {/* Map Legend */}
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxWidth: isMobile ? '200px' : '250px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}>
                        {/* Legend Header/Toggle */}
                        <div 
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(0, 102, 255, 0.1)',
                            borderBottom: legendCollapsed ? 'none' : '1px solid rgba(0, 102, 255, 0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            userSelect: 'none'
                          }}
                          onClick={() => setLegendCollapsed(!legendCollapsed)}
                        >
                          <span style={{ 
                            fontWeight: 'bold', 
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#0066ff'
                          }}>
                            Custom Office Rankings
                          </span>
                          <span style={{ 
                            fontSize: isMobile ? '12px' : '14px',
                            color: '#0066ff',
                            transform: legendCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }}>
                            ▲
                          </span>
                        </div>
                        
                        {/* Legend Content */}
                        {!legendCollapsed && (
                          <div style={{
                            padding: '12px 16px',
                            fontSize: isMobile ? '11px' : '13px'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '16px', height: '16px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>🥇 Top 1-3</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '14px', height: '14px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #FFA726, #FF7043)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>🥈 Top 4-10</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '12px', height: '12px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #42A5F5, #26C6DA)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>Others (11+)</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                                <span style={{ fontSize: '14px' }}>✈️</span>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>Airport Customs</span>
                              </div>
                              {selectedOffice && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                                  <div style={{
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #FF6B35, #DC143C)',
                                    border: '2px solid white'
                                  }}></div>
                                  <span style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 'bold' }}>🎯 Selected</span>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '9px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                              Map restricted to Nepal • Click markers for details
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <EnvironmentOutlined style={{ fontSize: isMobile ? '32px' : '48px', color: '#ccc', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#666' }}>No Custom Office Data Available</h3>
                        <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#999' }}>
                          No custom offices found with trade data for the selected criteria.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Top 10 Chart */}
          <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
            <Col xs={24}>
              <div className="chart-container" style={{ 
                height: isMobile ? '500px' : '400px',
                minHeight: isMobile ? '500px' : '400px',
                marginBottom: isMobile ? '16px' : '24px'
              }}>
                {top10Data ? (
                  <Bar data={top10Data} options={chartOptions} />
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
                      <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Loading custom office data or no offices found for the selected criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Search Custom Office Section */}
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
                      Search Custom Office for Trend Analysis
                    </label>
                    <Tooltip title="Search and select a specific custom office or border point to view detailed trade trends over time across different fiscal years.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '14px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={selectedOffice}
                    onChange={setSelectedOffice}
                    style={{ width: '100%' }}
                    placeholder="Type to search and select a custom office..."
                    allowClear
                    showSearch
                    size={isMobile ? 'middle' : 'large'}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {allOffices.map(office => (
                      <Option key={office} value={office}>{office}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              {selectedOffice && (
                <Col xs={24} md={8} lg={6}>
                  <div className="control-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <label style={{ 
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        display: 'block',
                        color: '#374151',
                        margin: 0
                      }}>
                        Chart Type
                      </label>
                      <Tooltip title="Choose how to display the selected custom office's trade trend: Line Chart for continuous trend visualization or Bar Chart for period-by-period comparison of trade volumes.">
                        <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                      </Tooltip>
                    </div>
                    <Radio.Group
                      value={officeChartType}
                      onChange={(e) => setOfficeChartType(e.target.value)}
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

          {/* Office Trend Analysis */}
          {selectedOffice && trendChartData && (
            <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              <Col xs={24}>
                <div className="chart-container" style={{ 
                  height: isMobile ? '400px' : '350px',
                  minHeight: isMobile ? '400px' : '350px'
                }}>
                  {officeChartType === 'Line Trend' ? (
                    <Line data={trendChartData} options={trendChartOptions} />
                  ) : (
                    <Bar data={trendChartData} options={trendChartOptions} />
                  )}
                </div>
              </Col>
            </Row>
          )}


        </>
      )}
    </div>
  );
};

export default CustomOfficeDashboard;
