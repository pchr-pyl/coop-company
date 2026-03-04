'use client';

import { Building2, MapPin, Navigation } from 'lucide-react';
import type { Company } from '@/types';

const INDUSTRY_COLORS: Record<string, string> = {
  'การจัดการ':                        'bg-amber-100 text-amber-800',
  'การบัญชีและการเงิน':               'bg-blue-100 text-blue-800',
  'รัฐศาสตร์และนิติศาสตร์':           'bg-red-100 text-red-800',
  'วิทยาศาสตร์':                      'bg-cyan-100 text-cyan-800',
  'วิศวกรรมศาสตร์และเทคโนโลยี':      'bg-orange-100 text-orange-800',
  'ศิลปศาสตร์':                       'bg-indigo-100 text-indigo-800',
  'สถาปัตยกรรมศาสตร์และการออกแบบ':   'bg-lime-100 text-lime-800',
  'สาธารณสุขศาสตร์':                  'bg-emerald-100 text-emerald-800',
  'สารสนเทศศาสตร์':                   'bg-purple-100 text-purple-800',
  'เทคโนโลยีการเกษตร':               'bg-green-100 text-green-800',
};

function industryBadge(industry: string): string {
  return INDUSTRY_COLORS[industry] ?? 'bg-gray-100 text-gray-700';
}

interface CompanyListProps {
  companies: Company[];
  total?: number;
  loading?: boolean;
  error?: string | null;
}

export default function CompanyList({
  companies,
  total,
  loading = false,
  error = null,
}: CompanyListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-400 text-sm">
        กำลังโหลดข้อมูล…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm font-medium">ไม่พบสถานประกอบการ</p>
        <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนตัวกรองการค้นหา</p>
      </div>
    );
  }

  const displayTotal = total ?? companies.length;
  const truncated = displayTotal > companies.length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-medium">
        พบ{' '}
        <span className="text-blue-600 font-semibold">
          {displayTotal.toLocaleString()}
        </span>{' '}
        สถานประกอบการ
        {truncated && (
          <span className="text-gray-400"> (แสดง {companies.length} รายการแรก)</span>
        )}
      </p>

      {companies.map((company) => (
        <div
          key={company.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug">
                {company.company_name}
              </p>

              {company.program && (
                <p className="text-xs text-gray-500 mt-0.5">{company.program}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${industryBadge(company.industry)}`}
                >
                  {company.industry}
                </span>

                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {company.province}
                </span>

                {company.accept_interns && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    รับนักศึกษา
                  </span>
                )}

                {company.distance && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    <Navigation className="w-3 h-3" />
                    {company.distance}
                  </span>
                )}
              </div>

              {company.description && (
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
