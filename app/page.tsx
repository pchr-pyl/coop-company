'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { GraduationCap } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import CompanyList from '@/components/CompanyList';
import { DEFAULT_RADIUS_KM } from '@/constants';
import type { Company, FilterState } from '@/types';

// MapComponent uses Leaflet which requires `window` — load only on the client.
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
      กำลังโหลดแผนที่…
    </div>
  ),
});

/** Initial (empty) filter state */
const INITIAL_FILTERS: FilterState = {
  keyword: '',
  industry: '',
  province: '',
  radiusKm: DEFAULT_RADIUS_KM,
};

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async (filters: FilterState) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.province) params.set('province', filters.province);
      if (filters.userLat != null) params.set('lat', String(filters.userLat));
      if (filters.userLon != null) params.set('lon', String(filters.userLon));
      if (filters.userLat != null)
        params.set('radius', `${filters.radiusKm}km`);

      const res = await fetch(`/api/companies/search?${params.toString()}`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        companies: Company[];
        total: number;
      };
      setCompanies(data.companies);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      );
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — fetch all companies
  useEffect(() => {
    fetchCompanies(INITIAL_FILTERS);
  }, [fetchCompanies]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 shadow-md">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3">
          <GraduationCap className="w-7 h-7" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              Co-op Map Thailand
            </h1>
            <p className="text-xs text-blue-200">
              แผนที่สถานประกอบการสหกิจศึกษา — มหาวิทยาลัยวลัยลักษณ์
            </p>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="max-w-screen-xl mx-auto w-full px-4 pt-4">
        <FilterBar onFilter={fetchCompanies} loading={loading} />
      </div>

      {/* Debug info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-screen-xl mx-auto w-full px-4 pt-1">
          <p className="text-[10px] text-gray-400">
            results={companies.length}/{total}
          </p>
        </div>
      )}

      {/* Map + List */}
      <div className="max-w-screen-xl mx-auto w-full px-4 pt-4 pb-8 flex flex-col lg:flex-row gap-4 flex-1">
        <div className="flex-1 min-h-[420px] lg:min-h-[600px]">
          <MapComponent companies={companies} />
        </div>

        <aside className="w-full lg:w-80 xl:w-96 overflow-y-auto max-h-[600px]">
          <CompanyList
            companies={companies}
            total={total}
            loading={loading}
            error={error}
          />
        </aside>
      </div>
    </main>
  );
}
