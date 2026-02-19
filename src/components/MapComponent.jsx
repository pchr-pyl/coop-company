import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FIELD_COLORS = {
  'Tech & Data': '#3B82F6',
  'Engineering': '#F59E0B',
  'Health & Medical': '#EF4444',
  'Finance & Banking': '#14B8A6',
  'Education': '#06B6D4',
  'Government': '#6366F1',
  'Business & Trade': '#10B981',
  'Agriculture': '#65A30D',
  'Media & Creative': '#EC4899',
  'Hospitality & Tourism': '#F97316',
  'General': '#6B7280',
};

function makeIcon(careerFields) {
  const color = FIELD_COLORS[careerFields?.[0]] ?? '#6B7280';
  return divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// Must be INSIDE MapContainer
function FitBounds({ companies }) {
  const map = useMap();
  useEffect(() => {
    if (!companies?.length) return;
    const valid = companies.filter(c => c.lat && c.lng);
    if (!valid.length) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 12);
    } else {
      map.fitBounds(valid.map(c => [c.lat, c.lng]), { padding: [40, 40], maxZoom: 11 });
    }
  }, [companies, map]);
  return null;
}

export default function MapComponent({ companies = [], onMarkerClick }) {
  return (
    <MapContainer
      center={[13.0, 101.0]}
      zoom={6}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds companies={companies} />
      {companies.map((company) => (
        <Marker
          key={company.id}
          position={[company.lat, company.lng]}
          icon={makeIcon(company.careerFields)}
          eventHandlers={{ click: () => onMarkerClick?.(company) }}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <p style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 13 }}>{company.companyName}</p>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>📍 {company.province} — {company.region}</p>
              {company.zipCode && <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>📮 {company.zipCode}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {(company.careerFields ?? []).map((f, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 12,
                    background: `${FIELD_COLORS[f] ?? '#6B7280'}22`,
                    color: FIELD_COLORS[f] ?? '#6B7280',
                    border: `1px solid ${FIELD_COLORS[f] ?? '#6B7280'}55`,
                  }}>{f}</span>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
