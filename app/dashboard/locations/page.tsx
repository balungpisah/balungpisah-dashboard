'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ProvinceReportSummary } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import IndonesiaMap, { ProvinceHeatItem, INDONESIA_PROVINCES } from '@/components/IndonesiaMap';

export default function LocationsPage() {
  const [provinces, setProvinces] = useState<ProvinceReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReportsByLocation();
      if (response.success) {
        setProvinces(response.data.provinces || []);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const provinceHeat: ProvinceHeatItem[] = useMemo(() => {
    return provinces.map((p) => ({
      provinceId: p.id,
      value: p.report_count,
      label: p.name,
    }));
  }, [provinces]);

  console.log('PROVINCE_HEAT:', provinceHeat);

  const sortedProvinces = useMemo(
    () => [...provinces].sort((a, b) => b.report_count - a.report_count),
    [provinces]
  );

  const selectedDetail = useMemo(() => {
    if (!selectedProvince) return null;
    const match = INDONESIA_PROVINCES.find((p) => p.id === selectedProvince);
    if (!match) return null;
    const apiMatch = provinces.find(
      (p) => p.name.trim().toLowerCase() === match.name.toLowerCase()
    );
    return { ...match, report_count: apiMatch?.report_count ?? 0, code: apiMatch?.code ?? '–' };
  }, [selectedProvince, provinces]);

  const totalReports = useMemo(
    () => provinces.reduce((sum, p) => sum + p.report_count, 0),
    [provinces]
  );

  const handleProvinceClick = (provinceId: string) => {
    setSelectedProvince((prev) => (prev === provinceId ? null : provinceId));
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600">Reports by province</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Locations</h1>
        <p className="text-gray-600">Reports distributed across Indonesian provinces</p>
      </div>

      {/* Top-level summary pills */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100">Total Reports</p>
              <p className="text-2xl font-bold">{formatNumber(totalReports)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-100">Provinces</p>
              <p className="text-2xl font-bold">{provinces.length}</p>
            </div>
          </div>
        </div>

        <div className="card col-span-2 bg-gradient-to-br from-violet-500 to-violet-600 text-white sm:col-auto sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-violet-100">Top Province</p>
              <p className="truncate text-lg font-bold">{sortedProvinces[0]?.name ?? '–'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Province Heatmap</h3>
          <span className="text-xs text-gray-400">Click a province to highlight</span>
        </div>

        <IndonesiaMap provinceHeat={provinceHeat} onProvinceClick={handleProvinceClick} />

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">Fewer</span>
          <div
            className="h-3 max-w-[160px] flex-1 rounded-full"
            style={{
              background: 'linear-gradient(to right, #cbd5e1, #7dd3fc, #38bdf8, #0ea5e9, #0284c7)',
            }}
          />
          <span className="text-xs text-gray-500">More</span>
        </div>

        {selectedDetail && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-primary-800">{selectedDetail.name}</span>
              <span className="font-mono text-xs text-primary-500">{selectedDetail.code}</span>
            </div>
            <span className="text-sm font-bold text-primary-700">
              {formatNumber(selectedDetail.report_count)} report
              {selectedDetail.report_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-700">Province Ranking</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {sortedProvinces.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No province data available</p>
          ) : (
            sortedProvinces.map((province, idx) => {
              const pct = totalReports > 0 ? (province.report_count / totalReports) * 100 : 0;
              return (
                <div
                  key={province.id}
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <span className="w-5 text-right text-xs font-bold text-gray-400">{idx + 1}</span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-gray-800">
                        {province.name}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-gray-600">
                        {formatNumber(province.report_count)}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(to right, #38bdf8, #0284c7)',
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-gray-400">{pct.toFixed(1)}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
