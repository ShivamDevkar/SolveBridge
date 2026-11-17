import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { validateCustomerProfile } from '@/lib/validation';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const CITY_OPTIONS = [
  { value: 'Pune', label: 'Pune, Maharashtra' },
  { value: 'Mumbai', label: 'Mumbai, Maharashtra' },
  { value: 'Bengaluru', label: 'Bengaluru, Karnataka' },
  { value: 'Delhi NCR', label: 'Delhi NCR (Delhi, Gurgaon, Noida)' },
  { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
  { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
  { value: 'Kolkata', label: 'Kolkata, West Bengal' },
  { value: 'Ahmedabad', label: 'Ahmedabad, Gujarat' },
];

export function CustomerProfilePage() {
  const { user, updateUserProfile, isLoading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    city: user?.city || 'Pune',
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form data whenever user state updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '+91 98765 43210',
        city: user.city || 'Pune',
      });
    }
  }, [user]);

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '+91 98765 43210',
        city: user.city || 'Pune',
      });
    }
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '+91 98765 43210',
        city: user.city || 'Pune',
      });
    }
    setFieldErrors({});
    setSubmitError(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving || authLoading) return;

    const validation = validateCustomerProfile({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
      });

      setSuccessMessage('Profile details updated successfully.');
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update profile. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.name || 'Customer User';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'CU';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your personal contact information and default marketplace preferences.
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

      {/* Profile Overview Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated overflow-hidden">
        <div className="h-2 bg-blue-600" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-xl font-bold shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                  {displayName}
                </CardTitle>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'customer@solvebid.demo'}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {isEditing ? (
          /* Edit Mode Form */
          <form onSubmit={handleSave} noValidate>
            <CardContent className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Sarthak Chavan"
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  error={fieldErrors.name}
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
                  label="Preferred Service City"
                  options={CITY_OPTIONS}
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: undefined });
                  }}
                  error={fieldErrors.city}
                  required
                  disabled={isSaving || authLoading}
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Primary Account Email
                  </label>
                  <div className="relative">
                    <Input
                      value={user?.email || ''}
                      disabled
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                      className="bg-slate-50 cursor-not-allowed opacity-80"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Immutable login identifier. Contact support to modify your credentials.
                  </p>
                </div>
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
                  Full Name
                </span>
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Sarthak Chavan'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Phone Number
                </span>
                <p className="text-sm font-semibold text-slate-900">{user?.phone || '+91 98765 43210'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Preferred Service City
                </span>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{user?.city || 'Pune'}</span>
                </p>
              </div>
            </div>

            {/* Account Safety Overview */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-950 block">Customer Account Security</span>
                <p className="text-[11px] text-blue-900/90 leading-relaxed">
                  Your customer profile is active and authorized to post problem requests, compare bids, and review service proposals. Passwords and credentials remain encrypted in memory and are never persisted to storage.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

