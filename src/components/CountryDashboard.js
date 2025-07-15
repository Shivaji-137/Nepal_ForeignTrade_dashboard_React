import React, { useState, useMemo, useEffect } from 'react';
import { Select, Card, Row, Col, Input, Space, Spin, message, Radio, Tooltip } from 'antd';
import { SearchOutlined, GlobalOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/worldMap.css';
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
import {
  loadCountryData,
  getAvailableYearsForDropdown,
  selectCountryYearData,
  getTopCountries,
  getCountryTrendData,
  formatValue,
  prepareChartData,
  prepareTrendChartData,
  prepareTrendBarChartData
} from '../utils/countryDataService';

// We'll load this from a CDN or local file for better performance
let worldMapGeoJSON = null;

// Load world map data
const loadWorldMapData = async () => {
  if (worldMapGeoJSON) return worldMapGeoJSON;
  
  try {
    console.log('Loading world map data...');
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    worldMapGeoJSON = await response.json();
    console.log('World map data loaded successfully:', worldMapGeoJSON);
    return worldMapGeoJSON;
  } catch (error) {
    console.error('Failed to load world map data:', error);
    // Return a minimal structure to prevent crashes
    return {
      type: "FeatureCollection",
      features: []
    };
  }
};

// Function to categorize countries by region
const getCountryRegion = (countryName) => {
  const regions = {
    'South Asia': [
      'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Afghanistan', 'Maldives', 'Bhutan'
    ],
    'East Asia': [
      'China', 'Japan', 'South Korea', 'North Korea', 'Korea, Republic of', 'Korea, Democratic People\'s Rep. of', 
      'Mongolia', 'Taiwan', 'Hong Kong', 'Macau', 'Taiwan, Republic of China', 'Taiwan, Province of China'
    ],
    'Southeast Asia': [
      'Thailand', 'Vietnam', 'Viet Nam', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Myanmar', 
      'Cambodia', 'Laos', 'Lao People\'s Democratic Republic', 'Brunei', 'Brunei Darussalam', 'Timor-Leste', 'East Timor'
    ],
    'Middle East': [
      'United Arab Emirates', 'Saudi Arabia', 'Iran', 'Iran, Islamic Republic of', 'Iraq', 'Turkey', 'Israel', 'Jordan', 
      'Lebanon', 'Syria', 'Syrian Arab Republic', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Yemen'
    ],
    'Europe': [
      'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 
      'Switzerland', 'Austria', 'Poland', 'Czech Republic', 'Hungary', 'Sweden', 'Denmark', 
      'Norway', 'Finland', 'Russia', 'Ukraine', 'Romania', 'Greece', 'Portugal', 'Ireland',
      'Cyprus', 'Belarus', 'Slovenia', 'Lithuania', 'Croatia', 'Bulgaria', 'Latvia', 'Estonia',
      'Luxembourg', 'Malta', 'Iceland', 'Serbia', 'Armenia', 'Russian Federation', 'Albania', 
      'Andorra', 'Bosnia and Herzegovina', 'Montenegro', 'Macedonia', 'The former Yugoslav Rep. Macedonia', 
      'Moldova', 'Republic of Moldova', 'Kosovo', 'Serbia (Europe)', 'Liechtenstein', 'Monaco', 
      'San Marino', 'Holy See (Vatican)', 'Isle of Man', 'Slovakia', 'European Union', 'Faeroe Islands',
      'Azerbaijan', 'Georgia'
    ],
    'North America': [
      'United States', 'Canada', 'Mexico', 'USA', 'US', 'America', 'Belize', 'Guatemala', 'Honduras', 
      'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Puerto Rico'
    ],
    'South America': [
      'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 
      'Uruguay', 'Paraguay', 'Guyana', 'Suriname', 'French Guiana'
    ],
    'Africa': [
      'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Libyan Arab Jamahiriya',
      'Ghana', 'Ethiopia', 'Tanzania', 'United Republic of Tanzania', 'Uganda', 'Zimbabwe', 'Zambia', 'Botswana', 'Mauritius',
      'Angola', 'Benin', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad',
      'Comoros', 'Congo', 'Cote d\'Ivoire', 'Djibouti', 'Eritrea', 'Gabon', 'Guinea', 'Guinea-Bissau',
      'Lesotho', 'Liberia', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mozambique', 'Namibia',
      'Niger', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
      'South Sudan', 'Sudan', 'Swaziland', 'Togo', 'Western Sahara', 'Zaire'
    ],
    'Oceania': [
      'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu',
      'Samoa', 'Kiribati', 'Marshall Islands', 'Micronesia, Federated States of', 'Nauru',
      'Cook Islands', 'Niue', 'Tokelau', 'New Caledonia'
    ],
    'Caribbean': [
      'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Antigua and Barbuda', 'Aruba', 'Bahamas',
      'Barbados', 'Bermuda', 'Cayman Islands', 'Dominica', 'Grenada', 'Guadeloupe', 'Montserrat',
      'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago',
      'Turks and Caicos Islands', 'United States Virgin Islands', 'Anguilla'
    ],
    'Central Asia': [
      'Kazakstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'
    ],
    'Pacific': [
      'American Samoa', 'Guam', 'Northern Mariana Islands', 'Midway Islands', 'Pitcairn',
      'Wallis and Futuna Islands'
    ],
    'Indian Ocean': [
      'Reunion', 'French Southern Territories', 'British Indian Ocean Territory', 
      'Christmas Island[Australia]', 'Cocos (Keeling) Islands'
    ],
    'Atlantic': [
      'Saint Helena', 'Bouvet Island'
    ],
    'Antarctica': [
      'Antarctica'
    ],
    'Historical': [
      'Yugoslavia', 'Zaire'
    ]
  };

  // Normalize country name for comparison
  const normalizedCountry = countryName.toLowerCase().trim();
  
  for (const [region, countries] of Object.entries(regions)) {
    if (countries.some(country => {
      const normalizedRegionCountry = country.toLowerCase().trim();
      
      // Exact match first
      if (normalizedCountry === normalizedRegionCountry) {
        return true;
      }
      
      // Handle common variations (like "USA" vs "United States")
      if (region === 'North America') {
        return (normalizedCountry === 'usa' && normalizedRegionCountry === 'united states') ||
               (normalizedCountry === 'united states' && normalizedRegionCountry === 'usa') ||
               (normalizedCountry === 'us' && normalizedRegionCountry === 'united states') ||
               (normalizedCountry === 'america' && normalizedRegionCountry === 'united states');
      }
      
      // For other regions, use word boundary matching to avoid false positives
      const countryWords = normalizedCountry.split(/\s+/);
      const regionWords = normalizedRegionCountry.split(/\s+/);
      
      // Check if all words of region country are in data country
      return (regionWords.every(word => countryWords.includes(word))) ||
             (countryWords.every(word => regionWords.includes(word)));
    })) {
      return region;
    }
  }
  
  return 'Other';
};

// Function to map country names to ISO codes for the world map
const getCountryISO = (countryName) => {
  const countryMapping = {
    // Existing mappings
    'India': 'IND',
    'China': 'CHN',
    'United States': 'USA',
    'USA': 'USA',
    'United Kingdom': 'GBR',
    'Germany': 'DEU',
    'France': 'FRA',
    'Italy': 'ITA',
    'Japan': 'JPN',
    'Canada': 'CAN',
    'Australia': 'AUS',
    'Brazil': 'BRA',
    'Russia': 'RUS',
    'South Korea': 'KOR',
    'Korea, Republic of': 'KOR',
    'Korea, Democratic People\'s Rep. of': 'PRK',
    'North Korea': 'PRK',
    'Spain': 'ESP',
    'Mexico': 'MEX',
    'Indonesia': 'IDN',
    'Netherlands': 'NLD',
    'Saudi Arabia': 'SAU',
    'Turkey': 'TUR',
    'Taiwan': 'TWN',
    'Belgium': 'BEL',
    'Switzerland': 'CHE',
    'Ireland': 'IRL',
    'Israel': 'ISR',
    'Austria': 'AUT',
    'Thailand': 'THA',
    'Nigeria': 'NGA',
    'Argentina': 'ARG',
    'Egypt': 'EGY',
    'South Africa': 'ZAF',
    'Malaysia': 'MYS',
    'Philippines': 'PHL',
    'Bangladesh': 'BGD',
    'Vietnam': 'VNM',
    'Chile': 'CHL',
    'Finland': 'FIN',
    'Singapore': 'SGP',
    'Denmark': 'DNK',
    'Norway': 'NOR',
    'New Zealand': 'NZL',
    'United Arab Emirates': 'ARE',
    'Portugal': 'PRT',
    'Czech Republic': 'CZE',
    'Romania': 'ROU',
    'Poland': 'POL',
    'Peru': 'PER',
    'Greece': 'GRC',
    'Iraq': 'IRQ',
    'Qatar': 'QAT',
    'Hungary': 'HUN',
    'Kuwait': 'KWT',
    'Ukraine': 'UKR',
    'Morocco': 'MAR',
    'Slovakia': 'SVK',
    'Ecuador': 'ECU',
    'Kenya': 'KEN',
    'Ethiopia': 'ETH',
    'Sri Lanka': 'LKA',
    'Pakistan': 'PAK',
    'Iran': 'IRN',
    'Colombia': 'COL',
    'Venezuela': 'VEN',
    'Algeria': 'DZA',
    'Sweden': 'SWE',
    'Oman': 'OMN',
    'Myanmar': 'MMR',
    'Jordan': 'JOR',
    'Tunisia': 'TUN',
    'Ghana': 'GHA',
    'Uruguay': 'URY',
    'Slovenia': 'SVN',
    'Lithuania': 'LTU',
    'Croatia': 'HRV',
    'Panama': 'PAN',
    'Bulgaria': 'BGR',
    'Costa Rica': 'CRI',
    'Lebanon': 'LBN',
    'Belarus': 'BLR',
    'Serbia': 'SRB',
    'Paraguay': 'PRY',
    'Cambodia': 'KHM',
    'Latvia': 'LVA',
    'Estonia': 'EST',
    'Mauritius': 'MUS',
    'Cyprus': 'CYP',
    'Luxembourg': 'LUX',
    'Malta': 'MLT',
    'Iceland': 'ISL',
    'Bahrain': 'BHR',
    'Mongolia': 'MNG',
    'Brunei': 'BRN',
    'Maldives': 'MDV',
    'Bhutan': 'BTN',
    'Afghanistan': 'AFG',
    'Nepal': 'NPL',
    'Armenia': 'ARM',
    'Antarctica': 'ATA',
    'Taiwan, Republic of China': 'TWN',
    'Taiwan, Province of China': 'TWN',
    'Russian Federation': 'RUS',
    // Additional mappings for missing countries from Excel data
    'Albania': 'ALB',
    'American Samoa': 'ASM',
    'Andorra': 'AND',
    'Angola': 'AGO',
    'Anguilla': 'AIA',
    'Antigua and Barbuda': 'ATG',
    'Aruba': 'ABW',
    'Azerbaijan': 'AZE',
    'Bahamas': 'BHS',
    'Barbados': 'BRB',
    'Belize': 'BLZ',
    'Benin': 'BEN',
    'Bermuda': 'BMU',
    'Bolivia': 'BOL',
    'Bosnia and Herzegovina': 'BIH',
    'Botswana': 'BWA',
    'Bouvet Island': 'BVT',
    'British Indian Ocean Territory': 'IOT',
    'Brunei Darussalam': 'BRN',
    'Burkina Faso': 'BFA',
    'Burundi': 'BDI',
    'Cameroon': 'CMR',
    'Cape Verde': 'CPV',
    'Cayman Islands': 'CYM',
    'Central African Republic': 'CAF',
    'Chad': 'TCD',
    'Christmas Island[Australia]': 'CXR',
    'Cocos (Keeling) Islands': 'CCK',
    'Comoros': 'COM',
    'Congo': 'COG',
    'Cook Islands': 'COK',
    'Cote d\'Ivoire': 'CIV',
    'Cuba': 'CUB',
    'Djibouti': 'DJI',
    'Dominica': 'DMA',
    'Dominican Republic': 'DOM',
    'East Timor': 'TLS',
    'El Salvador': 'SLV',
    'Eritrea': 'ERI',
    'European Union': 'EUR',
    'Faeroe Islands': 'FRO',
    'Fiji': 'FJI',
    'French Guiana': 'GUF',
    'French Southern Territories': 'ATF',
    'Gabon': 'GAB',
    'Georgia': 'GEO',
    'Grenada': 'GRD',
    'Guadeloupe': 'GLP',
    'Guam': 'GUM',
    'Guatemala': 'GTM',
    'Guinea': 'GIN',
    'Guinea-Bissau': 'GNB',
    'Guyana': 'GUY',
    'Haiti': 'HTI',
    'Holy See (Vatican)': 'VAT',
    'Honduras': 'HND',
    'Hong Kong': 'HKG',
    'Iran, Islamic Republic of': 'IRN',
    'Isle of Man': 'IMN',
    'Jamaica': 'JAM',
    'Kazakstan': 'KAZ',
    'Kiribati': 'KIR',
    'Kosovo': 'XKX',
    'Kyrgyzstan': 'KGZ',
    'Lao People\'s Democratic Republic': 'LAO',
    'Lesotho': 'LSO',
    'Liberia': 'LBR',
    'Libyan Arab Jamahiriya': 'LBY',
    'Liechtenstein': 'LIE',
    'Macau': 'MAC',
    'Macedonia': 'MKD',
    'Madagascar': 'MDG',
    'Malawi': 'MWI',
    'Mali': 'MLI',
    'Marshall Islands': 'MHL',
    'Mauritania': 'MRT',
    'Micronesia, Federated States of': 'FSM',
    'Midway Islands': 'UMI',
    'Moldova': 'MDA',
    'Monaco': 'MCO',
    'Montenegro': 'MNE',
    'Montserrat': 'MSR',
    'Mozambique': 'MOZ',
    'Namibia': 'NAM',
    'Nauru': 'NRU',
    'New Caledonia': 'NCL',
    'Nicaragua': 'NIC',
    'Niger': 'NER',
    'Niue': 'NIU',
    'Northern Mariana Islands': 'MNP',
    'Papua New Guinea': 'PNG',
    'Pitcairn': 'PCN',
    'Puerto Rico': 'PRI',
    'Republic of Moldova': 'MDA',
    'Reunion': 'REU',
    'Rwanda': 'RWA',
    'Saint Helena': 'SHN',
    'Saint Kitts and Nevis': 'KNA',
    'Saint Lucia': 'LCA',
    'Saint Vincent and the Grenadines': 'VCT',
    'Samoa': 'WSM',
    'San Marino': 'SMR',
    'Sao Tome and Principe': 'STP',
    'Senegal': 'SEN',
    'Serbia (Europe)': 'SRB',
    'Seychelles': 'SYC',
    'Sierra Leone': 'SLE',
    'Solomon Islands': 'SLB',
    'Somalia': 'SOM',
    'South Sudan': 'SSD',
    'Sudan': 'SDN',
    'Suriname': 'SUR',
    'Swaziland': 'SWZ',
    'Syrian Arab Republic': 'SYR',
    'Tajikistan': 'TJK',
    'Tanzania': 'TZA',
    'The former Yugoslav Rep. Macedonia': 'MKD',
    'Togo': 'TGO',
    'Tokelau': 'TKL',
    'Trinidad and Tobago': 'TTO',
    'Turkmenistan': 'TKM',
    'Turks and Caicos Islands': 'TCA',
    'Uganda': 'UGA',
    'United Republic of Tanzania': 'TZA',
    'United States Virgin Islands': 'VIR',
    'Uzbekistan': 'UZB',
    'Vanuatu': 'VUT',
    'Viet Nam': 'VNM',
    'Wallis and Futuna Islands': 'WLF',
    'Western Sahara': 'ESH',
    'Yemen': 'YEM',
    'Yugoslavia': 'YUG',
    'Zaire': 'ZAR',
    'Zambia': 'ZMB',
    'Zimbabwe': 'ZWE'
  };

  // Normalize country name for mapping
  const normalizedName = countryName.trim();
  
  // Direct mapping
  if (countryMapping[normalizedName]) {
    return countryMapping[normalizedName];
  }
  
  // Try partial matching for common variations
  for (const [name, iso] of Object.entries(countryMapping)) {
    if (normalizedName.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(normalizedName.toLowerCase())) {
      return iso;
    }
  }
  
  return null;
};

// Function to get English country name from ISO code
const getEnglishCountryName = (iso, fallbackName = 'Unknown') => {
  const isoToCountry = {
    // Existing mappings
    'IND': 'India',
    'CHN': 'China',
    'USA': 'United States',
    'GBR': 'United Kingdom',
    'DEU': 'Germany',
    'FRA': 'France',
    'ITA': 'Italy',
    'JPN': 'Japan',
    'CAN': 'Canada',
    'AUS': 'Australia',
    'BRA': 'Brazil',
    'RUS': 'Russia',
    'KOR': 'South Korea',
    'PRK': 'North Korea',
    'ESP': 'Spain',
    'MEX': 'Mexico',
    'IDN': 'Indonesia',
    'NLD': 'Netherlands',
    'SAU': 'Saudi Arabia',
    'TUR': 'Turkey',
    'TWN': 'Taiwan',
    'BEL': 'Belgium',
    'CHE': 'Switzerland',
    'IRL': 'Ireland',
    'ISR': 'Israel',
    'AUT': 'Austria',
    'THA': 'Thailand',
    'NGA': 'Nigeria',
    'ARG': 'Argentina',
    'EGY': 'Egypt',
    'ZAF': 'South Africa',
    'MYS': 'Malaysia',
    'PHL': 'Philippines',
    'BGD': 'Bangladesh',
    'VNM': 'Vietnam',
    'CHL': 'Chile',
    'FIN': 'Finland',
    'SGP': 'Singapore',
    'DNK': 'Denmark',
    'NOR': 'Norway',
    'NZL': 'New Zealand',
    'ARE': 'United Arab Emirates',
    'PRT': 'Portugal',
    'CZE': 'Czech Republic',
    'ROU': 'Romania',
    'POL': 'Poland',
    'PER': 'Peru',
    'GRC': 'Greece',
    'IRQ': 'Iraq',
    'QAT': 'Qatar',
    'HUN': 'Hungary',
    'KWT': 'Kuwait',
    'UKR': 'Ukraine',
    'MAR': 'Morocco',
    'SVK': 'Slovakia',
    'ECU': 'Ecuador',
    'KEN': 'Kenya',
    'ETH': 'Ethiopia',
    'LKA': 'Sri Lanka',
    'PAK': 'Pakistan',
    'IRN': 'Iran',
    'COL': 'Colombia',
    'VEN': 'Venezuela',
    'DZA': 'Algeria',
    'SWE': 'Sweden',
    'OMN': 'Oman',
    'MMR': 'Myanmar',
    'JOR': 'Jordan',
    'TUN': 'Tunisia',
    'GHA': 'Ghana',
    'URY': 'Uruguay',
    'SVN': 'Slovenia',
    'LTU': 'Lithuania',
    'HRV': 'Croatia',
    'PAN': 'Panama',
    'BGR': 'Bulgaria',
    'CRI': 'Costa Rica',
    'LBN': 'Lebanon',
    'BLR': 'Belarus',
    'SRB': 'Serbia',
    'PRY': 'Paraguay',
    'KHM': 'Cambodia',
    'LVA': 'Latvia',
    'EST': 'Estonia',
    'MUS': 'Mauritius',
    'CYP': 'Cyprus',
    'LUX': 'Luxembourg',
    'MLT': 'Malta',
    'ISL': 'Iceland',
    'BHR': 'Bahrain',
    'MNG': 'Mongolia',
    'BRN': 'Brunei',
    'MDV': 'Maldives',
    'BTN': 'Bhutan',
    'AFG': 'Afghanistan',
    'NPL': 'Nepal',
    'ARM': 'Armenia',
    'ATA': 'Antarctica',
    // Additional mappings for missing countries
    'ALB': 'Albania',
    'ASM': 'American Samoa',
    'AND': 'Andorra',
    'AGO': 'Angola',
    'AIA': 'Anguilla',
    'ATG': 'Antigua and Barbuda',
    'ABW': 'Aruba',
    'AZE': 'Azerbaijan',
    'BHS': 'Bahamas',
    'BRB': 'Barbados',
    'BLZ': 'Belize',
    'BEN': 'Benin',
    'BMU': 'Bermuda',
    'BOL': 'Bolivia',
    'BIH': 'Bosnia and Herzegovina',
    'BWA': 'Botswana',
    'BVT': 'Bouvet Island',
    'IOT': 'British Indian Ocean Territory',
    'BFA': 'Burkina Faso',
    'BDI': 'Burundi',
    'CMR': 'Cameroon',
    'CPV': 'Cape Verde',
    'CYM': 'Cayman Islands',
    'CAF': 'Central African Republic',
    'TCD': 'Chad',
    'CXR': 'Christmas Island',
    'CCK': 'Cocos (Keeling) Islands',
    'COM': 'Comoros',
    'COG': 'Congo',
    'COK': 'Cook Islands',
    'CIV': 'Cote d\'Ivoire',
    'CUB': 'Cuba',
    'DJI': 'Djibouti',
    'DMA': 'Dominica',
    'DOM': 'Dominican Republic',
    'TLS': 'East Timor',
    'SLV': 'El Salvador',
    'ERI': 'Eritrea',
    'EUR': 'European Union',
    'FRO': 'Faeroe Islands',
    'FJI': 'Fiji',
    'GUF': 'French Guiana',
    'ATF': 'French Southern Territories',
    'GAB': 'Gabon',
    'GEO': 'Georgia',
    'GRD': 'Grenada',
    'GLP': 'Guadeloupe',
    'GUM': 'Guam',
    'GTM': 'Guatemala',
    'GIN': 'Guinea',
    'GNB': 'Guinea-Bissau',
    'GUY': 'Guyana',
    'HTI': 'Haiti',
    'VAT': 'Holy See (Vatican)',
    'HND': 'Honduras',
    'HKG': 'Hong Kong',
    'IMN': 'Isle of Man',
    'JAM': 'Jamaica',
    'KAZ': 'Kazakhstan',
    'KIR': 'Kiribati',
    'XKX': 'Kosovo',
    'KGZ': 'Kyrgyzstan',
    'LAO': 'Lao People\'s Democratic Republic',
    'LSO': 'Lesotho',
    'LBR': 'Liberia',
    'LBY': 'Libyan Arab Jamahiriya',
    'LIE': 'Liechtenstein',
    'MAC': 'Macau',
    'MKD': 'Macedonia',
    'MDG': 'Madagascar',
    'MWI': 'Malawi',
    'MLI': 'Mali',
    'MHL': 'Marshall Islands',
    'MRT': 'Mauritania',
    'FSM': 'Micronesia, Federated States of',
    'UMI': 'Midway Islands',
    'MDA': 'Moldova',
    'MCO': 'Monaco',
    'MNE': 'Montenegro',
    'MSR': 'Montserrat',
    'MOZ': 'Mozambique',
    'NAM': 'Namibia',
    'NRU': 'Nauru',
    'NCL': 'New Caledonia',
    'NIC': 'Nicaragua',
    'NER': 'Niger',
    'NIU': 'Niue',
    'MNP': 'Northern Mariana Islands',
    'PNG': 'Papua New Guinea',
    'PCN': 'Pitcairn',
    'PRI': 'Puerto Rico',
    'REU': 'Reunion',
    'RWA': 'Rwanda',
    'SHN': 'Saint Helena',
    'KNA': 'Saint Kitts and Nevis',
    'LCA': 'Saint Lucia',
    'VCT': 'Saint Vincent and the Grenadines',
    'WSM': 'Samoa',
    'SMR': 'San Marino',
    'STP': 'Sao Tome and Principe',
    'SEN': 'Senegal',
    'SYC': 'Seychelles',
    'SLE': 'Sierra Leone',
    'SLB': 'Solomon Islands',
    'SOM': 'Somalia',
    'SSD': 'South Sudan',
    'SDN': 'Sudan',
    'SUR': 'Suriname',
    'SWZ': 'Swaziland',
    'SYR': 'Syrian Arab Republic',
    'TJK': 'Tajikistan',
    'TZA': 'Tanzania',
    'TGO': 'Togo',
    'TKL': 'Tokelau',
    'TTO': 'Trinidad and Tobago',
    'TKM': 'Turkmenistan',
    'TCA': 'Turks and Caicos Islands',
    'UGA': 'Uganda',
    'VIR': 'United States Virgin Islands',
    'UZB': 'Uzbekistan',
    'VUT': 'Vanuatu',
    'WLF': 'Wallis and Futuna Islands',
    'ESH': 'Western Sahara',
    'YEM': 'Yemen',
    'YUG': 'Yugoslavia',
    'ZAR': 'Zaire',
    'ZMB': 'Zambia',
    'ZWE': 'Zimbabwe'
  };

  return isoToCountry[iso] || fallbackName;
};

// Function to get English country name from GeoJSON properties
const getEnglishNameFromGeoJSON = (properties) => {
  // Try to get ISO code from various possible properties
  const iso = properties.ISO_A3 || properties.ADM0_A3 || properties.ISO3 || properties.iso_a3;
  
  if (iso && iso !== '-99') {
    const englishName = getEnglishCountryName(iso);
    if (englishName !== 'Unknown') {
      return englishName;
    }
  }
  
  // Fallback to English name properties, prioritizing NAME_EN if available
  return properties.NAME_EN || 
         properties.NAME || 
         properties.ADMIN || 
         properties.name_en || 
         properties.name || 
         'Unknown';
};

// Country coordinates for map markers
const getCountryCoordinates = (countryName) => {
  const countryCoords = {
    // Existing coordinates
    'India': [20.5937, 78.9629],
    'China': [35.8617, 104.1954],
    'United States': [37.0902, -95.7129],
    'USA': [37.0902, -95.7129],
    'United Kingdom': [55.3781, -3.4360],
    'Germany': [51.1657, 10.4515],
    'France': [46.2276, 2.2137],
    'Italy': [41.8719, 12.5674],
    'Japan': [36.2048, 138.2529],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'Brazil': [-14.2350, -51.9253],
    'Russia': [61.5240, 105.3188],
    'South Korea': [35.9078, 127.7669],
    'Korea, Republic of': [35.9078, 127.7669],
    'Korea, Democratic People\'s Rep. of': [40.3399, 127.5101],
    'North Korea': [40.3399, 127.5101],
    'Spain': [40.4637, -3.7492],
    'Mexico': [23.6345, -102.5528],
    'Indonesia': [-0.7893, 113.9213],
    'Netherlands': [52.1326, 5.2913],
    'Saudi Arabia': [23.8859, 45.0792],
    'Turkey': [38.9637, 35.2433],
    'Taiwan': [23.6978, 120.9605],
    'Belgium': [50.5039, 4.4699],
    'Switzerland': [46.8182, 8.2275],
    'Ireland': [53.4129, -8.2439],
    'Israel': [31.0461, 34.8516],
    'Austria': [47.5162, 14.5501],
    'Thailand': [15.8700, 100.9925],
    'Nigeria': [9.0820, 8.6753],
    'Argentina': [-38.4161, -63.6167],
    'Bangladesh': [23.6850, 90.3563],
    'United Arab Emirates': [23.4241, 53.8478],
    'Malaysia': [4.2105, 101.9758],
    'Singapore': [1.3521, 103.8198],
    'South Africa': [-30.5595, 22.9375],
    'Chile': [-35.6751, -71.5430],
    'Egypt': [26.0975, 30.0444],
    'Norway': [60.4720, 8.4689],
    'Finland': [61.9241, 25.7482],
    'Denmark': [56.2639, 9.5018],
    'Portugal': [39.3999, -8.2245],
    'Greece': [39.0742, 21.8243],
    'New Zealand': [-40.9006, 174.8860],
    'Czech Republic': [49.8175, 15.4730],
    'Hungary': [47.1625, 19.5033],
    'Poland': [51.9194, 19.1451],
    'Romania': [45.9432, 24.9668],
    'Sweden': [60.1282, 18.6435],
    'Ukraine': [48.3794, 31.1656],
    'Philippines': [12.8797, 121.7740],
    'Vietnam': [14.0583, 108.2772],
    'Morocco': [31.7917, -7.0926],
    'Kenya': [-0.0236, 37.9062],
    'Ethiopia': [9.1450, 40.4897],
    'Sri Lanka': [7.8731, 80.7718],
    'Pakistan': [30.3753, 69.3451],
    'Iran': [32.4279, 53.6880],
    'Colombia': [4.5709, -74.2973],
    'Venezuela': [6.4238, -66.5897],
    'Algeria': [28.0339, 1.6596],
    'Oman': [21.4735, 55.9754],
    'Myanmar': [21.9162, 95.9560],
    'Jordan': [30.5852, 36.2384],
    'Tunisia': [33.8869, 9.5375],
    'Ghana': [7.9465, -1.0232],
    'Uruguay': [-32.5228, -55.7658],
    'Slovenia': [46.1512, 14.9955],
    'Lithuania': [55.1694, 23.8813],
    'Croatia': [45.1000, 15.2000],
    'Panama': [8.5380, -80.7821],
    'Bulgaria': [42.7339, 25.4858],
    'Costa Rica': [9.7489, -83.7534],
    'Lebanon': [33.8547, 35.8623],
    'Belarus': [53.7098, 27.9534],
    'Serbia': [44.0165, 21.0059],
    'Paraguay': [-23.4425, -58.4438],
    'Cambodia': [12.5657, 104.9910],
    'Latvia': [56.8796, 24.6032],
    'Estonia': [58.5953, 25.0136],
    'Mauritius': [-20.3484, 57.5522],
    'Cyprus': [35.1264, 33.4299],
    'Luxembourg': [49.8153, 6.1296],
    'Malta': [35.9375, 14.3754],
    'Iceland': [64.9631, -19.0208],
    'Bahrain': [25.9304, 50.6378],
    'Mongolia': [47.0105, 106.9057],
    'Brunei': [4.5353, 114.7277],
    'Maldives': [3.2028, 73.2207],
    'Bhutan': [27.5142, 90.4336],
    'Afghanistan': [33.9391, 67.7100],
    'Nepal': [28.3949, 84.1240],
    'Armenia': [40.0691, 45.0382],
    'Antarctica': [-82.8628, 135.0000],
    'Taiwan, Republic of China': [23.6978, 120.9605],
    'Taiwan, Province of China': [23.6978, 120.9605],
    'Russian Federation': [61.5240, 105.3188],
    // Additional coordinates for missing countries from Excel data
    'Albania': [41.1533, 20.1683],
    'American Samoa': [-14.2710, -170.1322],
    'Andorra': [42.5462, 1.6016],
    'Angola': [-11.2027, 17.8739],
    'Anguilla': [18.2206, -63.0686],
    'Antigua and Barbuda': [17.0608, -61.7964],
    'Aruba': [12.5211, -69.9683],
    'Azerbaijan': [40.1431, 47.5769],
    'Bahamas': [25.0343, -77.3963],
    'Barbados': [13.1939, -59.5432],
    'Belize': [17.1899, -88.4976],
    'Benin': [9.3077, 2.3158],
    'Bermuda': [32.3078, -64.7505],
    'Bolivia': [-16.2902, -63.5887],
    'Bosnia and Herzegovina': [43.9159, 17.6791],
    'Botswana': [-22.3285, 24.6849],
    'Bouvet Island': [-54.4208, 3.3464],
    'British Indian Ocean Territory': [-6.0000, 71.5000],
    'Brunei Darussalam': [4.5353, 114.7277],
    'Burkina Faso': [12.2383, -1.5616],
    'Burundi': [-3.3731, 29.9189],
    'Cameroon': [7.3697, 12.3547],
    'Cape Verde': [16.5388, -24.0132],
    'Cayman Islands': [19.3133, -81.2546],
    'Central African Republic': [6.6111, 20.9394],
    'Chad': [15.4542, 18.7322],
    'Christmas Island[Australia]': [-10.4475, 105.6904],
    'Cocos (Keeling) Islands': [-12.1642, 96.8710],
    'Comoros': [-11.6455, 43.3333],
    'Congo': [-0.2280, 15.8277],
    'Cook Islands': [-21.2367, -159.7777],
    'Cote d\'Ivoire': [7.5400, -5.5471],
    'Cuba': [21.5218, -77.7812],
    'Djibouti': [11.8251, 42.5903],
    'Dominica': [15.4150, -61.3710],
    'Dominican Republic': [18.7357, -70.1627],
    'East Timor': [-8.8742, 125.7275],
    'El Salvador': [13.7942, -88.8965],
    'Eritrea': [15.1794, 39.7823],
    'European Union': [54.5260, 15.2551],
    'Faeroe Islands': [61.8926, -6.9118],
    'Fiji': [-16.7784, 179.4144],
    'French Guiana': [3.9339, -53.1258],
    'French Southern Territories': [-49.2804, 69.3486],
    'Gabon': [-0.8037, 11.6094],
    'Georgia': [42.3154, 43.3569],
    'Grenada': [12.1165, -61.6790],
    'Guadeloupe': [16.9950, -62.0674],
    'Guam': [13.4443, 144.7937],
    'Guatemala': [15.7835, -90.2308],
    'Guinea': [9.9456, -9.6966],
    'Guinea-Bissau': [11.8037, -15.1804],
    'Guyana': [4.8604, -58.9302],
    'Haiti': [18.9712, -72.2852],
    'Holy See (Vatican)': [41.9029, 12.4534],
    'Honduras': [15.2000, -86.2419],
    'Hong Kong': [22.3193, 114.1694],
    'Iran, Islamic Republic of': [32.4279, 53.6880],
    'Isle of Man': [54.2361, -4.5481],
    'Jamaica': [18.1096, -77.2975],
    'Kazakstan': [48.0196, 66.9237],
    'Kiribati': [-3.3704, -168.7340],
    'Kosovo': [42.6026, 20.9030],
    'Kyrgyzstan': [41.2044, 74.7661],
    'Lao People\'s Democratic Republic': [19.8563, 102.4955],
    'Lesotho': [-29.6100, 28.2336],
    'Liberia': [6.4281, -9.4295],
    'Libyan Arab Jamahiriya': [26.3351, 17.2283],
    'Liechtenstein': [47.1660, 9.5554],
    'Macau': [22.1987, 113.5439],
    'Macedonia': [41.6086, 21.7453],
    'Madagascar': [-18.7669, 46.8691],
    'Malawi': [-13.2543, 34.3015],
    'Mali': [17.5707, -3.9962],
    'Marshall Islands': [7.1315, 171.1845],
    'Mauritania': [21.0079, -10.9408],
    'Micronesia, Federated States of': [7.4256, 150.5508],
    'Midway Islands': [28.2072, -177.3735],
    'Moldova': [47.4116, 28.3699],
    'Monaco': [43.7384, 7.4246],
    'Montenegro': [42.7087, 19.3744],
    'Montserrat': [16.7425, -62.1874],
    'Mozambique': [-18.6657, 35.5296],
    'Namibia': [-22.9576, 18.4904],
    'Nauru': [-0.5228, 166.9315],
    'New Caledonia': [-20.9043, 165.6180],
    'Nicaragua': [12.8654, -85.2072],
    'Niger': [17.6078, 8.0817],
    'Niue': [-19.0544, -169.8672],
    'Northern Mariana Islands': [17.3308, 145.3846],
    'Papua New Guinea': [-6.3150, 143.9555],
    'Pitcairn': [-24.7036, -127.4393],
    'Puerto Rico': [18.2208, -66.5901],
    'Republic of Moldova': [47.4116, 28.3699],
    'Reunion': [-21.1151, 55.5364],
    'Rwanda': [-1.9403, 29.8739],
    'Saint Helena': [-24.1434, -10.0307],
    'Saint Kitts and Nevis': [17.3578, -62.7830],
    'Saint Lucia': [13.9094, -60.9789],
    'Saint Vincent and the Grenadines': [12.9843, -61.2872],
    'Samoa': [-13.7590, -172.1046],
    'San Marino': [43.9424, 12.4578],
    'Sao Tome and Principe': [0.1864, 6.6131],
    'Senegal': [14.4974, -14.4524],
    'Serbia (Europe)': [44.0165, 21.0059],
    'Seychelles': [-4.6796, 55.4920],
    'Sierra Leone': [8.4606, -11.7799],
    'Solomon Islands': [-9.6457, 160.1562],
    'Somalia': [5.1521, 46.1996],
    'South Sudan': [6.8769, 31.3069],
    'Sudan': [12.8628, 30.2176],
    'Suriname': [3.9193, -56.0278],
    'Swaziland': [-26.5225, 31.4659],
    'Syrian Arab Republic': [34.8021, 38.9968],
    'Tajikistan': [38.8610, 71.2761],
    'Tanzania': [-6.3690, 34.8888],
    'The former Yugoslav Rep. Macedonia': [41.6086, 21.7453],
    'Togo': [8.6195, 0.8248],
    'Tokelau': [-8.9676, -171.8554],
    'Trinidad and Tobago': [10.6918, -61.2225],
    'Turkmenistan': [38.9697, 59.5563],
    'Turks and Caicos Islands': [21.6940, -71.7979],
    'Uganda': [1.3733, 32.2903],
    'United Republic of Tanzania': [-6.3690, 34.8888],
    'United States Virgin Islands': [18.3358, -64.8963],
    'Uzbekistan': [41.3775, 64.5853],
    'Vanuatu': [-15.3767, 166.9592],
    'Viet Nam': [14.0583, 108.2772],
    'Wallis and Futuna Islands': [-13.7687, -177.1562],
    'Western Sahara': [24.2155, -12.8858],
    'Yemen': [15.5527, 48.5164],
    'Yugoslavia': [44.0165, 21.0059],
    'Zaire': [-4.0383, 21.7587],
    'Zambia': [-13.1339, 27.8493],
    'Zimbabwe': [-19.0154, 29.1549]
  };

  return countryCoords[countryName] || null;
};

// World Map Component using Leaflet
const WorldMap = ({ worldMapData, colorScale, analysisType, isMobile }) => {
  const [geoData, setGeoData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadWorldMapData().then(data => {
      setGeoData(data);
      setLoading(false);
    });
  }, []);

  // Get all trading countries for markers with rankings
  const allTradingCountries = React.useMemo(() => {
    if (!worldMapData.length) return [];
    
    return worldMapData
      .sort((a, b) => b.value - a.value)
      .map((country, index) => {
        const coords = getCountryCoordinates(country.country);
        return coords ? {
          ...country,
          coordinates: coords,
          rank: index + 1
        } : null;
      })
      .filter(Boolean);
  }, [worldMapData]);

  // Custom icon for trading country markers based on rank
  const createMarkerIcon = (rank) => {
    // Different colors and sizes based on ranking
    let backgroundColor, size, fontSize;
    
    if (rank <= 5) {
      // Top 5 - Large, bright gradient
      backgroundColor = 'linear-gradient(45deg, #FF6B6B, #4ECDC4)';
      size = 36;
      fontSize = 14;
    } else if (rank <= 10) {
      // Top 6-10 - Medium, orange gradient
      backgroundColor = 'linear-gradient(45deg, #FFA726, #FF7043)';
      size = 32;
      fontSize = 12;
    } else if (rank <= 20) {
      // Top 11-20 - Medium, blue gradient
      backgroundColor = 'linear-gradient(45deg, #42A5F5, #26C6DA)';
      size = 28;
      fontSize = 11;
    } else {
      // Rest - Smaller, purple gradient
      backgroundColor = 'linear-gradient(45deg, #AB47BC, #7E57C2)';
      size = 24;
      fontSize = 10;
    }
    
    return L.divIcon({
      className: 'custom-marker',
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
          ${rank <= 10 ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${rank}
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  const onEachCountry = (country, layer) => {
    const englishName = getEnglishNameFromGeoJSON(country.properties);
    const countryData = worldMapData.find(d => {
      // Try multiple property names for country identification
      return d.iso === country.properties.ISO_A3 ||
             d.iso === country.properties.ISO3 ||
             d.iso === country.properties.ADM0_A3;
    });

    // Check if this is Nepal
    const isNepal = country.properties.ISO_A3 === 'NPL' ||
                    country.properties.ISO3 === 'NPL' ||
                    country.properties.ADM0_A3 === 'NPL' ||
                    (country.properties.NAME && country.properties.NAME.toLowerCase().includes('nepal')) ||
                    (country.properties.ADMIN && country.properties.ADMIN.toLowerCase().includes('nepal'));

    if (countryData) {
      layer.bindTooltip(`
        <div>
          <strong>${englishName}</strong><br/>
          ${analysisType}: ${countryData.formattedValue} NPR
        </div>
      `, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    } else if (isNepal) {
      layer.bindTooltip(`
        <div>
          <strong>🇳🇵 Nepal (Home Country)</strong><br/>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">
            All trade data shown is Nepal's trade<br/>
            with other countries
          </div>
        </div>
      `, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    } else {
      layer.bindTooltip(englishName, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    }

    layer.on({
      mouseover: (e) => {
        if (isNepal) {
          // Special highlight for Nepal
          e.target.setStyle({
            weight: 4,
            color: '#FF6B35',
            dashArray: '5, 5',
            fillOpacity: 0.9
          });
        } else {
          e.target.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.9
          });
        }
      },
      mouseout: (e) => {
        if (isNepal) {
          // Keep special styling for Nepal
          e.target.setStyle({
            weight: 3,
            color: '#FF6B35',
            dashArray: '3, 3',
            fillOpacity: 0.8
          });
        } else {
          e.target.setStyle({
            weight: 1,
            color: '#D6D6DA',
            dashArray: '',
            fillOpacity: 0.7
          });
        }
      }
    });
  };

  const style = (feature) => {
    const countryData = worldMapData.find(d => {
      return d.iso === feature.properties.ISO_A3 ||
             d.iso === feature.properties.ISO3 ||
             d.iso === feature.properties.ADM0_A3;
    });

    // Check if this is Nepal
    const isNepal = feature.properties.ISO_A3 === 'NPL' ||
                    feature.properties.ISO3 === 'NPL' ||
                    feature.properties.ADM0_A3 === 'NPL' ||
                    (feature.properties.NAME && feature.properties.NAME.toLowerCase().includes('nepal')) ||
                    (feature.properties.ADMIN && feature.properties.ADMIN.toLowerCase().includes('nepal'));

    if (isNepal) {
      // Special styling for Nepal (home country)
      return {
        fillColor: '#FF6B35',
        weight: 3,
        opacity: 1,
        color: '#FF6B35',
        dashArray: '3, 3',
        fillOpacity: 0.8
      };
    }

    return {
      fillColor: countryData ? colorScale.getColor(countryData.value) : '#f0f0f0',
      weight: 1,
      opacity: 1,
      color: '#D6D6DA',
      dashArray: '',
      fillOpacity: 0.7
    };
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={isMobile ? 1 : 2}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={!isMobile}
    >
      {/* Base satellite layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.8}
      />
      
      {/* Terrain overlay */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        opacity={0.6}
      />
      
      {/* Political/roads overlay */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.3}
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={onEachCountry}
        />
      )}
      
      {/* Pin markers for all trading countries with rankings */}
      {allTradingCountries.map((country) => (
        <Marker
          key={`${country.country}-${country.rank}`}
          position={[country.coordinates[0], country.coordinates[1]]}
          icon={createMarkerIcon(country.rank)}
        >
          <Popup>
            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <strong style={{ 
                fontSize: '16px', 
                color: country.rank <= 5 ? '#FF6B6B' : 
                       country.rank <= 10 ? '#FFA726' : 
                       country.rank <= 20 ? '#42A5F5' : '#AB47BC'
              }}>
                #{country.rank} {country.country}
              </strong>
              <br />
              <div style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>{analysisType}:</strong> {country.formattedValue} NPR
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {country.rank <= 5 ? '🥇 Top 5 trading partner' :
                 country.rank <= 10 ? '🥈 Top 10 trading partner' :
                 country.rank <= 20 ? '🥉 Top 20 trading partner' :
                 `Rank ${country.rank} trading partner`}
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                Click to close
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Special marker for Nepal (home country) */}
      <Marker
        position={getCountryCoordinates('Nepal')}
        icon={L.divIcon({
          className: 'nepal-flag-marker',
          html: `
            <div style="
              font-size: 32px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              animation: nepalFlagPulse 3s infinite;
              filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.6));
            ">
              🇳🇵
            </div>
            <style>
              @keyframes nepalFlagPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            </style>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
        })}
      >
        <Popup>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              color: '#FF6B35',
              marginBottom: '8px'
            }}>
              🇳🇵 Nepal (Home Country)
            </div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>All trade data displayed represents:</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
              • Nepal's imports from other countries<br/>
              • Nepal's exports to other countries<br/>
              • Nepal's trade balance with partners
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#888', 
              marginTop: '10px',
              fontStyle: 'italic',
              borderTop: '1px solid #eee',
              paddingTop: '6px'
            }}>
              Trading partners are ranked by volume
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

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

const CountryDashboard = ({ data }) => {
  const [allCountryData, setAllCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2081/082');
  const [analysisType, setAnalysisType] = useState('Import');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [countryChartType, setCountryChartType] = useState('Line Trend');
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
        const countryData = await loadCountryData();
        setAllCountryData(countryData);
        
        const years = getAvailableYearsForDropdown(countryData);
        setAvailableYears(years);
        
        // Set default year to the latest available
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Error loading country data:', error);
        message.error('Failed to load country data from Excel files');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process current year data with region filtering
  const currentYearData = useMemo(() => {
    if (!allCountryData.length || !selectedYear) return [];
    
    let data = selectCountryYearData(allCountryData, selectedYear);
    
    // Filter by region if a specific region is selected
    if (selectedRegion && selectedRegion !== 'All Regions') {
      data = data.filter(item => {
        const country = item.country || item.Country || item.countries || item.Countries;
        return getCountryRegion(country) === selectedRegion;
      });
    }
    
    return data;
  }, [allCountryData, selectedYear, selectedRegion]);

  // Get top 10 countries based on analysis type
  const top10Data = useMemo(() => {
    if (!currentYearData.length) return null;
    
    const topCountries = getTopCountries(currentYearData, analysisType, 10);
    const chartData = prepareChartData(topCountries, analysisType);
    
    console.log('CountryDashboard - currentYearData length:', currentYearData.length);
    console.log('CountryDashboard - topCountries:', topCountries);
    console.log('CountryDashboard - chartData:', chartData);
    
    return chartData;
  }, [currentYearData, analysisType]);

  // Prepare world map data
  const worldMapData = useMemo(() => {
    if (!currentYearData.length) return [];
    
    const mapData = currentYearData.map(item => {
      const country = item.country || item.Country || item.countries || item.Countries;
      const iso = getCountryISO(country);
      
      let value;
      switch (analysisType) {
        case 'Import':
          value = item.imports || 0;
          break;
        case 'Export':
          value = item.exports || 0;
          break;
        case 'Trade Balance':
          value = item.tradeBalance || 0;
          break;
        default:
          value = item.totalTrade || 0;
      }
      
      return {
        iso,
        country,
        value,
        formattedValue: formatValue(value)
      };
    }).filter(item => item.iso && item.value > 0);
    
    console.log('WorldMap data:', mapData);
    return mapData;
  }, [currentYearData, analysisType]);

  // Calculate color scale for world map
  const colorScale = useMemo(() => {
    if (!worldMapData.length) return { min: 0, max: 0, getColor: () => '#f0f0f0' };
    
    const values = worldMapData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const getColor = (value) => {
      if (!value || value === 0) return '#f0f0f0';
      
      const normalized = (value - minValue) / (maxValue - minValue);
      
      // Color scale from light blue to dark blue
      const intensity = Math.max(0.2, normalized);
      const red = Math.floor(255 * (1 - intensity));
      const green = Math.floor(255 * (1 - intensity * 0.5));
      const blue = 255;
      
      return `rgb(${red}, ${green}, ${blue})`;
    };
    
    return { min: minValue, max: maxValue, getColor };
  }, [worldMapData]);

  // Get all country names for search (filtered by region)
  const allCountries = useMemo(() => {
    if (!allCountryData.length) return [];
    
    let countries = allCountryData.map(item => 
      item.Countries || item.countries || item.Country || item.country
    ).filter(Boolean);
    
    // Filter by region if a specific region is selected
    if (selectedRegion && selectedRegion !== 'All Regions') {
      countries = countries.filter(country => getCountryRegion(country) === selectedRegion);
    }
    
    return countries;
  }, [allCountryData, selectedRegion]);

  // Clear selected country when region changes if the country is not in the new region
  useEffect(() => {
    if (selectedCountry && selectedRegion !== 'All Regions') {
      const countryRegion = getCountryRegion(selectedCountry);
      if (countryRegion !== selectedRegion) {
        setSelectedCountry(null);
      }
    }
  }, [selectedRegion, selectedCountry]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return allCountries;
    return allCountries.filter(country =>
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCountries, searchTerm]);

  // Get trend data for selected country
  const trendData = useMemo(() => {
    if (!selectedCountry || !allCountryData.length) return null;
    
    console.log('Getting trend data for country:', selectedCountry);
    const data = getCountryTrendData(allCountryData, selectedCountry);
    console.log('Trend data result:', data);
    
    return data;
  }, [selectedCountry, allCountryData]);

  // Prepare trend chart data
  const trendChartData = useMemo(() => {
    if (!trendData) return null;
    
    console.log('Preparing trend chart data from:', trendData);
    
    let chartData;
    if (countryChartType === 'Line Trend') {
      chartData = prepareTrendChartData(trendData);
    } else {
      chartData = prepareTrendBarChartData(trendData);
    }
    
    console.log('Trend chart data result:', chartData);
    
    return chartData;
  }, [trendData, countryChartType]);

  // Get current stats for selected country
  const currentCountryStats = useMemo(() => {
    if (!selectedCountry || !currentYearData.length) return null;
    
    const countryData = currentYearData.find(item => 
      item.country === selectedCountry
    );
    
    if (!countryData) return null;
    
    return {
      imports: countryData.imports,
      exports: countryData.exports,
      tradeBalance: countryData.tradeBalance,
      totalTrade: countryData.totalTrade
    };
  }, [selectedCountry, currentYearData]);

  // Chart options for top 10 countries
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Top 10 ${analysisType} Countries ${selectedRegion !== 'All Regions' ? `(${selectedRegion})` : ''} - ${selectedYear}`,
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
          const value = context.parsed ? context.parsed.y : (context.dataset.data[context.dataIndex] || 0);
          const maxValue = Math.max(...context.dataset.data);
          return value > maxValue * 0.05; // Show label if value is more than 5% of max
        },
        anchor: 'end',
        align: 'end',
        formatter: function(value, context) {
          // Use the actual value from the dataset if value parameter is not reliable
          const actualValue = context && context.parsed ? context.parsed.y : value;
          return formatValue(actualValue);
        },
        color: 'white',
        font: {
          size: isMobile ? 8 : 10,
          weight: 'bold'
        },
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderRadius: 4,
        padding: {
          top: 2,
          bottom: 2,
          left: 4,
          right: 4
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
            const value = context.parsed.y; // y for vertical bars
            return `${context.dataset.label}: ${formatValue(value)} NPR`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Countries',
          font: {
            size: isMobile ? 12 : 14,
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            if (isMobile && label && label.length > 15) {
              return label.substring(0, 15) + '...';
            }
            return label;
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
  }), [analysisType, selectedYear, selectedRegion, isMobile]);

  const trendChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${countryChartType} for: ${selectedCountry ? 
          (selectedCountry.length > 25 ? selectedCountry.substring(0, 25) + '...' : selectedCountry) 
          : 'Select a Country'}`,
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
        display: countryChartType === 'Bar Trend' && !isMobile,
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
  }), [selectedCountry, countryChartType, isMobile]);

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
              View the top 10 countries based on Nepal imports from, Nepal exports to, or trade balance for selected fiscal years. 
              You can also search for a specific country to see detailed trade trends: how much Nepal imported from or Nepal exported to and compare them using line or bar charts.
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
                    <Tooltip title="Select the fiscal year to view trade data for that specific period. Data shows Nepal's trade relationships with different countries.">
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
                    }}>Region</label>
                    <Tooltip title="Filter countries by geographic region to focus your analysis on specific areas of the world. Select 'All Regions' to view global trade data.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={selectedRegion}
                    onChange={setSelectedRegion}
                    style={{ width: '100%' }}
                  >
                    <Option value="All Regions">All Regions</Option>
                    <Option value="South Asia">South Asia</Option>
                    <Option value="East Asia">East Asia</Option>
                    <Option value="Southeast Asia">Southeast Asia</Option>
                    <Option value="Middle East">Middle East</Option>
                    <Option value="Europe">Europe</Option>
                    <Option value="North America">North America</Option>
                    <Option value="South America">South America</Option>
                    <Option value="Africa">Africa</Option>
                    <Option value="Oceania">Oceania</Option>
                    <Option value="Other">Other</Option>
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
                    <Tooltip title="Choose what type of trade data to analyze: Imports (goods Nepal buys from other countries), Exports (goods Nepal sells to other countries), or Trade Balance (difference between exports and imports).">
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

          {/* World Map Visualization */}
          <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GlobalOutlined />
                    <span>Global Trade Map - {analysisType} Values {selectedRegion !== 'All Regions' ? `(${selectedRegion})` : ''} - {selectedYear}</span>
                  </div>
                }
                style={{ marginBottom: isMobile ? '16px' : '24px' }}
              >
                <div style={{ 
                  height: isMobile ? '400px' : '500px',
                  width: '100%',
                  position: 'relative'
                }}>
                  {worldMapData.length > 0 ? (
                    <>
                      <WorldMap 
                        worldMapData={worldMapData}
                        colorScale={colorScale}
                        analysisType={analysisType}
                        isMobile={isMobile}
                      />
                      
                      {/* Collapsible Legend */}
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
                            Map Legend
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
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: isMobile ? '12px' : '14px' }}>
                              {analysisType} Value (NPR)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                              <div style={{
                                width: '20px',
                                height: '12px',
                                background: 'linear-gradient(to right, #f0f0f0, #0066ff)',
                                border: '1px solid #ccc'
                              }}></div>
                              <span>{formatValue(colorScale.min)} - {formatValue(colorScale.max)}</span>
                            </div>
                            
                            <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: isMobile ? '11px' : '12px' }}>
                              Home Country:
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <div style={{
                                width: '20px', height: '12px', borderRadius: '4px',
                                background: 'linear-gradient(45deg, #FF6B35, #DC143C)',
                                border: '1px solid white',
                                position: 'relative'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '8px'
                                }}>🇳🇵</div>
                              </div>
                              <span style={{ fontSize: isMobile ? '10px' : '11px' }}>Nepal (All trade data source)</span>
                            </div>
                            
                            <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: isMobile ? '11px' : '12px' }}>
                              Trading Partner Rankings:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '16px', height: '16px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>🥇 Top 1-5</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '14px', height: '14px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #FFA726, #FF7043)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>🥈 Top 6-10</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '12px', height: '12px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #42A5F5, #26C6DA)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>🥉 Top 11-20</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: '10px', height: '10px', borderRadius: '50%',
                                  background: 'linear-gradient(45deg, #AB47BC, #7E57C2)',
                                  border: '1px solid white'
                                }}></div>
                                <span style={{ fontSize: isMobile ? '10px' : '11px' }}>Others (21+)</span>
                              </div>
                            </div>
                            
                            <div style={{ fontSize: '9px', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                              Click pins for details • Hover countries for values
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
                        <GlobalOutlined style={{ fontSize: isMobile ? '32px' : '48px', color: '#ccc', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#666' }}>No Trade Data Available</h3>
                        <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#999' }}>
                          No countries found with trade data for the selected criteria.
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
                      <p style={{ fontSize: isMobile ? '12px' : '14px' }}>Loading country data or no countries found for the selected criteria.</p>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Search Country Section */}
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
                      Search Country for Trend Analysis
                    </label>
                    <Tooltip title="Search and select a specific country to view Nepal's detailed trade relationship over time. Analyze import/export trends and trade patterns with individual countries across different fiscal years.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '14px' }} />
                    </Tooltip>
                  </div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Search for a country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      prefix={<SearchOutlined />}
                      size={isMobile ? 'middle' : 'large'}
                    />
                    <Select
                      placeholder="Select country"
                      style={{ width: '200px' }}
                      value={selectedCountry}
                      onChange={setSelectedCountry}
                      showSearch
                      allowClear
                      size={isMobile ? 'middle' : 'large'}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {filteredCountries.map(country => (
                        <Option key={country} value={country}>{country}</Option>
                      ))}
                    </Select>
                  </Space.Compact>
                </div>
              </Col>

            </Row>
          </div>

          {/* Country-Focused Map */}
          {selectedCountry && currentCountryStats && (
            <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              <Col xs={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GlobalOutlined />
                      <span>Country Focus Map - {selectedCountry}</span>
                    </div>
                  }
                  style={{ marginBottom: isMobile ? '16px' : '24px' }}
                >
                  <div style={{ 
                    height: isMobile ? '300px' : '400px',
                    width: '100%',
                    position: 'relative'
                  }}>
                    <CountryFocusedMap
                      countryName={selectedCountry}
                      countryData={currentCountryStats}
                      analysisType={analysisType}
                      isMobile={isMobile}
                    />
                    
                    {/* Map Info Panel */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxWidth: isMobile ? '180px' : '220px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: isMobile ? '12px' : '14px' }}>
                        {selectedCountry}
                      </div>
                      <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Current {analysisType}:</strong>
                        </div>
                        <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 'bold', color: '#2196F3' }}>
                          {analysisType === 'Import' && formatValue(currentCountryStats.imports)} 
                          {analysisType === 'Export' && formatValue(currentCountryStats.exports)}
                          {analysisType === 'Trade Balance' && formatValue(currentCountryStats.tradeBalance)} NPR
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>
                          📍 Click marker for full details
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Chart Type Selector - positioned below the country-focused map */}
          {selectedCountry && (
            <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '12px' : '16px' }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div className="control-group" style={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', justifyContent: 'center' }}>
                    <label style={{ 
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '600',
                      display: 'block',
                      color: '#374151',
                      margin: 0
                    }}>
                      Chart Type
                    </label>
                    <Tooltip title="Choose how to display the selected country's trade trend: Line Chart for continuous trend visualization or Bar Chart for period-by-period comparison.">
                      <QuestionCircleOutlined style={{ color: '#64748b', fontSize: '12px' }} />
                    </Tooltip>
                  </div>
                  <Radio.Group
                    value={countryChartType}
                    onChange={(e) => setCountryChartType(e.target.value)}
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
            </Row>
          )}

          {/* Country Trend Analysis */}
          {selectedCountry && trendChartData && (
            <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: isMobile ? '16px' : '24px' }}>
              <Col xs={24}>
                <div className="chart-container" style={{ 
                  height: isMobile ? '400px' : '350px',
                  minHeight: isMobile ? '400px' : '350px'
                }}>
                  {countryChartType === 'Line Trend' ? (
                    <Line data={trendChartData} options={trendChartOptions} />
                  ) : (
                    <Bar data={trendChartData} options={trendChartOptions} />
                  )}
                </div>
              </Col>
            </Row>
          )}

          {/* Country Statistics */}
          {selectedCountry && currentCountryStats && (
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
                      {formatValue(currentCountryStats.imports)} NPR
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
                      {formatValue(currentCountryStats.exports)} NPR
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
                      {formatValue(currentCountryStats.tradeBalance)} NPR
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
                      {formatValue(currentCountryStats.totalTrade)} NPR
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      marginTop: '4px'
                    }}>
                      Total Trade
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

// Country-focused Map Component
const CountryFocusedMap = ({ countryName, countryData, analysisType, isMobile }) => {
  const [geoData, setGeoData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadWorldMapData().then(data => {
      setGeoData(data);
      setLoading(false);
    });
  }, []);

  const countryCoords = getCountryCoordinates(countryName);
  const countryISO = getCountryISO(countryName);

  if (loading || !countryCoords) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        {loading ? <Spin size="large" /> : (
          <div style={{ textAlign: 'center' }}>
            <GlobalOutlined style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
            <p>Map coordinates not available for {countryName}</p>
          </div>
        )}
      </div>
    );
  }

  const onEachCountry = (country, layer) => {
    const englishName = getEnglishNameFromGeoJSON(country.properties);
    const isSelectedCountry = country.properties.ISO_A3 === countryISO ||
                             country.properties.ISO3 === countryISO ||
                             country.properties.ADM0_A3 === countryISO ||
                             (country.properties.NAME && country.properties.NAME.toLowerCase().includes(countryName.toLowerCase())) ||
                             (country.properties.ADMIN && country.properties.ADMIN.toLowerCase().includes(countryName.toLowerCase()));

    if (isSelectedCountry && countryData) {
      layer.bindTooltip(`
        <div style="font-size: 14px;">
          <strong style="font-size: 16px;">${englishName}</strong><br/>
          <div style="margin: 8px 0;">
            <strong>Imports:</strong> ${formatValue(countryData.imports)} NPR<br/>
            <strong>Exports:</strong> ${formatValue(countryData.exports)} NPR<br/>
            <strong>Trade Balance:</strong> ${formatValue(countryData.tradeBalance)} NPR<br/>
            <strong>Total Trade:</strong> ${formatValue(countryData.totalTrade)} NPR
          </div>
          <div style="font-size: 12px; color: #666;">
            Current focus: ${analysisType}
          </div>
        </div>
      `, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    } else {
      layer.bindTooltip(englishName, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    }
  };

  const style = (feature) => {
    const isSelectedCountry = feature.properties.ISO_A3 === countryISO ||
                             feature.properties.ISO3 === countryISO ||
                             feature.properties.ADM0_A3 === countryISO ||
                             (feature.properties.NAME && feature.properties.NAME.toLowerCase().includes(countryName.toLowerCase())) ||
                             (feature.properties.ADMIN && feature.properties.ADMIN.toLowerCase().includes(countryName.toLowerCase()));

    if (isSelectedCountry) {
      // Highlight the selected country
      return {
        fillColor: '#FF6B6B',
        weight: 3,
        opacity: 1,
        color: '#FF4444',
        dashArray: '',
        fillOpacity: 0.8
      };
    } else {
      // Dim other countries
      return {
        fillColor: '#e8e8e8',
        weight: 1,
        opacity: 0.6,
        color: '#ccc',
        dashArray: '',
        fillOpacity: 0.3
      };
    }
  };

  // Create a custom marker for the selected country
  const createCountryMarker = () => {
    return L.divIcon({
      className: 'country-focus-marker',
      html: `
        <div style="
          background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          animation: pulse 2s infinite;
        ">
          📍
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  return (
    <MapContainer
      center={countryCoords}
      zoom={isMobile ? 4 : 5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={!isMobile}
    >
      {/* Base satellite layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.8}
      />
      
      {/* Terrain overlay */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        opacity={0.6}
      />
      
      {/* Political/roads overlay */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.3}
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={onEachCountry}
        />
      )}
      
      {/* Marker for the selected country */}
      <Marker
        position={countryCoords}
        icon={createCountryMarker()}
      >
        <Popup>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <strong style={{ fontSize: '18px', color: '#FF6B6B' }}>
              {countryName}
            </strong>
            {countryData && (
              <div style={{ margin: '12px 0', fontSize: '14px', textAlign: 'left' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Imports:</strong> {formatValue(countryData.imports)} NPR
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Exports:</strong> {formatValue(countryData.exports)} NPR
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Trade Balance:</strong> {formatValue(countryData.tradeBalance)} NPR
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Total Trade:</strong> {formatValue(countryData.totalTrade)} NPR
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                  Current analysis: {analysisType}
                </div>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default CountryDashboard;
