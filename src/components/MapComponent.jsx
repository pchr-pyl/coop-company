import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon, Icon } from 'leaflet';
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

const FACULTY_COLORS = {
  'การบัญชีและการเงิน':    '#3B82F6',
  'การจัดการ':              '#F59E0B',
  'สารสนเทศศาสตร์':         '#8B5CF6',
  'รัฐศาสตร์และนิติศาสตร์': '#EF4444',
  'วิศวกรรมศาสตร์':         '#F97316',
  'พยาบาลศาสตร์':           '#EC4899',
  'สาธารณสุขศาสตร์':        '#10B981',
  'วิทยาศาสตร์':            '#06B6D4',
  'ศิลปศาสตร์':             '#6366F1',
  'สถาปัตยกรรมศาสตร์':      '#84CC16',
};

function getFacultyColor(faculty) {
  return FACULTY_COLORS[faculty] ?? '#6B7280';
}

function makeMarkerIcon(faculty) {
  const color = getFacultyColor(faculty);
  return divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};
      border:2.5px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 100 ? 42 : 50;
  const bg = count < 10 ? '#3B82F6' : count < 100 ? '#F59E0B' : '#EF4444';
  return divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${count < 100 ? 13 : 11}px;
      font-family:sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyToUser({ userLocation }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!userLocation) return;
    if (prevRef.current?.lat === userLocation.lat && prevRef.current?.lng === userLocation.lng) return;
    prevRef.current = userLocation;
    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.5 });
  }, [userLocation, map]);
  return null;
}

export default function MapComponent({ companies = [], onMarkerClick, userLocation }) {
  const validCompanies = companies.filter(c => c.lat != null && c.lng != null);

  return (
    <MapContainer
      center={[13.0, 101.5]}
      zoom={6}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToUser userLocation={userLocation} />

      {/* User location marker */}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={10}
          pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.8, weight: 3 }}
        >
          <Popup>
            <div style={{ fontSize: 13, fontWeight: 600 }}>📍 ตำแหน่งของคุณ</div>
          </Popup>
        </CircleMarker>
      )}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={60}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
      >
        {validCompanies.map(company => (
          <Marker
            key={company.id}
            position={[company.lat, company.lng]}
            icon={makeMarkerIcon(company.faculty)}
            eventHandlers={{ click: () => onMarkerClick?.(company) }}
          >
            <Popup minWidth={240} maxWidth={300}>
              <div style={{ fontFamily: 'sans-serif' }}>
                {/* Company name */}
                <p style={{
                  fontWeight: 700, fontSize: 13, marginBottom: 8,
                  color: '#1e293b', lineHeight: 1.4,
                }}>
                  {company.companyName}
                </p>

                {/* Faculty badge */}
                {company.faculty && (
                  <div style={{ marginBottom: 4 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px', borderRadius: 12,
                      background: `${getFacultyColor(company.faculty)}18`,
                      color: getFacultyColor(company.faculty),
                      border: `1px solid ${getFacultyColor(company.faculty)}44`,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      🎓 {company.faculty}
                    </span>
                  </div>
                )}

                {/* Program */}
                {company.program && (
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    � <strong>{company.program}</strong>
                  </p>
                )}

                {/* Province */}
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                  📍 {company.province || '—'}
                </p>

                {/* Google Maps link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${company.lat},${company.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '6px 12px', borderRadius: 8,
                    background: '#2563EB', color: 'white',
                    fontSize: 12, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  🗺️ เปิดใน Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
