'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { CategoryReportSummary } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

// Map your API icon names to Font Awesome classes
const iconMap: Record<string, string> = {
  people: 'fa-users',
  briefcase: 'fa-briefcase',
  shield: 'fa-shield-halved',
  school: 'fa-school',
  road: 'fa-road',
  hospital: 'fa-hospital',
  tree: 'fa-tree',
  water: 'fa-water',
  bolt: 'fa-bolt',
  droplet: 'fa-droplet',
  'road-damage': 'fa-road-barrier',
  other: 'fa-circle-question',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReportsByCategory();

      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600">Report categories and their distribution</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const faIcon = category.icon
              ? iconMap[category.icon] || 'fa-circle-question'
              : 'fa-circle-question';

            return (
              <div key={category.id} className="card transition-shadow hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: category.color + '20' || '#e5e7eb' }}
                  >
                    <i
                      className={`fa-solid ${faIcon} text-2xl`}
                      style={{ color: category.color || '#6b7280' }}
                    ></i>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(category.report_count)}
                    </p>
                    <p className="text-sm text-gray-500">reports</p>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
