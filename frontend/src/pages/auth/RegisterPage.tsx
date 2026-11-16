import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { validateCustomerFields, validateProfessionalFields } from '@/lib/validation';
import {
  User,
  Briefcase,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  ShieldCheck,
  Building2,
  AlertCircle,
  X,
} from 'lucide-react';

type AccountType = 'CUSTOMER' | 'PROFESSIONAL';

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

const CATEGORY_OPTIONS = [
  { value: 'Home Appliances & HVAC', label: 'Home Appliances & HVAC' },
  { value: 'Plumbing & Water Systems', label: 'Plumbing & Water Systems' },
  { value: 'Electrical Systems', label: 'Electrical Systems' },
  { value: 'Vehicle & Roadside Breakdown', label: 'Vehicle & Roadside Breakdown' },
  { value: 'Tech Hardware & Networking', label: 'Tech Hardware & Networking' },
  { value: 'Commercial Facility Maintenance', label: 'Commercial Facility Maintenance' },
];

const RADIUS_OPTIONS = [
  { value: '5', label: 'Within 5 km (Hyper-local neighborhood)' },
  { value: '10', label: 'Within 10 km (Standard service area)' },
  { value: '15', label: 'Within 15 km (Extended coverage)' },
  { value: '25', label: 'Within 25 km (Greater metropolitan)' },
];

const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'Home Appliances & HVAC': [
    'AC Gas Refill & Cooling',
    'Condenser Coil Cleaning',
    'Compressor Diagnostics',
    'Washing Machine Motor',
    'Refrigerator Cooling',
  ],
  'Plumbing & Water Systems': [
    'P-Trap Leak Repair',
    'Drain Snaking & Clearing',
    'Silicone Washer Replacement',
    'Water Heater Diagnostics',
    'Bathroom Pipe Fitting',
  ],
  'Electrical Systems': [
    'MCB Breaker Tripping',
    'Wiring Fault Detection',
    'Neutral Bonding Inspection',
    'Earth Resistance Test',
    'Switchboard Replacement',
  ],
  'Vehicle & Roadside Breakdown': [
    'Battery Jumpstart Assistance',
    'Tubeless Puncture Repair',
    'Brake Fluid Top-Up',
    'Engine Thermal Check',
    'Alternator Output Test',
  ],
  'Tech Hardware & Networking': [
    'Laptop Display Replacement',
    'Home WiFi Mesh Configuration',
    'Thermal Paste Application',
    'CCTV Camera Offline Repair',
    'Router Bandwidth Tuning',
  ],
  'Commercial Facility Maintenance': [
    'Commercial Freezer Overhaul',
    'Office Lighting & Troffers',
    'Industrial HVAC Chiller',
    'Backup Generator Service',
    'Exhaust Ventilation Fans',
  ],
};

export function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { registerCustomer, registerProfessional, isAuthenticated, role: userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect already authenticated users away from register to their role dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading && userRole) {
      const defaultDashboard =
        userRole === 'CUSTOMER'
          ? '/customer/dashboard'
          : userRole === 'PROFESSIONAL'
          ? '/pro/dashboard'
          : '/admin/dashboard';
      navigate(defaultDashboard, { replace: true });
    }
  }, [isAuthenticated, authLoading, userRole, navigate]);

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Pune',
  });

  // Professional Form State
  const [proForm, setProForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    category: 'Home Appliances & HVAC',
    skills: ['AC Gas Refill & Cooling', 'Compressor Diagnostics'],
    customSkill: '',
    coverageRadius: '10',
  });

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === 'CUSTOMER') {
      if (isSubmitting || authLoading) return;

      const validation = validateCustomerFields({
        firstName: customerForm.firstName,
        lastName: customerForm.lastName,
        email: customerForm.email,
        phone: customerForm.phone,
        password: customerForm.password,
        confirmPassword: customerForm.confirmPassword,
        city: customerForm.city,
      });

      if (!validation.isValid) {
        setErrors(validation.errors as Record<string, string>);
        return;
      }

      setErrors({});
      setAuthError(null);
      setIsSubmitting(true);

      try {
        await registerCustomer({
          firstName: customerForm.firstName,
          lastName: customerForm.lastName,
          email: customerForm.email,
          phone: customerForm.phone,
          password: customerForm.password,
          city: customerForm.city,
        });

        // Redirect newly registered customer directly to the Customer Dashboard
        navigate('/customer/dashboard', {
          replace: true,
          state: {
            welcomeMessage: `Welcome to SolveBid, ${customerForm.firstName.trim()}! Your customer account has been created.`,
          },
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to complete registration. Please check your details and try again.';
        setAuthError(message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Professional registration flow
      if (isSubmitting || authLoading) return;

      const validation = validateProfessionalFields({
        businessName: proForm.businessName,
        email: proForm.email,
        phone: proForm.phone,
        password: proForm.password,
        confirmPassword: proForm.confirmPassword,
        category: proForm.category,
        skills: proForm.skills,
        coverageRadius: proForm.coverageRadius,
      });

      if (!validation.isValid) {
        setErrors(validation.errors as Record<string, string>);
        return;
      }

      setErrors({});
      setAuthError(null);
      setIsSubmitting(true);

      try {
        await registerProfessional({
          businessName: proForm.businessName,
          email: proForm.email,
          phone: proForm.phone,
          password: proForm.password,
          category: proForm.category,
          skills: proForm.skills,
          coverageRadius: proForm.coverageRadius,
        });

        // Redirect newly registered professional directly to the dedicated Onboarding Briefing page
        navigate('/pro/onboarding', {
          replace: true,
          state: {
            businessName: proForm.businessName.trim(),
            newProEmail: proForm.email.trim(),
            category: proForm.category,
          },
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to complete professional registration. Please check your details and try again.';
        setAuthError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
    setAuthError(null);
  };

  const toggleSkill = (skill: string) => {
    const targetLower = skill.trim().toLowerCase();
    setProForm((prev) => {
      const exists = prev.skills.some((s) => s.trim().toLowerCase() === targetLower);
      const updated = exists
        ? prev.skills.filter((s) => s.trim().toLowerCase() !== targetLower)
        : [...prev.skills, skill.trim()];
      return { ...prev, skills: updated };
    });
    if (errors.skills) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.skills;
        return copy;
      });
    }
    if (authError) setAuthError(null);
  };

  const handleAddCustomSkill = () => {
    const trimmed = proForm.customSkill.trim();
    if (!trimmed) return;

    const isDuplicate = proForm.skills.some(
      (s) => s.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setErrors((prev) => ({
        ...prev,
        skills: `The skill "${trimmed}" is already included.`,
      }));
      return;
    }

    setProForm((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
      customSkill: '',
    }));

    if (errors.skills) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.skills;
        return copy;
      });
    }
    if (authError) setAuthError(null);
  };

  const suggestedSkills = SKILLS_BY_CATEGORY[proForm.category] || [];

  return (
    <Card className="bg-white border-slate-200/90 shadow-elevated">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-slate-900 font-bold">
          Create Your SolveBid Account
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs sm:text-sm">
          Join SolveBid to post problem requests or provide verified professional services.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-5">
          {/* 1. Account-Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Choose Account Type <span className="text-red-500">*</span>
            </label>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Account Type Selection"
            >
              {/* Customer Option */}
              <button
                type="button"
                role="radio"
                aria-checked={accountType === 'CUSTOMER'}
                onClick={() => handleAccountTypeChange('CUSTOMER')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  accountType === 'CUSTOMER'
                    ? 'border-2 border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      accountType === 'CUSTOMER'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`font-bold text-sm ${
                          accountType === 'CUSTOMER' ? 'text-blue-900' : 'text-slate-900'
                        }`}
                      >
                        Customer
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          accountType === 'CUSTOMER'
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {accountType === 'CUSTOMER' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Find professionals, describe problems, and compare proposals.
                    </p>
                  </div>
                </div>
              </button>

              {/* Professional Option */}
              <button
                type="button"
                role="radio"
                aria-checked={accountType === 'PROFESSIONAL'}
                onClick={() => handleAccountTypeChange('PROFESSIONAL')}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  accountType === 'PROFESSIONAL'
                    ? 'border-2 border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      accountType === 'PROFESSIONAL'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`font-bold text-sm ${
                          accountType === 'PROFESSIONAL' ? 'text-amber-950' : 'text-slate-900'
                        }`}
                      >
                        Professional
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          accountType === 'PROFESSIONAL'
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {accountType === 'PROFESSIONAL' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Offer services, receive matching leads, and submit proposals.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Registration Error Banner */}
          {authError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900">
                  Registration Failed
                </span>
                <p className="text-red-700 mt-0.5 leading-relaxed">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                aria-label="Dismiss error notification"
                className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Customer Form Variant */}
          {accountType === 'CUSTOMER' && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              {/* First and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="e.g. Sarthak"
                  value={customerForm.firstName}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, firstName: e.target.value });
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.firstName}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Input
                  label="Last Name"
                  placeholder="e.g. Kulkarni"
                  value={customerForm.lastName}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, lastName: e.target.value });
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.lastName}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>

              {/* Email Address */}
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={customerForm.email}
                onChange={(e) => {
                  setCustomerForm({ ...customerForm, email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  if (authError) setAuthError(null);
                }}
                error={errors.email}
                required
                disabled={isSubmitting || authLoading}
              />

              {/* Phone Number and Preferred City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={customerForm.phone}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.phone}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Select
                  label="Preferred Service City"
                  options={CITY_OPTIONS}
                  value={customerForm.city}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, city: e.target.value });
                    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.city}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={customerForm.password}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, password: e.target.value });
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.password}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                      tabIndex={0}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={customerForm.confirmPassword}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.confirmPassword}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>
          )}

          {/* 3. Professional Form Variant */}
          {accountType === 'PROFESSIONAL' && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              {/* Administrator Credential Notice */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-amber-950">Credential Verification Process</span>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Newly registered professional accounts receive an <strong>UNVERIFIED</strong> status until business credentials and identity documents are reviewed by the SolveBid administration team.
                  </p>
                </div>
              </div>

              {/* Business / Trading Name */}
              <Input
                label="Business or Professional Name"
                placeholder="e.g. Arun HVAC Services"
                leftIcon={<Building2 className="w-4 h-4" />}
                value={proForm.businessName}
                onChange={(e) => {
                  setProForm({ ...proForm, businessName: e.target.value });
                  if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }));
                  if (authError) setAuthError(null);
                }}
                error={errors.businessName}
                required
                disabled={isSubmitting || authLoading}
              />

              {/* Contact Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Business Email"
                  type="email"
                  placeholder="pro@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={proForm.email}
                  onChange={(e) => {
                    setProForm({ ...proForm, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.email}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Input
                  label="Contact Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={proForm.phone}
                  onChange={(e) => {
                    setProForm({ ...proForm, phone: e.target.value });
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.phone}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>

              {/* Category and Service Radius */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Primary Service Category"
                  options={CATEGORY_OPTIONS}
                  value={proForm.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setProForm({
                      ...proForm,
                      category: newCat,
                      skills: SKILLS_BY_CATEGORY[newCat]?.slice(0, 2) || [],
                    });
                    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    if (errors.skills) setErrors((prev) => ({ ...prev, skills: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.category}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Select
                  label="Service Coverage Radius"
                  options={RADIUS_OPTIONS}
                  value={proForm.coverageRadius}
                  onChange={(e) => {
                    setProForm({ ...proForm, coverageRadius: e.target.value });
                    if (errors.coverageRadius) setErrors((prev) => ({ ...prev, coverageRadius: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.coverageRadius}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>

              {/* Skills Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Trade Skills & Expertise <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Select your core technical competencies within this category:
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {suggestedSkills.map((skill) => {
                    const isSelected = proForm.skills.some(
                      (s) => s.trim().toLowerCase() === skill.trim().toLowerCase()
                    );
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        disabled={isSubmitting || authLoading}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add another specific skill..."
                    value={proForm.customSkill}
                    onChange={(e) => setProForm({ ...proForm, customSkill: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    disabled={isSubmitting || authLoading}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomSkill}
                    disabled={isSubmitting || authLoading}
                    className="text-xs"
                  >
                    Add
                  </Button>
                </div>

                {errors.skills && (
                  <p className="text-xs text-red-600 mt-1">{errors.skills}</p>
                )}
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={proForm.password}
                  onChange={(e) => {
                    setProForm({ ...proForm, password: e.target.value });
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.password}
                  required
                  disabled={isSubmitting || authLoading}
                />
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                      className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5 cursor-pointer"
                      tabIndex={0}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  value={proForm.confirmPassword}
                  onChange={(e) => {
                    setProForm({ ...proForm, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    if (authError) setAuthError(null);
                  }}
                  error={errors.confirmPassword}
                  required
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-2">
          {/* Primary Submit Button */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting || authLoading}
            disabled={isSubmitting || authLoading}
            className={`w-full font-bold shadow-sm transition-all ${
              accountType === 'CUSTOMER'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {accountType === 'CUSTOMER' ? 'Create Customer Account' : 'Create Professional Account'}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export { ForgotPasswordPage } from './ForgotPasswordPage';
export { ResetPasswordPage } from './ResetPasswordPage';
