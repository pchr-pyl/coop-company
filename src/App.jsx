import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { MapPin, Building2, GraduationCap, BookOpen, X } from 'lucide-react';
import MapComponent from './components/MapComponent.jsx';
import Sidebar from './components/Sidebar.jsx';
import CompanyList from './components/CompanyList.jsx';
import { loadCompanies } from './utils/dataProcessor';

// Constants
const INITIAL_FILTERS = {
  search: '',
  faculty: '',
  program: '',
  province: '',
};

const ERROR_MESSAGES = {
  geolocation: 'ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง',
  loading: 'ไม่สามารถโหลดข้อมูลได้',
};

// Custom hooks
function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCompanies = async () => {
      try {
        const data = await loadCompanies();
        if (isMounted) {
          setCompanies(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  return { companies, loading, error };
}

function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert(ERROR_MESSAGES.geolocation);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        });
      },
      () => alert(ERROR_MESSAGES.geolocation)
    );
  }, []);

  return { userLocation, handleLocateMe };
}

// Memoized components
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <p className="text-gray-700 font-semibold text-lg">กำลังโหลดข้อมูล...</p>
      <p className="text-gray-400 text-sm mt-1">Loading company data</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const ErrorDisplay = memo(({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">{ERROR_MESSAGES.loading}</h2>
      <p className="text-gray-600 text-sm mb-4">{error}</p>
      <p className="text-gray-400 text-xs mb-4">
        ตรวจสอบว่าไฟล์ <code className="bg-gray-100 px-1 rounded">companies.csv</code> อยู่ในโฟลเดอร์ <code className="bg-gray-100 px-1 rounded">/public</code>
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
      >
        ลองใหม่
      </button>
    </div>
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

export default function App() {
  const { companies, loading, error } = useCompanies();
  const { userLocation, handleLocateMe } = useGeolocation();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!c.companyName?.toLowerCase().includes(s)) return false;
      }
      if (filters.faculty && c.faculty !== filters.faculty) return false;
      if (filters.program && c.program !== filters.program) return false;
      if (filters.province && c.province !== filters.province) return false;
      return true;
    });
  }, [companies, filters]);

  const handleFilterChange = useCallback((patch) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const handleCompanySelect = useCallback((company) => {
    setSelectedCompany(company);
    setSidebarOpen(false);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-20 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-600 p-1.5 rounded-lg flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
                Co-op Map Thailand
              </h1>
              <p className="text-xs text-gray-500 leading-tight hidden sm:block">
                แผนที่สถานประกอบการสหกิจศึกษาและฝึกงาน
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-5">
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 leading-tight">{companies.length.toLocaleString()}</p>
              <p className="text-xs text-gray-500 leading-tight">สถานประกอบการทั้งหมด</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600 leading-tight">{filteredCompanies.length.toLocaleString()}</p>
              <p className="text-xs text-gray-500 leading-tight">ผลการค้นหา</p>
            </div>
          </div>

          {/* Mobile filter toggle */}
          <button
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium"
            onClick={() => setSidebarOpen(v => !v)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h4" />
            </svg>
            ตัวกรอง
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">

        {/* ── Sidebar (desktop always visible, mobile overlay) ── */}
        <aside
          className={`
            flex-shrink-0 w-80 bg-gray-100 flex flex-col gap-3 p-3 overflow-y-auto
            lg:relative lg:translate-x-0 lg:flex
            fixed inset-y-0 left-0 z-30 transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ top: '56px' }}
        >
          {/* Mobile close */}
          <div className="lg:hidden flex justify-end">
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <Sidebar
            companies={companies}
            filters={filters}
            onFilterChange={handleFilterChange}
            filteredCount={filteredCompanies.length}
            totalCount={companies.length}
            onLocateMe={handleLocateMe}
          />

          <CompanyList
            companies={filteredCompanies}
            onCompanyClick={handleCompanySelect}
          />
        </aside>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-20"
            style={{ top: '56px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Map ── */}
        <main className="flex-1 relative">
          <MapComponent
            companies={filteredCompanies}
            onMarkerClick={setSelectedCompany}
            userLocation={userLocation}
          />
        </main>
      </div>

      {/* ── Company Detail Modal ── */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug pt-1">
                    {selectedCompany.companyName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex-shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block leading-none mb-0.5">สำนักวิชา</span>
                    <span className="font-medium">{selectedCompany.faculty || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block leading-none mb-0.5">หลักสูตร</span>
                    <span className="font-medium">{selectedCompany.program || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 block leading-none mb-0.5">จังหวัด</span>
                    <span className="font-medium">{selectedCompany.province || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCompany.faculty && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                    {selectedCompany.faculty}
                  </span>
                )}
                {selectedCompany.program && (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                    {selectedCompany.program}
                  </span>
                )}
              </div>

              {/* Google Maps button */}
              {selectedCompany.lat && selectedCompany.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedCompany.lat},${selectedCompany.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  เปิดใน Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
