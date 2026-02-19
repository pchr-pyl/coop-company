# Co-op Map Thailand 🗺️

An interactive web-based map application for university students to find cooperative education (co-op) and internship opportunities across Thailand.

![Co-op Map Screenshot](screenshot.png)

## Features

- **Interactive Map**: Display companies on a map of Thailand with color-coded markers
- **Filter Panel**: Filter by Career Field, Region, and Province
- **Company List**: Side panel showing filtered companies grouped by region
- **Company Details**: Click on markers or list items to view company information
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet + React-Leaflet** - Map library
- **OpenStreetMap** - Map tiles

## Project Structure

```
coop-map/
├── src/
│   ├── components/
│   │   ├── FilterPanel.jsx    # Filter sidebar component
│   │   ├── Map.jsx            # Leaflet map component
│   │   └── CompanyList.jsx    # Company list sidebar
│   ├── data/
│   │   └── companies.js       # Sample company data
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind CSS imports
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Navigate to the project directory
cd coop-map

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## How to Add Your Real Data

Your CSV file contains company names and provinces but lacks coordinates (`lat`/`lng`) and career fields. Here's how to add your data:

### Option 1: Manual Data Entry

Edit `src/data/companies.js` and replace the `sampleCompanies` array with your data:

```javascript
export const sampleCompanies = [
  {
    id: 1,
    companyName: "Your Company Name",
    address: "Full Address",
    region: "Central", // North, Northeast, Central, East, South
    province: "กรุงเทพมหานคร",
    lat: 13.7563,  // You need to find this
    lng: 100.5018, // You need to find this
    careerFields: ["Tech & Data", "Engineering"], // Add relevant fields
    contactInfo: "Email or Phone"
  },
  // Add more companies...
];
```

### Option 2: Using a Geocoding Service

To get latitude/longitude for your addresses, you can use:

1. **Google Maps Geocoding API** (requires API key)
2. **OpenStreetMap Nominatim** (free, but rate-limited)
3. **Batch geocoding tools** like:
   - [Geoapify](https://www.geoapify.com/)
   - [PositionStack](https://positionstack.com/)

Example script to geocode your CSV:

```javascript
// geocode.js
const fetch = require('node-fetch');

async function geocodeAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
  );
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// Use this to geocode your CSV addresses
```

### Option 3: CSV to JSON Converter

If you have lat/lng in your data, convert your CSV to JSON format matching the structure in `companies.js`.

## Data Structure

Each company entry requires:

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier |
| `companyName` | String | Company name (Thai or English) |
| `address` | String | Full address |
| `region` | String | Region: "North", "Northeast", "Central", "East", "South" |
| `province` | String | Province name in Thai |
| `lat` | Number | Latitude coordinate |
| `lng` | Number | Longitude coordinate |
| `careerFields` | Array | Array of career field strings |
| `contactInfo` | String | Contact email or phone (optional) |

## Career Fields Available

The sample data includes these career fields (you can customize):

- Tech & Data
- Business
- Engineering
- Science
- Health
- Arts
- Finance
- Law
- Media
- Agriculture
- Education
- Manufacturing
- Construction

## Thailand Regions Reference

| Region | Thai Name | Provinces |
|--------|-----------|-----------|
| North | ภาคเหนือ | เชียงใหม่, เชียงราย, ลำปาง, etc. |
| Northeast | ภาคตะวันออกเฉียงเหนือ | ขอนแก่น, อุดรธานี, นครราชสีมา, etc. |
| Central | ภาคกลาง | กรุงเทพมหานคร, ปทุมธานี, นนทบุรี, etc. |
| East | ภาคตะวันออก | ชลบุรี, ระยอง, จันทบุรี, etc. |
| South | ภาคใต้ | ภูเก็ต, สุราษฎร์ธานี, ปัตตานี, etc. |

## Customization

### Changing Map Style

Edit `src/components/Map.jsx` to change the tile layer:

```javascript
// Default OpenStreetMap
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

// CartoDB Positron (cleaner look)
<TileLayer
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>
```

### Changing Marker Colors

Edit the color mapping in `src/components/Map.jsx`:

```javascript
const colors = {
  'Tech & Data': '#3B82F6',  // blue
  'Business': '#10B981',     // green
  // Add your own colors...
};
```

## Troubleshooting

### Map not showing
- Check that `lat` and `lng` values are valid numbers
- Ensure coordinates are within Thailand (lat: 5-21, lng: 97-106)

### Markers not appearing
- Check browser console for errors
- Verify that Leaflet CSS is imported: `import 'leaflet/dist/leaflet.css'`

### Tailwind not working
- Ensure `index.css` has the Tailwind directives
- Check that `tailwind.config.js` content paths are correct

## License

MIT License - Feel free to use for educational purposes.

## Support

For questions or issues, please check the [Leaflet documentation](https://leafletjs.com/) and [React-Leaflet documentation](https://react-leaflet.js.org/).

---

Built with ❤️ for Thai university students seeking co-op opportunities.
