import React, { useMemo, memo } from 'react';
import { Search, SlidersHorizontal, X, Navigation } from 'lucide-react';

// Constants
const FILTER_PLACEHOLDERS = {
  search: 'พิมพ์ชื่อบริษัท...',
  faculty: '— ทุกสำนักวิชา —',
  program: '— ทุกหลักสูตร —',
  province: '— ทุกจังหวัด —',
};

const FILTER_LABELS = {
  search: '🔍 ค้นหาชื่อสถานประกอบการ',
  faculty: '🎓 สำนักวิชา',
  program: '📚 หลักสูตร',
  province: '📍 จังหวัด',
};

const BUTTON_TEXTS = {
  clear: 'ล้างทั้งหมด',
  nearMe: 'บริษัทใกล้ฉัน',
  filters: 'ตัวกรอง',
};

const FACULTY_COLORS = {
  'การบัญชีและการเงิน': 'bg-blue-100 text-blue-800',
  'การจัดการ': 'bg-amber-100 text-amber-800',
  'สารสนเทศศาสตร์': 'bg-purple-100 text-purple-800',
  'รัฐศาสตร์และนิติศาสตร์': 'bg-red-100 text-red-800',
  'วิศวกรรมศาสตร์': 'bg-orange-100 text-orange-800',
  'พยาบาลศาสตร์': 'bg-pink-100 text-pink-800',
  'สาธารณสุขศาสตร์': 'bg-emerald-100 text-emerald-800',
  'วิทยาศาสตร์': 'bg-cyan-100 text-cyan-800',
  'ศิลปศาสตร์': 'bg-indigo-100 text-indigo-800',
  'สถาปัตยกรรมศาสตร์': 'bg-lime-100 text-lime-800',
};

// Utility functions
const getFacultyColor = (faculty) => FACULTY_COLORS[faculty] ?? 'bg-gray-100 text-gray-700';

// Memoized components
const FilterDropdown = memo(({ label, value, onChange, options, disabled = false, extraInfo = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}
      {extraInfo && (
        <span className="ml-1 text-blue-500 font-normal">{extraInfo}</span>
      )}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{label}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {disabled && (
      <p className="text-xs text-gray-400 mt-1">เลือกสำนักวิชาก่อนเพื่อกรองหลักสูตร</p>
    )}
  </div>
));

FilterDropdown.displayName = 'FilterDropdown';

const SearchInput = memo(({ value, onChange, onClear }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {FILTER_LABELS.search}
    </label>
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={FILTER_PLACEHOLDERS.search}
        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
));

SearchInput.displayName = 'SearchInput';

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

  const handleFilterChange = (key) => (value) => {
    onFilterChange?.({ [key]: value });
  };

  const handleClearSearch = () => {
    onFilterChange?.({ search: '' });
  };

  const handleClearAll = () => {
    onFilterChange?.({ search: '', faculty: '', program: '', province: '' });
  };

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
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" /> {BUTTON_TEXTS.clear}
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
        <SearchInput
          value={filters.search}
          onChange={handleFilterChange('search')}
          onClear={handleClearSearch}
        />

        {/* Faculty */}
        <FilterDropdown
          label={FILTER_LABELS.faculty}
          value={filters.faculty}
          onChange={handleFilterChange('faculty')}
          options={faculties}
        />

        {/* Program (cascading) */}
        <FilterDropdown
          label={FILTER_LABELS.program}
          value={filters.program}
          onChange={handleFilterChange('program')}
          options={programs}
          disabled={!filters.faculty && programs.length === 0}
          extraInfo={filters.faculty && `(${programs.length} หลักสูตร)`}
        />

        {/* Province */}
        <FilterDropdown
          label={FILTER_LABELS.province}
          value={filters.province}
          onChange={handleFilterChange('province')}
          options={provinces}
        />

        {/* Near Me button */}
        <button
          onClick={onLocateMe}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Navigation className="w-4 h-4" />
          {BUTTON_TEXTS.nearMe}
        </button>
      </div>
    </div>
  );
}
