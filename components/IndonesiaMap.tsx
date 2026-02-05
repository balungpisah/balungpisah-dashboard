'use client';

import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export interface MapPoint {
  id: string;
  lat: number;
  lon: number;
  status: string;
  category_color?: string;
  label?: string;
}

export interface ProvinceHeatItem {
  provinceId: string;
  value: number;
  label?: string;
}

export interface IndonesiaMapProps {
  points?: MapPoint[];
  visibleStatuses?: Set<string>;
  statusColors?: Record<string, string>;
  provinceHeat?: ProvinceHeatItem[];
  onPointClick?: (point: MapPoint) => void;
  onProvinceClick?: (provinceId: string) => void;
  className?: string;
}

// Keeping your existing ID mapping for compatibility with your LocationsPage
export const INDONESIA_PROVINCES = [
  { id: 'aceh', name: 'Aceh', lat: 4.69, lon: 96.74 },
  { id: 'north_sumatra', name: 'Sumatera Utara', lat: 2.11, lon: 99.17 },
  { id: 'west_sumatra', name: 'Sumatera Barat', lat: -0.73, lon: 100.79 },
  { id: 'riau', name: 'Riau', lat: 0.5, lon: 101.3 },
  { id: 'jambi', name: 'Jambi', lat: -1.61, lon: 103.61 },
  { id: 'south_sumatra', name: 'Sumatera Selatan', lat: -3.31, lon: 104.75 },
  { id: 'bengkulu', name: 'Bengkulu', lat: -3.79, lon: 102.26 },
  { id: 'lampung', name: 'Lampung', lat: -4.55, lon: 105.28 },
  { id: 'bangka_belitung', name: 'Kepulauan Bangka Belitung', lat: -2.74, lon: 106.44 },
  { id: 'kepulauan_riau', name: 'Kepulauan Riau', lat: 3.94, lon: 108.24 },
  { id: 'dki_jakarta', name: 'DKI Jakarta', lat: -6.2, lon: 106.84 },
  { id: 'west_java', name: 'Jawa Barat', lat: -7.09, lon: 107.63 },
  { id: 'central_java', name: 'Jawa Tengah', lat: -7.15, lon: 110.14 },
  { id: 'di_yogyakarta', name: 'DI Yogyakarta', lat: -7.87, lon: 110.42 },
  { id: 'east_java', name: 'Jawa Timur', lat: -7.53, lon: 112.23 },
  { id: 'banten', name: 'Banten', lat: -6.4, lon: 106.06 },
  { id: 'bali', name: 'Bali', lat: -8.4, lon: 115.18 },
  { id: 'west_nusa_tenggara', name: 'Nusa Tenggara Barat', lat: -8.65, lon: 117.41 },
  { id: 'east_nusa_tenggara', name: 'Nusa Tenggara Timur', lat: -8.65, lon: 121.07 },
  { id: 'west_kalimantan', name: 'Kalimantan Barat', lat: -0.27, lon: 111.47 },
  { id: 'central_kalimantan', name: 'Kalimantan Tengah', lat: -1.68, lon: 113.38 },
  { id: 'south_kalimantan', name: 'Kalimantan Selatan', lat: -3.09, lon: 115.28 },
  { id: 'east_kalimantan', name: 'Kalimantan Timur', lat: 0.53, lon: 116.44 },
  { id: 'north_kalimantan', name: 'Kalimantan Utara', lat: 3.02, lon: 116.03 },
  { id: 'north_sulawesi', name: 'Sulawesi Utara', lat: 0.62, lon: 123.97 },
  { id: 'central_sulawesi', name: 'Sulawesi Tengah', lat: -1.43, lon: 121.44 },
  { id: 'south_sulawesi', name: 'Sulawesi Selatan', lat: -3.66, lon: 119.97 },
  { id: 'southeast_sulawesi', name: 'Sulawesi Tenggara', lat: -4.14, lon: 122.17 },
  { id: 'gorontalo', name: 'Gorontalo', lat: 0.69, lon: 122.44 },
  { id: 'west_sulawesi', name: 'Sulawesi Barat', lat: -2.84, lon: 119.23 },
  { id: 'maluku', name: 'Maluku', lat: -3.23, lon: 130.14 },
  { id: 'north_maluku', name: 'Maluku Utara', lat: 1.48, lon: 127.59 },
  { id: 'west_papua', name: 'Papua Barat', lat: -1.33, lon: 132.57 },
  { id: 'papua', name: 'Papua', lat: -4.26, lon: 138.08 },
  // Adding placeholders for 38-province expansion if your API supports them
  { id: 'papua_selatan', name: 'Papua Selatan', lat: -7.5, lon: 139.0 },
  { id: 'papua_tengah', name: 'Papua Tengah', lat: -3.5, lon: 136.0 },
  { id: 'papua_pegunungan', name: 'Papua Pegunungan', lat: -4.0, lon: 139.0 },
  { id: 'papua_barat_daya', name: 'Papua Barat Daya', lat: -1.0, lon: 132.0 },
];

const INDO_GEO_URL =
  'https://raw.githubusercontent.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/refs/heads/main/TopoJSON/indonesia-38-provinces.topo.json';

const normalizeName = (name: string) =>
  name
    ?.toLowerCase()
    .replace(/provinsi|daerah istimewa|kepulauan/g, '')
    .trim() || '';

export default function IndonesiaMap({
  points = [],
  visibleStatuses,
  statusColors = {},
  provinceHeat = [],
  onPointClick,
  onProvinceClick,
  className = '',
}: IndonesiaMapProps) {
  const [position, setPosition] = useState({ coordinates: [118, -2], zoom: 1 });
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const maxHeat = useMemo(() => {
    const counts = provinceHeat.map((p: ProvinceHeatItem) => p.value);
    return counts.length > 0 ? Math.max(...counts) : 10;
  }, [provinceHeat]);

  const colorScale = scaleLinear<string>().domain([0, maxHeat]).range(['#ffffff', '#0369a1']);

  const heatColor = scaleLinear<string>().domain([0, maxHeat]).range(['#7dd3fc', '#0369a1']);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const provinceCircles = useMemo(() => {
    return INDONESIA_PROVINCES.map((prov) => {
      const heat = provinceHeat.find(
        (h: ProvinceHeatItem) =>
          h.label?.toLowerCase().includes(prov.name.toLowerCase()) ||
          prov.name.toLowerCase().includes(h.label?.toLowerCase() || '')
      );

      const value = heat?.value ?? 0;
      const radius = value > 0 ? Math.max(6, Math.min(25, 4 + (value / maxHeat) * 21)) : 0;
      const fill = value > 0 ? heatColor(value) : 'transparent';

      return { ...prov, value, radius, fill };
    }).filter((p) => p.radius > 0);
  }, [provinceHeat, maxHeat, heatColor]);

  const activeMarkers = useMemo(() => {
    return points.filter((p: MapPoint) => {
      const lng = Number(p.lon);
      const lat = Number(p.lat);
      const hasCoords = !isNaN(lng) && !isNaN(lat) && lng !== 0;
      const isVisible = visibleStatuses ? visibleStatuses.has(p.status) : true;
      return hasCoords && isVisible;
    });
  }, [points, visibleStatuses]);

  // Zoom Handlers
  const handleZoomIn = () => setPosition((prev) => ({ ...prev, zoom: prev.zoom * 1.5 }));
  const handleZoomOut = () => setPosition((prev) => ({ ...prev, zoom: prev.zoom / 1.5 }));
  const handleReset = () => setPosition({ coordinates: [118, -2], zoom: 1 });

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-200 ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Zoom Controls UI */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-md hover:bg-slate-50"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-md hover:bg-slate-50"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-md hover:bg-slate-50"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          // Adjusted scale/center to prevent cropping on standard cards
          scale: 1000,
          center: [118, -2],
        }}
        className="h-full w-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={setPosition}
        >
          <Geographies geography={INDO_GEO_URL}>
            {({
              geographies,
            }: {
              geographies: { rsmKey: string; properties: Record<string, string> }[];
            }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.PROVINSI || geo.properties.NAME_1;
                const heat = provinceHeat.find(
                  (h: ProvinceHeatItem) => normalizeName(h.label || '') === normalizeName(geoName)
                );
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredName(geoName)}
                    onMouseLeave={() => setHoveredName(null)}
                    onClick={() => onProvinceClick?.(normalizeName(geoName))}
                    fill={heat && heat.value > 0 ? colorScale(heat.value) : '#f8fafc'}
                    stroke="#64748b" // Much darker border
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#bae6fd', outline: 'none', cursor: 'pointer' },
                      pressed: { fill: '#7dd3fc', outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {activeMarkers.map((point: MapPoint) => (
            <Marker key={point.id} coordinates={[Number(point.lon), Number(point.lat)]}>
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onPointClick?.(point);
                }}
              >
                <circle r={12} fill="transparent" />
                <circle r={7} fill="rgba(0,0,0,0.3)" cy={1} />
                <circle
                  r={5}
                  fill={point.category_color || statusColors[point.status] || '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <div className="pointer-events-none absolute bottom-4 left-4">
        {hoveredName ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl">
            {hoveredName}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 backdrop-blur-sm">
            Indonesia Map
          </div>
        )}
      </div>
    </div>
  );
}
