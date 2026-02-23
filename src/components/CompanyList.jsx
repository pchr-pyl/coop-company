import React, { useMemo, useState } from 'react';
import { Building2, MapPin, ChevronRight, ChevronDown } from 'lucide-react';

const FACULTY_COLORS = {
  'การบัญชีและการเงิน':    'bg-blue-100 text-blue-800',
  'การจัดการ':              'bg-amber-100 text-amber-800',
  'สารสนเทศศาสตร์':         'bg-purple-100 text-purple-800',
  'รัฐศาสตร์และนิติศาสตร์': 'bg-red-100 text-red-800',
  'วิศวกรรมศาสตร์':         'bg-orange-100 text-orange-800',
  'พยาบาลศาสตร์':           'bg-pink-100 text-pink-800',
  'สาธารณสุขศาสตร์':        'bg-emerald-100 text-emerald-800',
  'วิทยาศาสตร์':            'bg-cyan-100 text-cyan-800',
  'ศิลปศาสตร์':             'bg-indigo-100 text-indigo-800',
  'สถาปัตยกรรมศาสตร์':      'bg-lime-100 text-lime-800',
};

export default function CompanyList({ companies = [], onCompanyClick }) {
  const [expandedFaculties, setExpandedFaculties] = useState({});

  const grouped = useMemo(() => {
    const map = {};
    for (const c of companies) {
      const key = c.faculty || 'ไม่ระบุสำนักวิชา';
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'th'));
  }, [companies]);

  function toggleFaculty(faculty) {
    setExpandedFaculties(prev => ({ ...prev, [faculty]: !prev[faculty] }));
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm font-medium">ไม่พบสถานประกอบการ</p>
        <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนตัวกรองการค้นหา</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
        <span className="font-bold text-gray-800 text-sm">รายชื่อสถานประกอบการ</span>
        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
          {companies.length.toLocaleString()} แห่ง
        </span>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
        {grouped.map(([faculty, list]) => {
          const isExpanded = expandedFaculties[faculty] !== false;
          const colorClass = FACULTY_COLORS[faculty] ?? 'bg-gray-100 text-gray-700';
          return (
            <div key={faculty}>
              {/* Faculty group header */}
              <button
                onClick={() => toggleFaculty(faculty)}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold ${colorClass} hover:opacity-90 transition-opacity`}
              >
                <span>{faculty} ({list.length})</span>
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronRight className="w-3.5 h-3.5" />
                }
              </button>

              {/* Company rows */}
              {isExpanded && list.map(company => (
                <button
                  key={company.id}
                  onClick={() => onCompanyClick?.(company)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors group border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug mb-1">
                        {company.companyName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {company.program && (
                          <span className="truncate max-w-[120px]">📚 {company.program}</span>
                        )}
                        {company.province && (
                          <span className="flex items-center gap-0.5 flex-shrink-0">
                            <MapPin className="w-2.5 h-2.5" />{company.province}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
