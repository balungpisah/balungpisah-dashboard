'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PromptKeyDefinition, PromptResponseDto } from '@/lib/types';
import {
  formatDateTime,
  formatRelativeTime,
  getPromptStatusColor,
  getPromptStatusLabel,
} from '@/lib/utils';

export default function PromptDetailPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<PromptResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [variablesJson, setVariablesJson] = useState('');
  const [keyDefinition, setKeyDefinition] = useState<PromptKeyDefinition | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPrompt(params.id as string);
    }
  }, [params.id]);

  const loadKeyDefinition = async (promptKey: string) => {
    try {
      const response = await apiClient.getPromptKeys();
      if (response.success && response.data) {
        const def = response.data.find((k) => k.key === promptKey);
        setKeyDefinition(def || null);
      }
    } catch (error) {
      console.error('Failed to load prompt keys:', error);
    }
  };

  const loadPrompt = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getPrompt(id);

      if (response.success && response.data) {
        const data = response.data;
        setPrompt(data);
        setName(data.name);
        setDescription(data.description || '');
        setTemplateContent(data.template_content);
        setVariablesJson(data.variables ? JSON.stringify(data.variables, null, 2) : '');
        loadKeyDefinition(data.key);
      }
    } catch (error) {
      console.error('Failed to load prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!prompt) return;

    let parsedVariables: Record<string, unknown> | undefined;
    if (variablesJson.trim()) {
      try {
        parsedVariables = JSON.parse(variablesJson);
      } catch {
        alert('Invalid JSON in variables field');
        return;
      }
    }

    try {
      setUpdating(true);
      const response = await apiClient.updatePrompt(prompt.id, {
        name,
        description: description || undefined,
        template_content: templateContent,
        variables: parsedVariables,
      });

      if (response.success) {
        await loadPrompt(prompt.id);
        alert('Prompt updated successfully!');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to update prompt');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">Prompt not found</p>
        <Link href="/dashboard/prompts" className="btn-primary">
          Back to Prompts
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/prompts"
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{prompt.name}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getPromptStatusColor(prompt.is_active)}`}>
              {getPromptStatusLabel(prompt.is_active)}
            </span>
            <span className="badge bg-gray-100 text-gray-800">v{prompt.version}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Name */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          {/* Description */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input"
              placeholder="Brief description of this prompt..."
            />
          </div>

          {/* Template Content */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Template Content</h2>
            <textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              rows={12}
              className="input font-mono text-sm"
              placeholder="Enter your prompt template..."
            />
          </div>

          {/* Variables */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Variables JSON</h2>
            <textarea
              value={variablesJson}
              onChange={(e) => setVariablesJson(e.target.value)}
              rows={6}
              className="input font-mono text-sm"
              placeholder='{"variable_name": "default_value"}'
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Button */}
          <div className="card">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Information */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Prompt ID</p>
                <p className="font-mono text-xs text-gray-900">{prompt.id}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Key</p>
                <p className="font-mono text-sm text-gray-900">{prompt.key}</p>
                {keyDefinition && (
                  <p className="mt-1 text-xs text-gray-500">{keyDefinition.description}</p>
                )}
              </div>
              <div>
                <p className="mb-1 text-gray-500">Status</p>
                <span className={`badge ${getPromptStatusColor(prompt.is_active)}`}>
                  {getPromptStatusLabel(prompt.is_active)}
                </span>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Version</p>
                <p className="text-gray-900">v{prompt.version}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Created</p>
                <p className="text-gray-900">{formatDateTime(prompt.created_at)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(prompt.created_at)}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDateTime(prompt.updated_at)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(prompt.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
