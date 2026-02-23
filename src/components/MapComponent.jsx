import React, { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Constants
const THAILAND_CENTER = [13.0, 101.5];
const DEFAULT_ZOOM = 6;
const MARKER_SIZE = 16;
const CLUSTER_RADIUS = 60;
const USER_LOCATION_RADIUS = 10;

// Configure Leaflet icons (only once)
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FACULTY_COLORS = {
  'การบัญชีและการเงิน': '#3B82F6',
  'การจัดการ': '#F59E0B',
  'สารสนเทศศาสตร์': '#8B5CF6',
  'รัฐศาสตร์และนิติศาสตร์': '#EF4444',
  'วิศวกรรมศาสตร์': '#F97316',
  'พยาบาลศาสตร์': '#EC4899',
  'สาธารณสุขศาสตร์': '#10B981',
  'วิทยาศาสตร์': '#06B6D4',
  'ศิลปศาสตร์': '#6366F1',
  'สถาปัตยกรรมศาสตร์': '#84CC16',
};

// Utility functions
const getFacultyColor = (faculty) => FACULTY_COLORS[faculty] ?? '#6B7280';

const createMarkerIcon = (faculty) => {
  const color = getFacultyColor(faculty);
  return divIcon({
    className: '',
    html: `<div style="
      width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;border-radius:50%;
      background:${color};
      border:2.5px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
    popupAnchor: [0, -MARKER_SIZE - 4],
  });
};

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 100 ? 42 : 50;
  const bg = count < 10 ? '#3B82F6' : count < 100 ? '#F59E0B' : '#EF4444';
  const fontSize = count < 100 ? 13 : 11;
  
  return divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${fontSize}px;
      font-family:sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Memoized components
const FlyToUser = memo(({ userLocation }) => {
  const map = useMap();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    if (!userLocation) return;
    
    const { lat, lng } = userLocation;
    if (prevLocationRef.current?.lat === lat && prevLocationRef.current?.lng === lng) return;
    
    prevLocationRef.current = userLocation;
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [userLocation, map]);

  return null;
});

FlyToUser.displayName = 'FlyToUser';

const UserLocationMarker = memo(({ userLocation }) => (
  <CircleMarker
    center={[userLocation.lat, userLocation.lng]}
    radius={USER_LOCATION_RADIUS}
    pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.8, weight: 3 }}
  >
    <Popup>
      <div style={{ fontSize: 13, fontWeight: 600 }}>📍 ตำแหน่งของคุณ</div>
    </Popup>
  </CircleMarker>
));

UserLocationMarker.displayName = 'UserLocationMarker';

const CompanyMarker = memo(({ company, onMarkerClick }) => {
  const icon = useMemo(() => createMarkerIcon(company.faculty), [company.faculty]);
  
  return (
    <Marker
      position={[company.lat, company.lng]}
      icon={icon}
      eventHandlers={{ click: () => onMarkerClick?.(company) }}
    >
      <Popup minWidth={240} maxWidth={300}>
        <div style={{ fontFamily: 'sans-serif' }}>
          <p style={{
            fontWeight: 700, fontSize: 13, marginBottom: 8,
            color: '#1e293b', lineHeight: 1.4,
          }}>
            {company.companyName}
          </p>

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

          {company.program && (
            <p style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
              📚 <strong>{company.program}</strong>
            </p>
          )}

          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            📍 {company.province || '—'}
          </p>

          {company.lat && company.lng && (
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
          )}
        </div>
      </Popup>
    </Marker>
  );
});

CompanyMarker.displayName = 'CompanyMarker';

export default function MapComponent({ companies = [], onMarkerClick, userLocation }) {
  const validCompanies = useMemo(() => 
    companies.filter(c => c.lat != null && c.lng != null), 
    [companies]
  );

  return (
    <MapContainer
      center={THAILAND_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToUser userLocation={userLocation} />

      {userLocation && <UserLocationMarker userLocation={userLocation} />}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={CLUSTER_RADIUS}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
      >
        {validCompanies.map(company => (
          <CompanyMarker
            key={company.id}
            company={company}
            onMarkerClick={onMarkerClick}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
