'use client';

import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { RateLimitConfig } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function SettingsPage() {
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRateLimitConfigs();

      if (response.success) {
        setConfigs(response.data || []);
        const initialValues: Record<string, number> = {};
        (response.data || []).forEach((config: { key: string; value: number }) => {
          initialValues[config.key] = config.value;
        });
        setEditedValues(initialValues);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string) => {
    try {
      setUpdating(key);
      const value = editedValues[key];
      
      const response = await apiClient.updateRateLimitConfig(key, value);

      if (response.success) {
        await loadConfigs();
        alert('Configuration updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update configuration');
    } finally {
      setUpdating(null);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setEditedValues((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  const hasChanges = (config: RateLimitConfig) => {
    return editedValues[config.key] !== config.value;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure system settings and rate limits</p>
      </div>

      {/* Rate Limits */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rate Limit Configuration</h2>
            <p className="text-sm text-gray-600">Manage API rate limits for citizen reports</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No rate limit configurations found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {configs.map((config) => (
              <div
                key={config.key}
                className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration Key
                    </label>
                    <p className="font-mono text-sm text-gray-900">{config.key}</p>
                    {config.description && (
                      <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      value={editedValues[config.key] || 0}
                      onChange={(e) => handleValueChange(config.key, e.target.value)}
                      className="input"
                      min="0"
                    />
                  </div>

                  <div>
                    <button
                      onClick={() => handleUpdate(config.key)}
                      disabled={updating === config.key || !hasChanges(config)}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === config.key ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Current value: <span className="font-semibold">{config.value}</span> •
                    Last updated: {formatDateTime(config.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Important Notice</h3>
            <p className="text-sm text-blue-800">
              Rate limit changes take effect immediately. Please be cautious when modifying
              these values as they directly impact API usage limits for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
