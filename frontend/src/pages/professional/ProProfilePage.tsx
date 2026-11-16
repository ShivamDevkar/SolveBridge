import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { validateProfessionalProfile } from '@/lib/validation';
import {
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Navigation,
  Wrench,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'Home Appliances & HVAC', label: 'Home Appliances & HVAC' },
  { value: 'Plumbing & Water Systems', label: 'Plumbing & Water Systems' },
  { value: 'Electrical Systems', label: 'Electrical Systems' },
  { value: 'Vehicle & Roadside Breakdown', label: 'Vehicle & Roadside Breakdown' },
  { value: 'Tech Hardware & Networking', label: 'Tech Hardware & Networking' },
  { value: 'Commercial Facility Maintenance', label: 'Commercial Facility Maintenance' },
];

const RADIUS_OPTIONS = [
  { value: '5', label: 'Within 5 km (Immediate neighborhood)' },
  { value: '10', label: 'Within 10 km (Standard service area)' },
  { value: '15', label: 'Within 15 km (Extended coverage)' },
  { value: '25', label: 'Within 25 km (Greater metropolitan)' },
];

export function ProProfilePage() {
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    category: user?.category || 'Electrical Systems',
    skills: user?.skills && user.skills.length > 0 ? user.skills : ['Wiring Diagnostics', 'MCB Breakers'],
    coverageRadius: user?.coverageRadius || '15',
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillInputError, setSkillInputError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    businessName?: string;
    phone?: string;
    category?: string;
    skills?: string;
    coverageRadius?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with auth user on change
  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || user.name || '',
        phone: user.phone || '+91 98765 43210',
        category: user.category || 'Electrical Systems',
        skills: user.skills && user.skills.length > 0 ? user.skills : ['Wiring Diagnostics', 'MCB Breakers'],
        coverageRadius: user.coverageRadius || '15',
      });
    }
  }, [user]);

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        businessName: user.businessName || user.name || '',
        phone: user.phone || '+91 98765 43210',
        category: user.category || 'Electrical Systems',
        skills: user.skills && user.skills.length > 0 ? [...user.skills] : ['Wiring Diagnostics', 'MCB Breakers'],
        coverageRadius: user.coverageRadius || '15',
      });
    }
    setFieldErrors({});
    setSkillInputError(null);
    setSubmitError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        businessName: user.businessName || user.name || '',
        phone: user.phone || '+91 98765 43210',
        category: user.category || 'Electrical Systems',
        skills: user.skills && user.skills.length > 0 ? [...user.skills] : ['Wiring Diagnostics', 'MCB Breakers'],
        coverageRadius: user.coverageRadius || '15',
      });
    }
    setFieldErrors({});
    setSkillInputError(null);
    setSubmitError(null);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) {
      setSkillInputError('Please enter a skill name.');
      return;
    }

    const isDuplicate = formData.skills.some(
      (s) => s.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setSkillInputError(`"${trimmed}" is already included in your skills list.`);
      return;
    }

    setFormData({
      ...formData,
      skills: [...formData.skills, trimmed],
    });
    setNewSkillInput('');
    setSkillInputError(null);
    if (fieldErrors.skills) {
      setFieldErrors({ ...fieldErrors, skills: undefined });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = formData.skills.filter((s) => s !== skillToRemove);
    setFormData({ ...formData, skills: updated });
    if (updated.length === 0) {
      setFieldErrors({ ...fieldErrors, skills: 'Please specify at least one trade skill.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving || authLoading) return;

    const validation = validateProfessionalProfile({
      businessName: formData.businessName,
      phone: formData.phone,
      category: formData.category,
      skills: formData.skills,
      coverageRadius: formData.coverageRadius,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSaving(true);

    try {
      await updateUserProfile({
        businessName: formData.businessName.trim(),
        name: formData.businessName.trim(),
        phone: formData.phone.trim(),
        category: formData.category.trim(),
        skills: formData.skills,
        coverageRadius: formData.coverageRadius.trim(),
      });

      setSuccessMessage('Professional profile and service settings updated successfully.');
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update profile. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayBusinessName = user?.businessName || user?.name || 'Professional Business';
  const isVerified = user?.verificationStatus === 'VERIFIED';
  const initials =
    displayBusinessName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'PB';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Professional Profile & Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your registered trade identity, verified competencies, and geographic service dispatch radius.
          </p>
        </div>

        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartEdit}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-950">
              Update Successful
            </span>
            <p className="text-emerald-800 mt-0.5">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5 shadow-2xs"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-950">
              Update Error
            </span>
            <p className="text-red-800 mt-0.5">{submitError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-red-500 hover:text-red-800 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Verification Status Ribbon Banner */}
      {isVerified ? (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                  Verified Professional
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  Audit Passed
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-1">
                Your business credentials, tax identifiers, and background audit have been verified by administrators. You are authorized to submit proposals for all matching client requests.
              </p>
            </div>
          </div>
          <Link
            to="/pro/verification"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0 inline-flex items-center gap-1 mt-1"
          >
            Audit File <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-950">
                  Unverified Professional
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900">
                  Pending Verification
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1">
                Your account is active in unverified mode. You can browse matching problem opportunities, but submitting official proposals requires administrative credential audit approval.
              </p>
            </div>
          </div>
          <Link
            to="/pro/verification"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
          >
            Submit Documents <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated overflow-hidden">
        <div className="h-2 bg-emerald-600" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xl font-bold shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  {displayBusinessName}
                </CardTitle>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user?.role || 'PROFESSIONAL'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'pro@solvebid.demo'}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {isEditing ? (
          /* Edit Mode Form */
          <form onSubmit={handleSave} noValidate>
            <CardContent className="space-y-5 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business / Registered Trade Name"
                  placeholder="e.g. Apex Electrical Solutions"
                  leftIcon={<Briefcase className="w-4 h-4" />}
                  value={formData.businessName}
                  onChange={(e) => {
                    setFormData({ ...formData, businessName: e.target.value });
                    if (fieldErrors.businessName) setFieldErrors({ ...fieldErrors, businessName: undefined });
                  }}
                  error={fieldErrors.businessName}
                  required
                  disabled={isSaving || authLoading}
                />

                <Input
                  label="Contact Phone Number"
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
                  }}
                  error={fieldErrors.phone}
                  required
                  disabled={isSaving || authLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Service Category"
                  options={CATEGORY_OPTIONS}
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: undefined });
                  }}
                  error={fieldErrors.category}
                  required
                  disabled={isSaving || authLoading}
                />

                <Select
                  label="Service Coverage Dispatch Radius"
                  options={RADIUS_OPTIONS}
                  value={formData.coverageRadius}
                  onChange={(e) => {
                    setFormData({ ...formData, coverageRadius: e.target.value });
                    if (fieldErrors.coverageRadius) setFieldErrors({ ...fieldErrors, coverageRadius: undefined });
                  }}
                  error={fieldErrors.coverageRadius}
                  required
                  disabled={isSaving || authLoading}
                />
              </div>

              {/* Skills Tag Management */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Trade Skills & Competencies <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  These specialized skills are matched by the SolveBid algorithmic engine against customer symptom reports.
                </p>

                {/* Existing Skills Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs"
                    >
                      <Wrench className="w-3 h-3 text-emerald-600" />
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-500 hover:text-emerald-900 rounded p-0.5"
                        aria-label={`Remove skill ${skill}`}
                        disabled={isSaving || authLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {fieldErrors.skills && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.skills}</p>
                )}

                {/* Add New Skill Input */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Add a new trade skill (e.g. Inverter Board Repair)"
                      value={newSkillInput}
                      onChange={(e) => {
                        setNewSkillInput(e.target.value);
                        if (skillInputError) setSkillInputError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      error={skillInputError || undefined}
                      disabled={isSaving || authLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleAddSkill}
                    disabled={!newSkillInput.trim() || isSaving || authLoading}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Skill
                  </Button>
                </div>
              </div>

              {/* Immutable Security Fields Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Immutable System Attributes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Account Email
                    </span>
                    <span className="font-mono text-slate-800">{user?.email || 'pro@solvebid.demo'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Verification Status
                    </span>
                    <span className="font-semibold text-slate-800">
                      {isVerified ? 'VERIFIED (Administrator Approved)' : 'UNVERIFIED (Audit Required)'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Security rules strictly prevent self-verification and email modification through profile edits.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-3 pt-3 bg-slate-50/50 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancelEdit}
                disabled={isSaving || authLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving || authLoading}
                disabled={isSaving || authLoading}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </CardFooter>
          </form>
        ) : (
          /* Read-Only View Mode */
          <CardContent className="space-y-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Business Name
                </span>
                <p className="text-sm font-semibold text-slate-900">{displayBusinessName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Contact Phone
                </span>
                <p className="text-sm font-semibold text-slate-900">{user?.phone || '+91 98765 43210'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Primary Category
                </span>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user?.category || 'Electrical Systems'}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Coverage Radius
                </span>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Within {user?.coverageRadius || '15'} km</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Verification Status
                </span>
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  {isVerified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Pending Audit</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Account Type
                </span>
                <p className="text-sm font-semibold text-slate-900">Professional Contractor</p>
              </div>
            </div>

            {/* Skills & Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Registered Trade Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {(user?.skills && user.skills.length > 0
                  ? user.skills
                  : ['Wiring Diagnostics', 'MCB Breakers', 'Load Balancing']
                ).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                  >
                    <Wrench className="w-3 h-3 text-emerald-600" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

