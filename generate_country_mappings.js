// Complete country mappings for all countries in the Excel data
// This will add the missing 139 countries to the CountryDashboard

const missingCountriesData = [
  // Missing countries with their ISO codes and coordinates
  { name: 'Albania', iso: 'ALB', coordinates: [41.1533, 20.1683] },
  { name: 'American Samoa', iso: 'ASM', coordinates: [-14.2710, -170.1322] },
  { name: 'Andorra', iso: 'AND', coordinates: [42.5462, 1.6016] },
  { name: 'Angola', iso: 'AGO', coordinates: [-11.2027, 17.8739] },
  { name: 'Anguilla', iso: 'AIA', coordinates: [18.2206, -63.0686] },
  { name: 'Antigua and Barbuda', iso: 'ATG', coordinates: [17.0608, -61.7964] },
  { name: 'Aruba', iso: 'ABW', coordinates: [12.5211, -69.9683] },
  { name: 'Azerbaijan', iso: 'AZE', coordinates: [40.1431, 47.5769] },
  { name: 'Bahamas', iso: 'BHS', coordinates: [25.0343, -77.3963] },
  { name: 'Barbados', iso: 'BRB', coordinates: [13.1939, -59.5432] },
  { name: 'Belize', iso: 'BLZ', coordinates: [17.1899, -88.4976] },
  { name: 'Benin', iso: 'BEN', coordinates: [9.3077, 2.3158] },
  { name: 'Bermuda', iso: 'BMU', coordinates: [32.3078, -64.7505] },
  { name: 'Bolivia', iso: 'BOL', coordinates: [-16.2902, -63.5887] },
  { name: 'Bosnia and Herzegovina', iso: 'BIH', coordinates: [43.9159, 17.6791] },
  { name: 'Botswana', iso: 'BWA', coordinates: [-22.3285, 24.6849] },
  { name: 'Bouvet Island', iso: 'BVT', coordinates: [-54.4208, 3.3464] },
  { name: 'British Indian Ocean Territory', iso: 'IOT', coordinates: [-6.0000, 71.5000] },
  { name: 'Brunei Darussalam', iso: 'BRN', coordinates: [4.5353, 114.7277] },
  { name: 'Burkina Faso', iso: 'BFA', coordinates: [12.2383, -1.5616] },
  { name: 'Burundi', iso: 'BDI', coordinates: [-3.3731, 29.9189] },
  { name: 'Cameroon', iso: 'CMR', coordinates: [7.3697, 12.3547] },
  { name: 'Cape Verde', iso: 'CPV', coordinates: [16.5388, -24.0132] },
  { name: 'Cayman Islands', iso: 'CYM', coordinates: [19.3133, -81.2546] },
  { name: 'Central African Republic', iso: 'CAF', coordinates: [6.6111, 20.9394] },
  { name: 'Chad', iso: 'TCD', coordinates: [15.4542, 18.7322] },
  { name: 'Christmas Island[Australia]', iso: 'CXR', coordinates: [-10.4475, 105.6904] },
  { name: 'Cocos (Keeling) Islands', iso: 'CCK', coordinates: [-12.1642, 96.8710] },
  { name: 'Comoros', iso: 'COM', coordinates: [-11.6455, 43.3333] },
  { name: 'Congo', iso: 'COG', coordinates: [-0.2280, 15.8277] },
  { name: 'Cook Islands', iso: 'COK', coordinates: [-21.2367, -159.7777] },
  { name: 'Cote d\'Ivoire', iso: 'CIV', coordinates: [7.5400, -5.5471] },
  { name: 'Cuba', iso: 'CUB', coordinates: [21.5218, -77.7812] },
  { name: 'Djibouti', iso: 'DJI', coordinates: [11.8251, 42.5903] },
  { name: 'Dominica', iso: 'DMA', coordinates: [15.4150, -61.3710] },
  { name: 'Dominican Republic', iso: 'DOM', coordinates: [18.7357, -70.1627] },
  { name: 'East Timor', iso: 'TLS', coordinates: [-8.8742, 125.7275] },
  { name: 'El Salvador', iso: 'SLV', coordinates: [13.7942, -88.8965] },
  { name: 'Eritrea', iso: 'ERI', coordinates: [15.1794, 39.7823] },
  { name: 'European Union', iso: 'EUR', coordinates: [54.5260, 15.2551] }, // Central Europe
  { name: 'Faeroe Islands', iso: 'FRO', coordinates: [61.8926, -6.9118] },
  { name: 'Fiji', iso: 'FJI', coordinates: [-16.7784, 179.4144] },
  { name: 'French Guiana', iso: 'GUF', coordinates: [3.9339, -53.1258] },
  { name: 'French Southern Territories', iso: 'ATF', coordinates: [-49.2804, 69.3486] },
  { name: 'Gabon', iso: 'GAB', coordinates: [-0.8037, 11.6094] },
  { name: 'Georgia', iso: 'GEO', coordinates: [42.3154, 43.3569] },
  { name: 'Grenada', iso: 'GRD', coordinates: [12.1165, -61.6790] },
  { name: 'Guadeloupe', iso: 'GLP', coordinates: [16.9950, -62.0674] },
  { name: 'Guam', iso: 'GUM', coordinates: [13.4443, 144.7937] },
  { name: 'Guatemala', iso: 'GTM', coordinates: [15.7835, -90.2308] },
  { name: 'Guinea', iso: 'GIN', coordinates: [9.9456, -9.6966] },
  { name: 'Guinea-Bissau', iso: 'GNB', coordinates: [11.8037, -15.1804] },
  { name: 'Guyana', iso: 'GUY', coordinates: [4.8604, -58.9302] },
  { name: 'Haiti', iso: 'HTI', coordinates: [18.9712, -72.2852] },
  { name: 'Holy See (Vatican)', iso: 'VAT', coordinates: [41.9029, 12.4534] },
  { name: 'Honduras', iso: 'HND', coordinates: [15.2000, -86.2419] },
  { name: 'Hong Kong', iso: 'HKG', coordinates: [22.3193, 114.1694] },
  { name: 'Iran, Islamic Republic of', iso: 'IRN', coordinates: [32.4279, 53.6880] },
  { name: 'Isle of Man', iso: 'IMN', coordinates: [54.2361, -4.5481] },
  { name: 'Jamaica', iso: 'JAM', coordinates: [18.1096, -77.2975] },
  { name: 'Kazakstan', iso: 'KAZ', coordinates: [48.0196, 66.9237] },
  { name: 'Kiribati', iso: 'KIR', coordinates: [-3.3704, -168.7340] },
  { name: 'Kosovo', iso: 'XKX', coordinates: [42.6026, 20.9030] },
  { name: 'Kyrgyzstan', iso: 'KGZ', coordinates: [41.2044, 74.7661] },
  { name: 'Lao People\'s Democratic Republic', iso: 'LAO', coordinates: [19.8563, 102.4955] },
  { name: 'Lesotho', iso: 'LSO', coordinates: [-29.6100, 28.2336] },
  { name: 'Liberia', iso: 'LBR', coordinates: [6.4281, -9.4295] },
  { name: 'Libyan Arab Jamahiriya', iso: 'LBY', coordinates: [26.3351, 17.2283] },
  { name: 'Liechtenstein', iso: 'LIE', coordinates: [47.1660, 9.5554] },
  { name: 'Macau', iso: 'MAC', coordinates: [22.1987, 113.5439] },
  { name: 'Macedonia', iso: 'MKD', coordinates: [41.6086, 21.7453] },
  { name: 'Madagascar', iso: 'MDG', coordinates: [-18.7669, 46.8691] },
  { name: 'Malawi', iso: 'MWI', coordinates: [-13.2543, 34.3015] },
  { name: 'Mali', iso: 'MLI', coordinates: [17.5707, -3.9962] },
  { name: 'Marshall Islands', iso: 'MHL', coordinates: [7.1315, 171.1845] },
  { name: 'Mauritania', iso: 'MRT', coordinates: [21.0079, -10.9408] },
  { name: 'Micronesia, Federated States of', iso: 'FSM', coordinates: [7.4256, 150.5508] },
  { name: 'Midway Islands', iso: 'UMI', coordinates: [28.2072, -177.3735] },
  { name: 'Moldova', iso: 'MDA', coordinates: [47.4116, 28.3699] },
  { name: 'Monaco', iso: 'MCO', coordinates: [43.7384, 7.4246] },
  { name: 'Montenegro', iso: 'MNE', coordinates: [42.7087, 19.3744] },
  { name: 'Montserrat', iso: 'MSR', coordinates: [16.7425, -62.1874] },
  { name: 'Mozambique', iso: 'MOZ', coordinates: [-18.6657, 35.5296] },
  { name: 'Namibia', iso: 'NAM', coordinates: [-22.9576, 18.4904] },
  { name: 'Nauru', iso: 'NRU', coordinates: [-0.5228, 166.9315] },
  { name: 'New Caledonia', iso: 'NCL', coordinates: [-20.9043, 165.6180] },
  { name: 'Nicaragua', iso: 'NIC', coordinates: [12.8654, -85.2072] },
  { name: 'Niger', iso: 'NER', coordinates: [17.6078, 8.0817] },
  { name: 'Niue', iso: 'NIU', coordinates: [-19.0544, -169.8672] },
  { name: 'Northern Mariana Islands', iso: 'MNP', coordinates: [17.3308, 145.3846] },
  { name: 'Papua New Guinea', iso: 'PNG', coordinates: [-6.3150, 143.9555] },
  { name: 'Pitcairn', iso: 'PCN', coordinates: [-24.7036, -127.4393] },
  { name: 'Puerto Rico', iso: 'PRI', coordinates: [18.2208, -66.5901] },
  { name: 'Republic of Moldova', iso: 'MDA', coordinates: [47.4116, 28.3699] },
  { name: 'Reunion', iso: 'REU', coordinates: [-21.1151, 55.5364] },
  { name: 'Rwanda', iso: 'RWA', coordinates: [-1.9403, 29.8739] },
  { name: 'Saint Helena', iso: 'SHN', coordinates: [-24.1434, -10.0307] },
  { name: 'Saint Kitts and Nevis', iso: 'KNA', coordinates: [17.3578, -62.7830] },
  { name: 'Saint Lucia', iso: 'LCA', coordinates: [13.9094, -60.9789] },
  { name: 'Saint Vincent and the Grenadines', iso: 'VCT', coordinates: [12.9843, -61.2872] },
  { name: 'Samoa', iso: 'WSM', coordinates: [-13.7590, -172.1046] },
  { name: 'San Marino', iso: 'SMR', coordinates: [43.9424, 12.4578] },
  { name: 'Sao Tome and Principe', iso: 'STP', coordinates: [0.1864, 6.6131] },
  { name: 'Senegal', iso: 'SEN', coordinates: [14.4974, -14.4524] },
  { name: 'Serbia (Europe)', iso: 'SRB', coordinates: [44.0165, 21.0059] },
  { name: 'Seychelles', iso: 'SYC', coordinates: [-4.6796, 55.4920] },
  { name: 'Sierra Leone', iso: 'SLE', coordinates: [8.4606, -11.7799] },
  { name: 'Solomon Islands', iso: 'SLB', coordinates: [-9.6457, 160.1562] },
  { name: 'Somalia', iso: 'SOM', coordinates: [5.1521, 46.1996] },
  { name: 'South Sudan', iso: 'SSD', coordinates: [6.8769, 31.3069] },
  { name: 'Sudan', iso: 'SDN', coordinates: [12.8628, 30.2176] },
  { name: 'Suriname', iso: 'SUR', coordinates: [3.9193, -56.0278] },
  { name: 'Swaziland', iso: 'SWZ', coordinates: [-26.5225, 31.4659] },
  { name: 'Syrian Arab Republic', iso: 'SYR', coordinates: [34.8021, 38.9968] },
  { name: 'Tajikistan', iso: 'TJK', coordinates: [38.8610, 71.2761] },
  { name: 'Tanzania', iso: 'TZA', coordinates: [-6.3690, 34.8888] },
  { name: 'The former Yugoslav Rep. Macedonia', iso: 'MKD', coordinates: [41.6086, 21.7453] },
  { name: 'Togo', iso: 'TGO', coordinates: [8.6195, 0.8248] },
  { name: 'Tokelau', iso: 'TKL', coordinates: [-8.9676, -171.8554] },
  { name: 'Trinidad and Tobago', iso: 'TTO', coordinates: [10.6918, -61.2225] },
  { name: 'Turkmenistan', iso: 'TKM', coordinates: [38.9697, 59.5563] },
  { name: 'Turks and Caicos Islands', iso: 'TCA', coordinates: [21.6940, -71.7979] },
  { name: 'Uganda', iso: 'UGA', coordinates: [1.3733, 32.2903] },
  { name: 'United Republic of Tanzania', iso: 'TZA', coordinates: [-6.3690, 34.8888] },
  { name: 'United States Virgin Islands', iso: 'VIR', coordinates: [18.3358, -64.8963] },
  { name: 'Uzbekistan', iso: 'UZB', coordinates: [41.3775, 64.5853] },
  { name: 'Vanuatu', iso: 'VUT', coordinates: [-15.3767, 166.9592] },
  { name: 'Viet Nam', iso: 'VNM', coordinates: [14.0583, 108.2772] },
  { name: 'Wallis and Futuna Islands', iso: 'WLF', coordinates: [-13.7687, -177.1562] },
  { name: 'Western Sahara', iso: 'ESH', coordinates: [24.2155, -12.8858] },
  { name: 'Yemen', iso: 'YEM', coordinates: [15.5527, 48.5164] },
  { name: 'Yugoslavia', iso: 'YUG', coordinates: [44.0165, 21.0059] }, // Historical - use Serbia coordinates
  { name: 'Zaire', iso: 'ZAR', coordinates: [-4.0383, 21.7587] }, // Historical - use DRC coordinates
  { name: 'Zambia', iso: 'ZMB', coordinates: [-13.1339, 27.8493] },
  { name: 'Zimbabwe', iso: 'ZWE', coordinates: [-19.0154, 29.1549] }
];

// Special cases (non-country entries)
const specialCases = [
  'Many Countries',
  'Not specified',
  'Not stated(Gold silver imports)',
  'Not_Specified',
  'Other Countries',
  'Other Countries:(Countries With Less Than Rs.100 Thousand Trade)'
];

console.log('// Additional ISO mappings for missing countries');
console.log('const additionalISOMappings = {');
missingCountriesData.forEach(country => {
  console.log(`  '${country.name}': '${country.iso}',`);
});
console.log('};');

console.log('\n// Additional coordinates for missing countries');
console.log('const additionalCoordinates = {');
missingCountriesData.forEach(country => {
  console.log(`  '${country.name}': [${country.coordinates[0]}, ${country.coordinates[1]}],`);
});
console.log('};');

console.log('\n// Additional region mappings for missing countries');
console.log('const additionalRegions = {');

// Group countries by regions
const regionGroups = {
  'Europe': ['Albania', 'Andorra', 'Bosnia and Herzegovina', 'Montenegro', 'Macedonia', 'The former Yugoslav Rep. Macedonia', 'Moldova', 'Republic of Moldova', 'Kosovo', 'Serbia (Europe)', 'Liechtenstein', 'Monaco', 'San Marino', 'Holy See (Vatican)', 'Isle of Man'],
  'Africa': ['Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Cote d\'Ivoire', 'Djibouti', 'Eritrea', 'Gabon', 'Guinea', 'Guinea-Bissau', 'Lesotho', 'Liberia', 'Libyan Arab Jamahiriya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mozambique', 'Namibia', 'Niger', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'United Republic of Tanzania', 'Togo', 'Uganda', 'Western Sahara', 'Zaire', 'Zambia', 'Zimbabwe'],
  'Asia': ['Azerbaijan', 'Georgia', 'Kazakstan', 'Kyrgyzstan', 'Lao People\'s Democratic Republic', 'Tajikistan', 'Turkmenistan', 'Uzbekistan', 'Hong Kong', 'Macau'],
  'Middle East': ['Yemen', 'Syrian Arab Republic'],
  'North America': ['Belize', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico'],
  'South America': ['Bolivia', 'Guyana', 'Suriname', 'French Guiana'],
  'Oceania': ['Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'New Caledonia', 'Cook Islands', 'Samoa', 'Kiribati', 'Marshall Islands', 'Micronesia, Federated States of', 'Nauru', 'Niue', 'Tokelau', 'Wallis and Futuna Islands'],
  'Caribbean': ['Antigua and Barbuda', 'Aruba', 'Bahamas', 'Barbados', 'Bermuda', 'Cayman Islands', 'Dominica', 'Grenada', 'Guadeloupe', 'Montserrat', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'Turks and Caicos Islands', 'United States Virgin Islands', 'Anguilla'],
  'Atlantic': ['Saint Helena', 'Bouvet Island', 'Faeroe Islands'],
  'Pacific': ['American Samoa', 'Guam', 'Northern Mariana Islands', 'Midway Islands', 'Pitcairn'],
  'Indian Ocean': ['Reunion', 'French Southern Territories', 'British Indian Ocean Territory', 'Christmas Island[Australia]', 'Cocos (Keeling) Islands'],
  'Special': ['European Union']
};

Object.entries(regionGroups).forEach(([region, countries]) => {
  console.log(`  // ${region}`);
  countries.forEach(country => {
    console.log(`  '${country}': '${region}',`);
  });
});

console.log('};');

console.log('\n--- Summary ---');
console.log(`Total missing countries mapped: ${missingCountriesData.length}`);
console.log(`Special cases that won't be mapped: ${specialCases.length}`);
console.log(`Countries with mappings: ${139 - specialCases.length}`);

module.exports = {
  missingCountriesData,
  specialCases
};
