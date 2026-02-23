import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Building2 } from 'lucide-react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import CompanyList from './components/CompanyList';
import { loadCompanies } from './utils/dataProcessor';

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    province: '',
    careerFields: [],
  });
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadCompanies()
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filteredCompanies = useMemo(() => {
    return (companies ?? []).filter(c => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!c.companyName?.toLowerCase().includes(s) && !c.province?.toLowerCase().includes(s)) return false;
      }
      if (filters.region && c.region !== filters.region) return false;
      if (filters.province && c.province !== filters.province) return false;
      if (filters.careerFields?.length > 0) {
        if (!filters.careerFields.some(f => c.careerFields?.includes(f))) return false;
      }
      return true;
    });
  }, [companies, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          <p className="text-gray-400 text-sm mt-1">Loading company data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <p className="text-gray-400 text-xs">Make sure <code className="bg-gray-100 px-1 rounded">companies.csv</code> is in the <code className="bg-gray-100 px-1 rounded">/public</code> folder.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Co-op Map Thailand</h1>
              <p className="text-xs text-gray-500 leading-tight">แผนที่สถานประกอบการสหกิจศึกษาและฝึกงาน</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xl font-bold text-blue-600 leading-tight">{companies.length.toLocaleString()}</p>
              <p className="text-xs text-gray-500 leading-tight">Total Companies</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xl font-bold text-emerald-600 leading-tight">{filteredCompanies.length.toLocaleString()}</p>
              <p className="text-xs text-gray-500 leading-tight">Filtered</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-90px)]">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
            <div className="flex-shrink-0">
              <Sidebar
                companies={companies}
                filters={filters}
                onFilterChange={setFilters}
                totalCount={companies.length}
                filteredCount={filteredCompanies.length}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <CompanyList
                companies={filteredCompanies}
                onCompanyClick={setSelectedCompany}
              />
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-9 rounded-xl overflow-hidden shadow-lg">
            <MapComponent
              companies={filteredCompanies}
              onMarkerClick={setSelectedCompany}
            />
          </div>
        </div>
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 pr-4 leading-snug">
                  {selectedCompany.companyName}
                </h3>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Code: <strong>{selectedCompany.companyCode}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{selectedCompany.province} · {selectedCompany.region}</span>
                </div>
                {selectedCompany.zipCode && (
                  <div className="text-gray-600 pl-6">ZIP: {selectedCompany.zipCode}</div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Career Fields:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCompany.careerFields ?? []).map((f, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
