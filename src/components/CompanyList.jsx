import React from 'react';
import { Building2, MapPin, ChevronRight } from 'lucide-react';


const REGION_LABELS = {
  'Bangkok': 'กรุงเทพฯ',
  'Central': 'ภาคกลาง',
  'North': 'ภาคเหนือ',
  'Northeast': 'ภาคตะวันออกเฉียงเหนือ',
  'East': 'ภาคตะวันออก',
  'South': 'ภาคใต้',
  'Unknown': 'ไม่ระบุ',
};

const REGION_COLORS = {
  'Bangkok': 'bg-blue-100 text-blue-800',
  'Central': 'bg-sky-100 text-sky-800',
  'North': 'bg-red-100 text-red-800',
  'Northeast': 'bg-yellow-100 text-yellow-800',
  'East': 'bg-green-100 text-green-800',
  'South': 'bg-purple-100 text-purple-800',
  'Unknown': 'bg-gray-100 text-gray-700',
};

const FIELD_COLORS = {
  'Tech & Data': 'bg-blue-50 text-blue-700 border-blue-200',
  'Engineering': 'bg-amber-50 text-amber-700 border-amber-200',
  'Health & Medical': 'bg-rose-50 text-rose-700 border-rose-200',
  'Finance & Banking': 'bg-teal-50 text-teal-700 border-teal-200',
  'Education': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Government': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Business & Trade': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Agriculture': 'bg-lime-50 text-lime-700 border-lime-200',
  'Media & Creative': 'bg-pink-50 text-pink-700 border-pink-200',
  'Hospitality & Tourism': 'bg-orange-50 text-orange-700 border-orange-200',
  'General': 'bg-gray-50 text-gray-600 border-gray-200',
};

const REGION_ORDER = ['Bangkok', 'Central', 'North', 'Northeast', 'East', 'South', 'Unknown'];

export default function CompanyList({ companies = [], onCompanyClick }) {
  if (!companies || companies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">ไม่พบสถานประกอบการ</p>
        <p className="text-gray-400 text-xs mt-1">No companies match your filters</p>
      </div>
    );
  }

  const grouped = companies.reduce((acc, c) => {
    const r = c.region ?? 'Unknown';
    if (!acc[r]) acc[r] = [];
    acc[r].push(c);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <span className="font-bold text-gray-800 text-sm">Companies</span>
        <span className="text-xs text-gray-500">{companies.length.toLocaleString()} results</span>
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
        {REGION_ORDER.map(region => {
          const list = grouped[region];
          if (!list?.length) return null;
          return (
            <div key={region}>
              <div className={`px-4 py-1.5 text-xs font-semibold ${REGION_COLORS[region] ?? 'bg-gray-100 text-gray-700'}`}>
                {REGION_LABELS[region] ?? region} ({list.length})
              </div>
              {list.map(company => (
                <button
                  key={company.id}
                  onClick={() => onCompanyClick?.(company)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                        {company.companyName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{company.province}
                        </span>
                        {company.zipCode && <span>{company.zipCode}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(company.careerFields ?? []).slice(0, 3).map((f, i) => (
                          <span key={i} className={`text-xs px-1.5 py-0.5 rounded border ${FIELD_COLORS[f] ?? FIELD_COLORS['General']}`}>
                            {f}
                          </span>
                        ))}
                        {(company.careerFields?.length ?? 0) > 3 && (
                          <span className="text-xs text-gray-400">+{company.careerFields.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5" />
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
