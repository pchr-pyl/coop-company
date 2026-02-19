import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';


const REGION_LABELS = {
  'Bangkok': 'กรุงเทพฯ (Bangkok)',
  'Central': 'ภาคกลาง (Central)',
  'North': 'ภาคเหนือ (North)',
  'Northeast': 'ภาคตะวันออกเฉียงเหนือ (Northeast)',
  'East': 'ภาคตะวันออก (East)',
  'South': 'ภาคใต้ (South)',
  'Unknown': 'ไม่ระบุ (Unknown)',
};

export default function Sidebar({
  companies = [],
  filters = {},
  onFilterChange,
  totalCount = 0,
  filteredCount = 0,
}) {
  const regions = [...new Set((companies ?? []).map(c => c.region).filter(Boolean))].sort();
  const provinces = (() => {
    const src = filters.region
      ? companies.filter(c => c.region === filters.region)
      : companies;
    return [...new Set(src.map(c => c.province).filter(Boolean))].sort();
  })();
  const careerFields = (() => {
    const s = new Set();
    (companies ?? []).forEach(c => (c.careerFields ?? []).forEach(f => s.add(f)));
    return [...s].sort();
  })();

  const hasFilters = filters.search || filters.region || filters.province || filters.careerFields?.length;

  function update(patch) {
    onFilterChange?.({ ...filters, ...patch });
  }

  function clearAll() {
    onFilterChange?.({ search: '', region: '', province: '', careerFields: [] });
  }

  function toggleCareer(field) {
    const cur = filters.careerFields ?? [];
    update({
      careerFields: cur.includes(field) ? cur.filter(f => f !== field) : [...cur, field],
    });
  }

  return (
    <aside className="bg-white rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-gray-800 text-sm">Filters</span>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-blue-50 text-sm flex justify-between items-center">
        <span className="text-gray-600">Showing</span>
        <span className="font-bold text-blue-700">{filteredCount.toLocaleString()} / {totalCount.toLocaleString()}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ค้นหาบริษัท (Search)</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={e => update({ search: e.target.value })}
              placeholder="ชื่อบริษัท..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ภูมิภาค (Region)</label>
          <select
            value={filters.region ?? ''}
            onChange={e => update({ region: e.target.value, province: '' })}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">ทั้งหมด (All)</option>
            {regions.map(r => (
              <option key={r} value={r}>{REGION_LABELS[r] ?? r}</option>
            ))}
          </select>
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">จังหวัด (Province)</label>
          <select
            value={filters.province ?? ''}
            onChange={e => update({ province: e.target.value })}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">ทั้งหมด (All)</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Career Fields */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">สายงาน (Career Fields)</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {careerFields.map(field => (
              <label key={field} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters.careerFields ?? []).includes(field)}
                  onChange={() => toggleCareer(field)}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{field}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
