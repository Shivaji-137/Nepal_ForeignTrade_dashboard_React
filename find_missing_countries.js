const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = path.join(__dirname, 'public/data/impexp_countrydata.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Extract unique countries from Excel
const excelCountries = [...new Set(data.map(row => row['Countries']))].filter(country => country && country.trim() !== '');

// Existing country mapping (ISO codes)
const existingISOMappings = {
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
  'Russian Federation': 'RUS'
};

// Existing coordinates mapping
const existingCoordinates = {
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
  'Russian Federation': [61.5240, 105.3188]
};

// Find missing countries
const missingCountries = excelCountries.filter(country => {
  const normalizedCountry = country.trim();
  
  // Check if the country exists in ISO mapping (exact match or partial match)
  const hasISOMapping = existingISOMappings[normalizedCountry] || 
    Object.keys(existingISOMappings).some(key => 
      key.toLowerCase().includes(normalizedCountry.toLowerCase()) ||
      normalizedCountry.toLowerCase().includes(key.toLowerCase())
    );
  
  // Check if the country exists in coordinates mapping
  const hasCoordinates = existingCoordinates[normalizedCountry] ||
    Object.keys(existingCoordinates).some(key => 
      key.toLowerCase().includes(normalizedCountry.toLowerCase()) ||
      normalizedCountry.toLowerCase().includes(key.toLowerCase())
    );
  
  return !hasISOMapping || !hasCoordinates;
});

console.log('Total countries in Excel:', excelCountries.length);
console.log('Countries with existing mapping:', excelCountries.length - missingCountries.length);
console.log('Missing countries:', missingCountries.length);
console.log('\nMissing countries list:');
missingCountries.sort().forEach((country, index) => console.log(`${index + 1}. ${country}`));

// Special cases that might need attention
console.log('\n--- Special Cases to Check ---');
const specialCases = [
  'Many Countries',
  'Not specified',
  'Not stated(Gold silver imports)',
  'Not_Specified',
  'Other Countries',
  'Other Countries:(Countries With Less Than Rs.100 Thousand Trade)',
  'European Union'
];

const foundSpecialCases = excelCountries.filter(country => 
  specialCases.some(special => country.includes(special))
);

console.log('Special cases found:');
foundSpecialCases.forEach((country, index) => console.log(`${index + 1}. ${country}`));
