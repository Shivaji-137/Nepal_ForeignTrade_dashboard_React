# Nepal Foreign Trade Dashboard - React Version

🇳🇵 **नेपाल विदेशी व्यापार ड्यासबोर्ड** | Nepal Foreign Trade Analytics Dashboard

[![Deploy to GitHub Pages](https://github.com/Shivaji-137/Nepal_ForeignTrade_dashboard_React/actions/workflows/deploy.yml/badge.svg)](https://github.com/Shivaji-137/Nepal_ForeignTrade_dashboard_React/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat&logo=github)](https://shivaji-137.github.io/Nepal_ForeignTrade_dashboard_React)

A modern React web application for analyzing Nepal's international trade data from fiscal year 2071/72 to 2081/82 (Bikram Sambat).

## Features

### 📊 Comprehensive Trade Analysis
- **Trade Balance Summary**: Overview of import/export trends and trade balance
- **Product Analysis**: Detailed breakdown of trade by products and commodities
- **Country Analysis**: Bilateral trade relationships and regional distribution
- **Commodity Analysis**: HS chapter-wise trade classification and performance
- **Custom Office Analysis**: Trade processing efficiency across border points
- **Commodity-Country Matrix**: Cross-analysis of products and trading partners

### 🎯 Interactive Visualizations
- **Chart.js Integration**: Bar charts, line charts, pie charts, scatter plots, radar charts
- **Ant Design Components**: Professional UI with tables, cards, and controls
- **Responsive Design**: Mobile-friendly interface with grid layouts
- **Real-time Filtering**: Dynamic data filtering and search capabilities

### 🏛️ Nepal Government Theme
- **Official Colors**: Nepal flag-inspired color scheme
- **Bilingual Support**: English and Nepali text
- **Professional Layout**: Government dashboard styling
- **Accessibility**: WCAG compliant design principles

## Technology Stack

- **Frontend**: React 18, TypeScript ready
- **UI Library**: Ant Design 5.x
- **Charts**: Chart.js with React Chart.js 2
- **Styling**: Styled Components + Custom CSS
- **Icons**: Ant Design Icons
- **Build Tool**: Create React App
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shivaji-137/nepal-foreign-trade-dashboard.git
cd nepal-foreign-trade-dashboard/react-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## Data Structure

The dashboard uses a comprehensive data service that includes:

- **Summary Data**: Fiscal year totals, growth rates, trade balance
- **Product Data**: HS classification, import/export values
- **Country Data**: Trading partners, regional distribution
- **Commodity Data**: Chapter-wise breakdown, competitiveness metrics
- **Custom Office Data**: Border point efficiency, revenue collection

## Component Architecture

```
src/
├── components/
│   ├── SummaryDashboard.js      # Trade balance overview
│   ├── ProductDashboard.js      # Product-wise analysis
│   ├── CountryDashboard.js      # Country-wise analysis
│   ├── CommodityDashboard.js    # Commodity classification
│   ├── CustomOfficeDashboard.js # Border office performance
│   └── CommodityCountryDashboard.js # Cross-analysis
├── utils/
│   └── dataService.js           # Data loading and utilities
├── App.js                       # Main application component
└── index.css                    # Global styles
```

## Key Features

### 1. Trade Balance Summary
- KPI cards with growth indicators
- Multi-year trend analysis
- Export-import comparison charts
- Trade deficit/surplus tracking

### 2. Product Dashboard
- Top 10 products by trade value
- Product search and filtering
- Trend analysis for specific products
- Import/export ratio calculations

### 3. Country Dashboard
- Bilateral trade relationships
- Regional trade distribution
- Country-wise performance metrics
- Geographic trade patterns

### 4. Commodity Dashboard
- HS chapter classification
- Trade intensity heatmaps
- Commodity competitiveness analysis
- Market share calculations

### 5. Custom Office Dashboard
- Border point efficiency metrics
- Revenue collection analysis
- Regional office comparison
- Processing volume tracking

### 6. Commodity-Country Analysis
- Cross-tabulation of products and countries
- Market positioning analysis
- Trade opportunity identification
- Competitive advantage mapping

## Data Sources

- **Primary**: Department of Customs, Ministry of Finance, Government of Nepal
- **Period**: FY 2071/72 - 2081/82 (Bikram Sambat)
- **Last Updated**: July 2025
- **Format**: Excel files processed into JSON structure

## Deployment

### Production Build
```bash
npm run build
```

### Hosting Options
- **GitHub Pages**: Automatically deployed via GitHub Actions ✅
- **Netlify**: Drag and drop `build` folder
- **Vercel**: Connect GitHub repository
- **Firebase Hosting**: Use Firebase CLI

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Live Demo
🌐 **[View Live Dashboard](https://shivaji-137.github.io/Nepal_ForeignTrade_dashboard_React)**

### Automatic Deployment
- **Trigger**: Push to `main` or `master` branch
- **Build**: Automated via GitHub Actions
- **Deploy**: GitHub Pages
- **URL**: https://shivaji-137.github.io/Nepal_ForeignTrade_dashboard_React

### Manual Deployment Setup
1. Go to repository Settings → Pages
2. Source: Deploy from a branch → `gh-pages`
3. Push code to main branch to trigger deployment

## 🔧 GitHub Actions Workflow
The deployment workflow includes:
- Node.js 18 setup
- Dependency installation
- Test execution
- Production build
- Automatic deployment to GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Data Provider**: Department of Customs, Government of Nepal
- **Developer**: Shivaji Chaulagain
- **Purpose**: Trade policy analysis and decision support

## Contact

**Shivaji Chaulagain**
- GitHub: [@Shivaji-137](https://github.com/Shivaji-137)
- Email: shivajichaulagain@gmail.com
---

© 2025 Shivaji Chaulagain. All rights reserved.

*This dashboard is designed to support Nepal's trade policy decisions and economic analysis.*
