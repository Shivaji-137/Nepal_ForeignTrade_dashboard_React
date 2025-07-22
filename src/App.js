import React, { useState, useEffect } from 'react';
import { GithubOutlined, LinkedinOutlined } from '@ant-design/icons';


import { Menu, Spin, Alert, Button, Card, Row, Col } from 'antd';
import { 
  HomeOutlined,
  BarChartOutlined, 
  ShoppingOutlined, 
  GlobalOutlined, 
  AppstoreOutlined, 
  BankOutlined, 
  LinkOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  RocketOutlined,
  RiseOutlined,
  SwapOutlined,
  MenuOutlined
} from '@ant-design/icons';

// Import dashboard components
import SummaryDashboard from './components/SummaryDashboard';
import ProductDashboard from './components/ProductDashboard';
import CountryDashboard from './components/CountryDashboard';
import CommodityDashboard from './components/CommodityDashboard';
import CustomOfficeDashboard from './components/CustomOfficeDashboard';
import CommodityCountryDashboard from './components/CommodityCountryDashboard';

// Sample data service - replace with actual data loading
import { loadTradeData } from './utils/dataService';

function App() {
  const [loading, setLoading] = useState(true);
  const [tradeData, setTradeData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showEnglishDate, setShowEnglishDate] = useState(false); // New state for date toggle

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const data = await loadTradeData();
        setTradeData(data);
      } catch (err) {
        setError('Failed to load trade data. Please refresh the page.');
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Effect to toggle between Nepali and English dates
  useEffect(() => {
    const dateToggleInterval = setInterval(() => {
      setShowEnglishDate(prev => !prev);
    }, 4000); // Toggle every 3 seconds

    return () => clearInterval(dateToggleInterval); // Cleanup on unmount
  }, []);

  // Navigation handler function
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Navigation menu items
  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Home' },
    { key: 'summary', icon: <BarChartOutlined />, label: 'Balance Summary' },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: 'countries', icon: <GlobalOutlined />, label: 'Countries' },
    { key: 'commodities', icon: <AppstoreOutlined />, label: 'Commodities' },
    { key: 'customs', icon: <BankOutlined />, label: 'Custom Offices' },
    { key: 'commodity-country', icon: <LinkOutlined />, label: 'Commodity-Country Analysis' },
    { key: 'about', icon: <InfoCircleOutlined />, label: 'About' },
    { key: 'contact', icon: <PhoneOutlined />, label: 'Contact' }
  ];

  // Home page component
  const HomePage = () => {
    const [typedText, setTypedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const fullText = 'Foreign Trade Analytics Dashboard';
    
    useEffect(() => {
      if (currentIndex < fullText.length) {
        const timer = setTimeout(() => {
          setTypedText(fullText.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 50); // Typing speed
        
        return () => clearTimeout(timer);
      }
    }, [currentIndex, fullText]);

    return (
      <div className="home-container" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
        textAlign: 'center',
        color: 'white',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Animation Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '80px',
          height: '80px',
          border: '2px solid rgba(52, 152, 219, 0.2)',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '60px',
          height: '60px',
          border: '2px solid rgba(46, 204, 113, 0.2)',
          borderRadius: '50%',
          animation: 'float 5s ease-in-out infinite'
        }}></div>
        
        {/* Subtle Grid Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}></div>

        <div style={{ width: '100%', padding: '0 1rem', position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 3rem)', 
            marginBottom: '1rem', 
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            🇳🇵 Nepal {typedText}
            <span style={{ 
              animation: 'blink 1s infinite',
              marginLeft: '2px'
            }}>|</span>
          </h1>
          <h2 style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', 
            marginBottom: '1.5rem', 
            color: '#f0f0f0', 
            fontWeight: 'normal',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: '1.3',
            maxWidth: '900px',
            margin: '0 auto 1.5rem auto'
          }}>
            Comprehensive Analysis of Nepal's International Trade Data ({showEnglishDate ? 'FY 2014/15 - 2024/25 AD' : 'FY 2071/72 - 2081/82 BS'})
          </h2>
          
          {/* Trade Animation Icons */}
          <div className="trade-icons" style={{ 
            margin: 'clamp(1rem, 3vw, 2rem) 0', 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
            position: 'relative', 
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(0.5rem, 2vw, 1rem)'
          }}>
            <RiseOutlined style={{ 
              animation: 'bounce 2s infinite',
              color: '#3498db',
              textShadow: '0 0 10px rgba(52, 152, 219, 0.5)'
            }} />
            <SwapOutlined style={{ 
              animation: 'pulse 2s infinite',
              color: '#2ecc71',
              textShadow: '0 0 10px rgba(46, 204, 113, 0.5)'
            }} />
            <GlobalOutlined style={{ 
              animation: 'bounce 2s infinite 0.5s',
              color: '#e74c3c',
              textShadow: '0 0 10px rgba(231, 76, 60, 0.5)'
            }} />
          </div>

          <Button 
            type="primary" 
            size="large" 
            icon={<RocketOutlined />}
            onClick={() => setCurrentPage('summary')}
            style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              height: 'clamp(45px, 8vw, 50px)',
              padding: '0 2rem',
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              borderColor: 'transparent',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              position: 'relative',
              zIndex: 2
            }}
          >
            Let's Get Started
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(46, 204, 113, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(231, 76, 60, 0.1) 0%, transparent 50%);
          z-index: 1;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .home-container {
            margin: 0;
            padding: 0;
            height: calc(100vh - 64px) !important;
            overflow: hidden !important;
          }
          
          .hero-section {
            padding: 1.5rem 1rem !important;
            height: 100% !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          
          .hero-section h1 {
            font-size: 2.2rem !important;
            line-height: 1.1 !important;
            margin-bottom: 1rem !important;
          }
          
          .hero-section h2 {
            font-size: 1.3rem !important;
            line-height: 1.2 !important;
            margin-bottom: 1.2rem !important;
            padding: 0 0.5rem !important;
          }
          
          .trade-icons {
            margin: 1.2rem 0 !important;
            font-size: 2rem !important;
          }
          
          .ant-btn-large {
            font-size: 1.1rem !important;
            height: 50px !important;
            padding: 0 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .home-container {
            height: calc(100vh - 64px) !important;
            overflow: hidden !important;
          }
          
          .hero-section {
            padding: 1rem 0.8rem !important;
            height: 100% !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          
          .hero-section h1 {
            font-size: 1.8rem !important;
            margin-bottom: 0.8rem !important;
            line-height: 1.1 !important;
          }
          
          .hero-section h2 {
            font-size: 1.1rem !important;
            margin-bottom: 1rem !important;
            line-height: 1.2 !important;
          }
          
          .trade-icons {
            font-size: 1.8rem !important;
            gap: 1rem !important;
            margin: 1rem 0 !important;
          }
          
          .ant-btn-large {
            font-size: 1rem !important;
            height: 48px !important;
            padding: 0 1.8rem !important;
          }
        }
      `}</style>
    </div>
    );
  };

  // About page component
  const AboutPage = () => (
    <div className="about-container" style={{ 
      width: '100%', 
      padding: '2rem', 
      background: 'transparent', 
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .about-container {
            padding: 1rem !important;
          }
          
          .about-main-title {
            font-size: 1.5rem !important;
            line-height: 1.3 !important;
          }
          
          .about-description-text {
            font-size: 1rem !important;
            text-align: left !important;
            margin-bottom: 1rem !important;
          }
          
          .about-secondary-text {
            font-size: 0.95rem !important;
            text-align: left !important;
          }
          
          .about-data-source {
            padding: 0.8rem 1rem !important;
          }
          
          .about-data-source h3 {
            font-size: 1.1rem !important;
          }
          
          .about-data-source p {
            font-size: 0.95rem !important;
          }
          
          .about-features-title {
            font-size: 1.3rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .about-feature-card {
            height: 200px !important;
          }
          
          .about-feature-icon {
            font-size: 2.5rem !important;
          }
          
          .about-feature-title {
            font-size: 1.1rem !important;
          }
          
            .about-feature-text {
            font-size: 0.85rem !important;
          }
          
          .about-terms-title {
            font-size: 1.3rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .about-term-card {
            margin-bottom: 1rem !important;
            padding: 0.8rem !important;
          }
          
          .about-term-title {
            font-size: 1rem !important;
          }
          
          .about-term-text {
            font-size: 0.85rem !important;
          }
          
          .about-description-container {
            padding: 1rem !important;
            margin-bottom: 1rem !important;
          }
          
          .about-main-card {
            margin-bottom: 1rem !important;
          }
          
          .about-features-container {
            margin-bottom: 1.5rem !important;
          }
          
          .about-terms-container {
            margin-bottom: 1.5rem !important;
          }
          
          .about-contact-container {
            padding: 1rem !important;
          }
          
          .about-contact-title {
            font-size: 1.3rem !important;
          }
          
          .about-contact-content {
            font-size: 1rem !important;
          }
          
          .about-contact-footer {
            font-size: 0.85rem !important;
            margin: 1.5rem 0 !important;
          }
        }
      `}</style>
      {/* Description Section */}
      <Card className="about-main-card" style={{ 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)', 
        border: '1px solid rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 className="about-main-title" style={{ 
          color: '#60a5fa', 
          marginBottom: '1.5rem',
          fontSize: '2rem',
          fontWeight: '700',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          borderBottom: '2px solid rgba(96, 165, 250, 0.3)',
          paddingBottom: '0.5rem',
          lineHeight: '1.2'
        }}>
          🇳🇵 About Nepal Foreign Trade Dashboard
        </h2>
        <div className="about-description-container" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p className="about-description-text" style={{ 
            fontSize: '1.2rem', 
            lineHeight: '1.8', 
            marginBottom: '1.5rem', 
            color: '#e2e8f0',
            fontWeight: '500',
            textAlign: 'justify'
          }}>
            📊 This dashboard analyzes Nepal's foreign trade from fiscal year <strong style={{ color: '#60a5fa' }}>'2071/72'</strong> to the fiscal year <strong style={{ color: '#60a5fa' }}>'2081/82'</strong> ('Bikram Sambat'). 
            It provides insights into Nepal's import and export patterns each year, the trade balance (difference between imports and exports), 
            and trends in major traded products. The interactive charts and comprehensive summaries help users understand how Nepal's international trade has evolved over this decade.
          </p>
          <p className="about-secondary-text" style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.7', 
            color: '#cbd5e1',
            fontWeight: '400',
            textAlign: 'justify'
          }}>
            🔍 This comprehensive dashboard provides detailed insights into Nepal's international trade patterns and economic relationships with trading partners worldwide. 
            Built using modern web technologies, it processes and visualizes trade data spanning from fiscal year <strong style={{ color: '#34d399' }}>'2014/15'</strong> to <strong style={{ color: '#34d399' }}>'2024/25'</strong> ('AD'), offering both historical perspective and current trade analysis.
          </p>
        </div>
        
        <div className="about-data-source" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <h3 style={{ 
            color: '#34d399', 
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Data Source:
          </h3>
          <p style={{ 
            color: '#f0f9ff', 
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Department of Customs, Ministry of Finance, Government of Nepal
          </p>
        </div>
      </Card>

      {/* Feature Cards */}
      <h3 className="about-features-title" style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        fontSize: '1.5rem', 
        color: 'white' 
      }}>Key Features</h3>
      <Row className="about-features-container" gutter={[24, 24]} style={{ marginBottom: '2rem' }}>
        <Col xs={24} md={8}>
          <Card className="about-feature-card" hoverable style={{ 
            textAlign: 'center', 
            height: '250px',
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <BarChartOutlined className="about-feature-icon" style={{ fontSize: '3rem', color: '#3498db', marginBottom: '1rem' }} />
            <h3 className="about-feature-title" style={{ color: 'white', fontSize: '1.2rem' }}>Trade Balance Analysis</h3>
            <p className="about-feature-text" style={{ color: '#f0f0f0', fontSize: '0.9rem', lineHeight: '1.4' }}>Comprehensive analysis of imports, exports, and trade balance trends over multiple fiscal years.</p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="about-feature-card" hoverable style={{ 
            textAlign: 'center', 
            height: '250px',
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <GlobalOutlined className="about-feature-icon" style={{ fontSize: '3rem', color: '#2ecc71', marginBottom: '1rem' }} />
            <h3 className="about-feature-title" style={{ color: 'white', fontSize: '1.2rem' }}>Country-wise Trade</h3>
            <p className="about-feature-text" style={{ color: '#f0f0f0', fontSize: '0.9rem', lineHeight: '1.4' }}>Detailed breakdown of trade relationships with different countries and regions worldwide.</p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="about-feature-card" hoverable style={{ 
            textAlign: 'center', 
            height: '250px',
            background: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <ShoppingOutlined className="about-feature-icon" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '1rem' }} />
            <h3 className="about-feature-title" style={{ color: 'white', fontSize: '1.2rem' }}>Product Analysis</h3>
            <p className="about-feature-text" style={{ color: '#f0f0f0', fontSize: '0.9rem', lineHeight: '1.4' }}>In-depth analysis of individual products, commodities, and their trade performance.</p>
          </Card>
        </Col>
      </Row>

      {/* Trade Terms Definitions */}
      <Card className="about-terms-container" style={{
        background: 'rgba(255, 255, 255, 0.1)', 
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        marginBottom: '2rem'
      }}>
        <h3 className="about-terms-title" style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '1.5rem'
        }}>📚 Key Trade Terms & Definitions</h3>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="about-term-card" style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(52, 152, 219, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #3498db' 
            }}>
              <h4 className="about-term-title" style={{ 
                color: '#3498db', 
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem'
              }}>📥 Import</h4>
              <p className="about-term-text" style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                Total value of goods and services bought from foreign countries. Reflects domestic demand and local production gaps.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="about-term-card" style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(46, 204, 113, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #2ecc71' 
            }}>
              <h4 className="about-term-title" style={{ 
                color: '#2ecc71', 
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem'
              }}>📤 Export</h4>
              <p className="about-term-text" style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                Total value of goods and services sold to foreign markets. Indicates global competitiveness and production capacity.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(231, 76, 60, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #e74c3c' 
            }}>
              <h4 style={{ 
                color: '#e74c3c', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>⚖️ Trade Balance</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Difference between total exports and imports (Exports - Imports). Positive means trade surplus, negative means trade deficit.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(231, 76, 60, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #e74c3c' 
            }}>
              <h4 style={{ 
                color: '#e74c3c', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>📉 Trade Deficit</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                When imports exceed exports (Imports - Exports). Indicates more money flowing out than coming in from trade.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(155, 89, 182, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #9b59b6' 
            }}>
              <h4 style={{ 
                color: '#9b59b6', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>🔄 Import/Export Ratio</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Ratio of imports to exports (Imports ÷ Exports). Shows reliance on foreign goods relative to export earnings.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(241, 196, 15, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #f1c40f' 
            }}>
              <h4 style={{ 
                color: '#f1c40f', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>💰 Import Revenue</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Government revenue generated from import duties, taxes, and tariffs on imported goods and services.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(52, 73, 94, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #34495e' 
            }}>
              <h4 style={{ 
                color: '#95a5a6', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>🏛️ Custom Office</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Government facilities at border points that control and monitor import/export activities, collect duties and ensure compliance.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(26, 188, 156, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #1abc9c' 
            }}>
              <h4 style={{ 
                color: '#1abc9c', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>💸 Custom Tariff</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Taxes imposed on imported goods by customs authorities. Used to protect domestic industries and generate revenue.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(230, 126, 34, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #e67e22' 
            }}>
              <h4 style={{ 
                color: '#e67e22', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>📊 Total Trade</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Sum of imports and exports. Represents the overall scale of a country's engagement in international trade.
              </p>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div style={{ 
              marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
              padding: window.innerWidth <= 768 ? '0.8rem' : '1rem', 
              background: 'rgba(192, 57, 43, 0.1)', 
              borderRadius: '8px', 
              borderLeft: '4px solid #c0392b' 
            }}>
              <h4 style={{ 
                color: '#c0392b', 
                margin: '0 0 0.5rem 0',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem'
              }}>🏆 Competitiveness</h4>
              <p style={{ 
                color: '#f0f0f0', 
                margin: 0, 
                fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.9rem',
                lineHeight: '1.5'
              }}>
                Measure of how well a country's products compete in international markets based on export performance and market share.
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // Contact page component
const ContactPage = () => (
  <div className="about-contact-container" style={{ 
    width: '100%', 
    padding: '2rem', 
    background: 'transparent', 
    color: 'white' 
  }}>
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card style={{
        background: 'rgba(255, 255, 255, 0.1)', 
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '2rem'
      }}>
        <h2 className="about-contact-title" style={{ 
          color: 'white',
          fontSize: '1.5rem'
        }}>Contact Information</h2>

        <div className="about-contact-content" style={{ 
          fontSize: '1.1rem', 
          lineHeight: '2', 
          color: '#f0f0f0' 
        }}>
          <p><strong style={{ color: 'white' }}>Developer:</strong> Shivaji Chaulagain</p>
          <p><strong style={{ color: 'white' }}>Email:</strong> shivajichaulagain@gmail.com</p>
          <p><strong style={{ color: 'white' }}>Project:</strong> Nepal Foreign Trade Analytics Dashboard</p>
          <p><strong style={{ color: 'white' }}>Last Updated:</strong> July 2025</p>
          

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <p><strong style={{ color: 'white' }}>Follow me on:</strong></p>
            <a href="https://github.com/Shivaji-137" target="_blank" rel="noopener noreferrer" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GithubOutlined style={{ fontSize: '20px' }} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/shivaji137/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkedinOutlined style={{ fontSize: '20px' }} /> LinkedIn
            </a>
          </div>
        </div>

        <hr className="about-contact-footer" style={{ margin: '2rem 0', borderColor: 'rgba(255, 255, 255, 0.3)' }} />

        <p style={{ 
          fontSize: '0.9rem', 
          color: '#d0d0d0' 
        }}>
          For technical support, feature requests, or data inquiries, please reach out via email.
        </p>
      </Card>
    </div>
  </div>
);
  // Render current page content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" />
          <p style={{ marginTop: '1rem' }}>Loading Nepal Trade Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Data Loading Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: '2rem' }}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'summary':
        return <SummaryDashboard data={tradeData} onNavigate={handleNavigation} />;
      case 'products':
        return <ProductDashboard data={tradeData} />;
      case 'countries':
        return <CountryDashboard data={tradeData} />;
      case 'commodities':
        return <CommodityDashboard data={tradeData} />;
      case 'customs':
        return <CustomOfficeDashboard data={tradeData} />;
      case 'commodity-country':
        return <CommodityCountryDashboard data={tradeData} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  if (loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner">
          <Spin size="large" />
          <span style={{ marginLeft: '1rem' }}>Loading Nepal Trade Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', padding: '2rem' }}>
        <Alert
          message="Data Loading Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: '2rem 0' }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <div className="navigation-bar" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
        padding: '0',
        marginBottom: '0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <Menu
          mode="horizontal"
          selectedKeys={[currentPage]}
          onClick={({ key }) => setCurrentPage(key)}
          style={{
            background: 'transparent',
            borderBottom: 'none',
            justifyContent: 'center',
            lineHeight: '64px'
          }}
          theme="dark"
          items={menuItems}
          overflowedIndicator={<MenuOutlined />}
        />
      </div>

      {/* Main Content */}
      <div className="main-content" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
        minHeight: 'calc(100vh - 64px)',
        color: 'white'
      }}>
        {renderContent()}
      </div>

      {/* Professional Footer - Hidden on Home Page */}
      {currentPage !== 'home' && (
        <div className="dashboard-footer" style={{
          background: '#f5f5f5',
          padding: '0.5rem',
          textAlign: 'center',
          marginTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '10px' }}>
            Data Source: Department of Customs, Ministry of Finance, Government of Nepal<br />
            <small style={{ fontSize: '8px' }}>
              FY 2071/72 - 2081/82 BS | Updated July 22, 2025
            </small>
          </p>
          <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <div>
            <small style={{ fontSize: '8px' }}>&copy; 2025 Shivaji Chaulagain. All rights reserved.</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
