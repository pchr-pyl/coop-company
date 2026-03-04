'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { FilterState } from '@/types';

const INDUSTRIES = [
  'การบัญชีและการเงิน',
  'การจัดการ',
  'สารสนเทศศาสตร์',
  'รัฐศาสตร์และนิติศาสตร์',
  'วิศวกรรมศาสตร์',
  'พยาบาลศาสตร์',
  'สาธารณสุขศาสตร์',
  'วิทยาศาสตร์',
  'ศิลปศาสตร์',
  'สถาปัตยกรรมศาสตร์',
];

interface FilterBarProps {
  onFilter: (filters: FilterState) => void;
  loading?: boolean;
}

export default function FilterBar({ onFilter, loading = false }: FilterBarProps) {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onFilter({ keyword, industry });
  }

  function handleClear() {
    setKeyword('');
    setIndustry('');
    onFilter({ keyword: '', industry: '' });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-3 items-end"
    >
      <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm mr-2">
        <SlidersHorizontal className="w-4 h-4" />
        <span>ตัวกรอง</span>
      </div>

      {/* Keyword input */}
      <div className="flex-1 min-w-[180px]">
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
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          🎓 สำนักวิชา / อุตสาหกรรม
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'กำลังค้นหา…' : 'ค้นหา'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          ล้าง
        </button>
      </div>
    </form>
  );
}
