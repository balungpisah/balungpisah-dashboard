'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, Trash2, Plus, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PromptKeyDefinition, PromptResponseDto } from '@/lib/types';
import { formatDate, formatNumber, getPromptStatusColor, getPromptStatusLabel } from '@/lib/utils';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('true');
  const pageSize = 20;

  // Prompt keys from backend
  const [promptKeys, setPromptKeys] = useState<PromptKeyDefinition[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    key: '',
    name: '',
    description: '',
    template_content: '',
    variables: '',
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<PromptResponseDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Restore state
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPrompts({
        page,
        pageSize,
        search: searchTerm || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
      });

      if (response.success) {
        setPrompts(response.data || []);
        setTotalPages(response.meta?.total_pages || 1);
        setTotalItems(response.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, activeFilter]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const loadPromptKeys = async () => {
    try {
      setLoadingKeys(true);
      const response = await apiClient.getPromptKeys();
      if (response.success && response.data) {
        setPromptKeys(response.data);
      }
    } catch (error) {
      console.error('Failed to load prompt keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const openCreateModal = () => {
    loadPromptKeys();
    setShowCreateModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPrompts();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.key) {
      alert('Please select a prompt key');
      return;
    }

    let parsedVariables: Record<string, unknown> | undefined;
    if (createForm.variables.trim()) {
      try {
        parsedVariables = JSON.parse(createForm.variables);
      } catch {
        alert('Invalid JSON in variables field');
        return;
      }
    }

    try {
      setCreating(true);
      const response = await apiClient.createPrompt({
        key: createForm.key,
        name: createForm.name,
        description: createForm.description || undefined,
        template_content: createForm.template_content,
        variables: parsedVariables,
      });

      if (response.success) {
        setShowCreateModal(false);
        setCreateForm({ key: '', name: '', description: '', template_content: '', variables: '' });
        setPage(1);
        loadPrompts();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to create prompt');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await apiClient.deletePrompt(deleteTarget.id);

      if (response.success) {
        setDeleteTarget(null);
        loadPrompts();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to delete prompt');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (prompt: PromptResponseDto) => {
    try {
      setRestoringId(prompt.id);
      const response = await apiClient.restorePrompt(prompt.id);

      if (response.success) {
        loadPrompts();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to restore prompt');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Prompts</h1>
          <p className="text-gray-600">
            Manage prompt templates ({formatNumber(totalItems)} total)
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Prompt
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-11"
              />
            </div>
          </div>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="input w-[130px]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Key
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : prompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No prompts found
                  </td>
                </tr>
              ) : (
                prompts.map((prompt) => (
                  <tr key={prompt.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{prompt.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{prompt.key}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getPromptStatusColor(prompt.is_active)}`}>
                        {getPromptStatusLabel(prompt.is_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">v{prompt.version}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(prompt.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/prompts/${prompt.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        {prompt.is_active ? (
                          <button
                            onClick={() => setDeleteTarget(prompt)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(prompt)}
                            disabled={restoringId === prompt.id}
                            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {restoringId === prompt.id ? 'Restoring...' : 'Restore'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Prompt</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Key</label>
                {loadingKeys ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    Loading keys...
                  </div>
                ) : (
                  <select
                    value={createForm.key}
                    onChange={(e) => {
                      const selectedKey = e.target.value;
                      const keyDef = promptKeys.find((k) => k.key === selectedKey);
                      const defaultName = selectedKey
                        ? selectedKey
                            .split('/')
                            .map((part) =>
                              part
                                .split('_')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ')
                            )
                            .join(' - ')
                        : '';
                      setCreateForm({
                        ...createForm,
                        key: selectedKey,
                        name: defaultName,
                        description: keyDef?.description || '',
                      });
                    }}
                    className="input font-mono text-sm"
                    required
                  >
                    <option value="">Select a prompt key...</option>
                    {promptKeys.map((keyDef) => (
                      <option key={keyDef.key} value={keyDef.key}>
                        {keyDef.key}
                      </option>
                    ))}
                  </select>
                )}
                {createForm.key && (
                  <p className="mt-1 text-xs text-gray-500">
                    {promptKeys.find((k) => k.key === createForm.key)?.description}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Citizen Report Agent - System"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={2}
                  className="input"
                  placeholder="Brief description of this prompt..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Template Content
                </label>
                <textarea
                  value={createForm.template_content}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, template_content: e.target.value })
                  }
                  rows={6}
                  className="input font-mono text-sm"
                  placeholder="Enter your prompt template..."
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Variables JSON (Optional)
                </label>
                <textarea
                  value={createForm.variables}
                  onChange={(e) => setCreateForm({ ...createForm, variables: e.target.value })}
                  rows={3}
                  className="input font-mono text-sm"
                  placeholder='{"variable_name": "default_value"}'
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Delete Prompt</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deleteTarget.name}</span>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
