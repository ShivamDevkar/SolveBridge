import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockAdminAdapter } from '@/services/mockAdminAdapter';
import type { ServiceCategory, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/admin';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Search,
  RotateCw,
  Clock,
  AlertTriangle,
  Tag,
  Award,
} from 'lucide-react';

export function AdminCategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteBlockedWarning, setDeleteBlockedWarning] = useState<string | null>(null);

  // Form states for Create
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Form states for Edit
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminActor = {
    id: user?.id || 'admin-system',
    name: user?.name || 'Administrator',
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await mockAdminAdapter.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (statusFilter !== 'ALL' && cat.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesDesc = cat.description.toLowerCase().includes(q);
        const matchesTag = cat.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSkill = cat.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag && !matchesSkill) {
          return false;
        }
      }
      return true;
    });
  }, [categories, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    setNewName('');
    setNewDesc('');
    setNewTags('');
    setNewSkills('');
    setNewStatus('ACTIVE');
    setIsCreateModalOpen(true);
  };

  const handleCreateCategory = async () => {
    if (newName.trim().length < 3) {
      alert('Category name must contain at least 3 characters.');
      return;
    }
    if (newDesc.trim().length < 10) {
      alert('Please provide a descriptive category summary (at least 10 characters).');
      return;
    }

    const payload: CreateCategoryPayload = {
      name: newName.trim(),
      description: newDesc.trim(),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      requiredSkills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      status: newStatus,
    };

    setIsSubmitting(true);
    try {
      const created = await mockAdminAdapter.createCategory(payload, adminActor);
      setCategories((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
      setSuccessMessage(`Service category "${created.name}" created successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setEditDesc(category.description);
    setEditTags(category.tags.join(', '));
    setEditSkills(category.requiredSkills.join(', '));
    setEditStatus(category.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (editDesc.trim().length < 10) {
      alert('Description must be at least 10 characters.');
      return;
    }

    const payload: UpdateCategoryPayload = {
      description: editDesc.trim(),
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      requiredSkills: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
      status: editStatus,
    };

    setIsSubmitting(true);
    try {
      const updated = await mockAdminAdapter.updateCategory(editingCategory.id, payload, adminActor);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setIsEditModalOpen(false);
      setSuccessMessage(`Category "${updated.name}" updated successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: ServiceCategory) => {
    try {
      const updated = await mockAdminAdapter.toggleCategoryStatus(cat.id, adminActor);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSuccessMessage(`Category "${updated.name}" is now ${updated.status}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleRequestDelete = (cat: ServiceCategory) => {
    if (cat.referenceCount && cat.referenceCount > 0) {
      setDeleteBlockedWarning(
        `Cannot delete "${cat.name}": This category is currently referenced by ${cat.referenceCount} active or historical jobs/problems. Deactivate the category instead to prevent new proposals.`
      );
      return;
    }
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await mockAdminAdapter.deleteCategory(categoryToDelete.id, adminActor);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setSuccessMessage(`Category "${categoryToDelete.name}" deleted permanently.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setIsSubmitting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Marketplace Taxonomy
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Service Category & Skills Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure service verticals, symptom tags, and professional qualification requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            className="flex items-center gap-1 text-xs text-slate-600"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {deleteBlockedWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Deletion Safeguard Active</p>
              <p className="mt-0.5">{deleteBlockedWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setDeleteBlockedWarning(null)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {st === 'ALL' ? `All (${categories.length})` : st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category, tags, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading category taxonomy...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="text-center p-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Categories Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No service categories match your current search and filter settings.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCategories.map((cat) => {
            const isActive = cat.status === 'ACTIVE';
            return (
              <Card key={cat.id} className="hover:border-blue-300 transition-all shadow-2xs">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Category Details */}
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {cat.id}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">{cat.name}</h2>
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Inactive
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          ({cat.referenceCount || 0} active/historical references)
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{cat.description}</p>

                      {/* Problem Symptom Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          Tags:
                        </span>
                        {cat.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Required Skills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Award className="w-3 h-3 text-slate-400" />
                          Required Skills:
                        </span>
                        {cat.requiredSkills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] bg-purple-50 text-purple-700 border border-purple-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          className="text-xs flex items-center gap-1 text-slate-700"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(cat)}
                          className={`text-xs ${
                            isActive
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestDelete(cat)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Updated: {new Date(cat.updatedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Service Category"
        description="Introduce a new marketplace domain with qualification rules and problem tags."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCategory}
              disabled={isSubmitting || newName.trim().length < 3}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Solar & Renewable Energy"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span> (min 10 characters)
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the scope of work covered under this service vertical..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Symptom Tags (Comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g., Inverter Failure, Solar Panel Cleaning, Battery Backup"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Professional Skills (Comma separated)
            </label>
            <input
              type="text"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
              placeholder="e.g., Solar Inverter Diagnostics, Rooftop Panel Wiring"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ACTIVE">ACTIVE (Available immediately)</option>
              <option value="INACTIVE">INACTIVE (Draft)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Category: ${editingCategory.name}`}
          description={`ID: ${editingCategory.id}`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateCategory}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (min 10 characters)
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Problem Symptom Tags (Comma separated)
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {categoryToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete Category: ${categoryToDelete.name}`}
          description="Are you sure you want to permanently delete this service domain?"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
            </div>
          }
        >
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              This category has <strong>0 active or historical references</strong> and can be safely deleted.
            </p>
            <p className="text-red-600">This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
