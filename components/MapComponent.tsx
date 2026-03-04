'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WU_CENTER } from '@/constants';
import type { Company } from '@/types';

// Leaflet default icon fix for webpack/Next.js bundlers — use CDN URLs.
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_ZOOM = 7;

/** Re-fits the map viewport to cover all visible markers whenever results change. */
function FitBoundsEffect({ companies }: { companies: Company[] }) {
  const map = useMap();

  useEffect(() => {
    const valid = companies.filter(
      (c) => c.location.lat !== 0 && c.location.lon !== 0,
    );
    if (valid.length === 0) return;

    const bounds = valid.map(
      (c) => [c.location.lat, c.location.lon] as [number, number],
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [companies, map]);

  return null;
}

interface MapComponentProps {
  companies: Company[];
}

export default function MapComponent({ companies }: MapComponentProps) {
  return (
    <MapContainer
      center={WU_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBoundsEffect companies={companies} />

      {companies.map((company) => {
        const { lat, lon } = company.location;
        if (lat === 0 && lon === 0) return null;
        return (
          <Marker key={company.id} position={[lat, lon]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm space-y-1 min-w-[190px]">
                <p className="font-semibold text-gray-900 leading-snug">
                  {company.company_name}
                </p>
                {company.program && (
                  <p className="text-gray-600">
                    <span className="font-medium">หลักสูตร:</span>{' '}
                    {company.program}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">สำนักวิชา:</span>{' '}
                  {company.industry}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">จังหวัด:</span>{' '}
                  {company.province}
                </p>
                {company.distance && (
                  <p className="text-green-700 font-medium">
                    📍 ห่างจากคุณ {company.distance}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">รับนักศึกษา:</span>{' '}
                  {company.accept_interns ? '✅ ใช่' : '❌ ไม่'}
                </p>
                {company.description && (
                  <p className="text-gray-500 text-xs leading-relaxed border-t border-gray-100 pt-1 mt-1">
                    {company.description.length > 120
                      ? `${company.description.slice(0, 120)}…`
                      : company.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
