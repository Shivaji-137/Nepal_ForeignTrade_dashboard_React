const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const filePath = path.join(__dirname, 'public/data/impexp_countrydata.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('First few rows to understand structure:');
console.log(data.slice(0, 3));

// Extract unique countries
const countries = [...new Set(data.map(row => row['Countries'] || row['Country'] || row['countries'] || row['country']))].filter(country => country && country.trim() !== '');
console.log('\nTotal countries in Excel file:', countries.length);
console.log('\nCountries list:');
countries.sort().forEach((country, index) => console.log(`${index + 1}. ${country}`));
