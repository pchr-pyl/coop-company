'use client';

import { useState } from 'react';
import { Locate, LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react';
import { DEFAULT_RADIUS_KM, INDUSTRIES, LOCATIONS } from '@/constants';
import type { FilterState } from '@/types';

interface FilterBarProps {
  onFilter: (filters: FilterState) => void;
  loading?: boolean;
}

export default function FilterBar({
  onFilter,
  loading = false,
}: FilterBarProps) {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [province, setProvince] = useState('');
  const [nearMeActive, setNearMeActive] = useState(false);
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLon, setUserLon] = useState<number | undefined>();
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // ── Geo location ──────────────────────────────────────────────────────────

  function handleNearMeToggle() {
    if (nearMeActive) {
      // Deactivate
      setNearMeActive(false);
      setUserLat(undefined);
      setUserLon(undefined);
      setGeoError(null);
      onFilter({ keyword, industry, province, radiusKm });
      return;
    }

    if (!('geolocation' in navigator)) {
      setGeoError('เบราว์เซอร์นี้ไม่รองรับ Geolocation');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setNearMeActive(true);
        setGeoLoading(false);
        onFilter({ keyword, industry, province, userLat: lat, userLon: lon, radiusKm });
      },
      () => {
        setGeoError('ไม่สามารถระบุตำแหน่งได้ — กรุณาอนุญาต Location');
        setGeoLoading(false);
      },
      { timeout: 8000 },
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onFilter({
      keyword,
      industry,
      province,
      ...(nearMeActive && userLat != null && userLon != null
        ? { userLat, userLon }
        : {}),
      radiusKm,
    });
  }

  function handleClear() {
    setKeyword('');
    setIndustry('');
    setProvince('');
    setNearMeActive(false);
    setUserLat(undefined);
    setUserLon(undefined);
    setRadiusKm(DEFAULT_RADIUS_KM);
    setGeoError(null);
    onFilter({ keyword: '', industry: '', province: '', radiusKm: DEFAULT_RADIUS_KM });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 items-end"
      >
        <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm mr-1">
          <SlidersHorizontal className="w-4 h-4" />
          <span>ตัวกรอง</span>
        </div>

        {/* Keyword input */}
        <div className="flex-1 min-w-[170px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            🔍 ค้นหาชื่อสถานประกอบการ
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="พิมพ์ชื่อบริษัท..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Industry select */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            🎓 สำนักวิชา
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">— ทุกสำนักวิชา —</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Province select */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            📍 จังหวัด / ประเทศ
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">— ทุกจังหวัด —</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'กำลังค้นหา…' : 'ค้นหา'}
          </button>

          {/* Near Me toggle */}
          <button
            type="button"
            onClick={handleNearMeToggle}
            disabled={geoLoading}
            title={nearMeActive ? 'ปิดโหมดใกล้ฉัน' : 'ค้นหาบริษัทใกล้ตำแหน่งของฉัน'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              nearMeActive
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {nearMeActive ? (
              <LocateFixed className="w-4 h-4" />
            ) : (
              <Locate className="w-4 h-4" />
            )}
            <span>{geoLoading ? 'กำลังระบุ…' : nearMeActive ? 'ใกล้ฉัน ✓' : 'ใกล้ฉัน'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            ล้าง
          </button>
        </div>
      </form>

      {/* Radius slider — shown only when Near Me is active */}
      {nearMeActive && (
        <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
          <span className="text-xs text-gray-500 shrink-0">รัศมี:</span>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="flex-1 accent-green-600"
          />
          <span className="text-xs font-semibold text-green-700 w-16 text-right">
            {radiusKm} กม.
          </span>
        </div>
      )}

      {/* Geolocation error */}
      {geoError && (
        <p className="text-xs text-red-500">{geoError}</p>
      )}
    </div>
  );
}
