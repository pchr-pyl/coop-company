'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { GraduationCap } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import CompanyList from '@/components/CompanyList';
import type { Company, FilterState } from '@/types';

// Load the map only on the client side to avoid Leaflet's `window` dependency
// during server-side rendering.
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
      กำลังโหลดแผนที่…
    </div>
  ),
});

export default function HomePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(
    async (keyword: string, industry: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (industry) params.set('industry', industry);

        const res = await fetch(`/api/companies?${params.toString()}`);
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { companies: Company[] };
        setCompanies(data.companies);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        );
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchCompanies('', '');
  }, [fetchCompanies]);

  function handleFilter({ keyword, industry }: FilterState) {
    setSearchKeyword(keyword);
    setSelectedIndustry(industry);
    fetchCompanies(keyword, industry);
  }

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
        <FilterBar onFilter={handleFilter} loading={loading} />
      </div>

      {/* Debug badge (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-screen-xl mx-auto w-full px-4 pt-2">
          <p className="text-[10px] text-gray-400">
            keyword=&quot;{searchKeyword}&quot; industry=&quot;
            {selectedIndustry}&quot; results={companies.length}
          </p>
        </div>
      )}

      {/* Map + List */}
      <div className="max-w-screen-xl mx-auto w-full px-4 pt-4 pb-8 flex flex-col lg:flex-row gap-4 flex-1">
        {/* Map */}
        <div className="flex-1 min-h-[420px] lg:min-h-[600px]">
          <MapComponent companies={companies} />
        </div>

        {/* Company list sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 overflow-y-auto max-h-[600px]">
          <CompanyList
            companies={companies}
            loading={loading}
            error={error}
          />
        </aside>
      </div>
    </main>
  );
}
