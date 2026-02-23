import React, { useMemo } from 'react';
import { Search, SlidersHorizontal, X, Navigation } from 'lucide-react';

export default function Sidebar({
  companies = [],
  filters = {},
  onFilterChange,
  totalCount = 0,
  filteredCount = 0,
  onLocateMe,
}) {
  const faculties = useMemo(
    () => [...new Set((companies ?? []).map(c => c.faculty).filter(Boolean))].sort(),
    [companies],
  );

  const programs = useMemo(() => {
    const src = filters.faculty
      ? companies.filter(c => c.faculty === filters.faculty)
      : companies;
    return [...new Set(src.map(c => c.program).filter(Boolean))].sort();
  }, [companies, filters.faculty]);

  const provinces = useMemo(
    () => [...new Set((companies ?? []).map(c => c.province).filter(Boolean))].sort(),
    [companies],
  );

  const hasFilters = filters.search || filters.faculty || filters.program || filters.province;

  function update(patch) {
    onFilterChange?.(patch);
  }

  function clearAll() {
    onFilterChange?.({ search: '', faculty: '', program: '', province: '' });
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-white" />
          <span className="font-bold text-white text-sm">ตัวกรองการค้นหา</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" /> ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-blue-50 flex justify-between items-center border-b border-blue-100">
        <span className="text-xs text-gray-500">แสดงผล</span>
        <span className="text-sm font-bold text-blue-700">
          {filteredCount.toLocaleString()}
          <span className="font-normal text-gray-400"> / {totalCount.toLocaleString()}</span>
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            🔍 ค้นหาชื่อสถานประกอบการ
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={e => update({ search: e.target.value })}
              placeholder="พิมพ์ชื่อบริษัท..."
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            {filters.search && (
              <button
                onClick={() => update({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Faculty */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            🎓 สำนักวิชา
          </label>
          <select
            value={filters.faculty ?? ''}
            onChange={e => update({ faculty: e.target.value, program: '' })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition"
          >
            <option value="">— ทุกสำนักวิชา —</option>
            {faculties.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Program (cascading) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            📚 หลักสูตร
            {filters.faculty && (
              <span className="ml-1 text-blue-500 font-normal">({programs.length} หลักสูตร)</span>
            )}
          </label>
          <select
            value={filters.program ?? ''}
            onChange={e => update({ program: e.target.value })}
            disabled={!filters.faculty && programs.length === 0}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">— ทุกหลักสูตร —</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {!filters.faculty && (
            <p className="text-xs text-gray-400 mt-1">เลือกสำนักวิชาก่อนเพื่อกรองหลักสูตร</p>
          )}
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            📍 จังหวัด
          </label>
          <select
            value={filters.province ?? ''}
            onChange={e => update({ province: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition"
          >
            <option value="">— ทุกจังหวัด —</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Near Me button */}
        <button
          onClick={onLocateMe}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Navigation className="w-4 h-4" />
          บริษัทใกล้ฉัน
        </button>
      </div>
    </div>
  );
}
