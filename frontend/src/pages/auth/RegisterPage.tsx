import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';
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
  CheckCircle2,
  ShieldCheck,
  Building2,
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
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const validateCustomer = () => {
    const errs: Record<string, string> = {};
    if (!customerForm.firstName.trim()) {
      errs.firstName = 'First name is required.';
    }
    if (!customerForm.lastName.trim()) {
      errs.lastName = 'Last name is required.';
    }
    if (!customerForm.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!validateEmail(customerForm.email)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!customerForm.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!validatePhone(customerForm.phone)) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!customerForm.password) {
      errs.password = 'Password is required.';
    } else if (customerForm.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }
    if (!customerForm.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (customerForm.password !== customerForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!customerForm.city) {
      errs.city = 'Please select your preferred service city.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePro = () => {
    const errs: Record<string, string> = {};
    if (!proForm.businessName.trim()) {
      errs.businessName = 'Business or professional name is required.';
    }
    if (!proForm.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!validateEmail(proForm.email)) {
      errs.email = 'Please enter a valid business email address.';
    }
    if (!proForm.phone.trim()) {
      errs.phone = 'Contact phone number is required.';
    } else if (!validatePhone(proForm.phone)) {
      errs.phone = 'Please enter a valid 10-digit contact number.';
    }
    if (!proForm.password) {
      errs.password = 'Password is required.';
    } else if (proForm.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }
    if (!proForm.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (proForm.password !== proForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!proForm.category) {
      errs.category = 'Please select a primary service category.';
    }
    if (proForm.skills.length === 0) {
      errs.skills = 'Please select or add at least one initial skill.';
    }
    if (!proForm.coverageRadius) {
      errs.coverageRadius = 'Please select your service coverage radius.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = accountType === 'CUSTOMER' ? validateCustomer() : validatePro();
    if (isValid) {
      setIsSubmitted(true);
    }
  };

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setErrors({});
  };

  const toggleSkill = (skill: string) => {
    setProForm((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
    if (errors.skills) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.skills;
        return copy;
      });
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = proForm.customSkill.trim();
    if (trimmed && !proForm.skills.includes(trimmed)) {
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
    }
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

      {isSubmitted ? (
        <CardContent className="space-y-5 py-4">
          <div className="p-6 text-center space-y-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {accountType === 'CUSTOMER' ? 'Customer Account Simulated' : 'Professional Registration Received'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {accountType === 'CUSTOMER'
                  ? `Welcome, ${customerForm.firstName}! In this local demo, account creation is simulated without backend persistence. You can now proceed to sign in and explore posting problems and comparing proposals.`
                  : `Thank you for registering ${proForm.businessName}! In this local demo, professional credentials will be evaluated through the administrator review process. You can proceed to sign in and explore incoming leads.`}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200/80 text-left text-xs space-y-1.5 shadow-2xs max-w-sm mx-auto">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Registration Summary
              </span>
              <div className="flex justify-between text-slate-600 pt-0.5 border-t border-slate-100">
                <span>Account Type:</span>
                <strong className="text-slate-900">
                  {accountType === 'CUSTOMER' ? 'Customer' : 'Service Professional'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <strong className="text-slate-900">
                  {accountType === 'CUSTOMER' ? customerForm.email : proForm.email}
                </strong>
              </div>
              {accountType === 'CUSTOMER' ? (
                <div className="flex justify-between text-slate-600">
                  <span>Service City:</span>
                  <strong className="text-slate-900">{customerForm.city}</strong>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>Primary Domain:</span>
                  <strong className="text-slate-900">{proForm.category}</strong>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2 max-w-sm mx-auto">
              <Link to="/auth/login" className="w-full">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Sign In
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                ← Back to registration form
              </button>
            </div>
          </div>
        </CardContent>
      ) : (
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
                      if (errors.firstName) setErrors({ ...errors, firstName: '' });
                    }}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Kulkarni"
                    value={customerForm.lastName}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: '' });
                    }}
                    error={errors.lastName}
                    required
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
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  error={errors.email}
                  required
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
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    error={errors.phone}
                    required
                  />
                  <Select
                    label="Preferred Service City"
                    options={CITY_OPTIONS}
                    value={customerForm.city}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    error={errors.city}
                    required
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
                        className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={customerForm.password}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    error={errors.password}
                    required
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
                        className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={customerForm.confirmPassword}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. Professional Form Variant */}
            {accountType === 'PROFESSIONAL' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                {/* Administrator Credential Notice */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block">Credential Verification Process</span>
                    <p className="text-[11px] text-blue-800/90 leading-relaxed">
                      Professional accounts undergo platform administrator review before receiving verified badges and proposal privileges.
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
                    if (errors.businessName) setErrors({ ...errors, businessName: '' });
                  }}
                  error={errors.businessName}
                  required
                />

                {/* Business Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Business Email"
                    type="email"
                    placeholder="pro@service.in"
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={proForm.email}
                    onChange={(e) => {
                      setProForm({ ...proForm, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Contact Phone Number"
                    type="tel"
                    placeholder="+91 98220 12345"
                    leftIcon={<Phone className="w-4 h-4" />}
                    value={proForm.phone}
                    onChange={(e) => {
                      setProForm({ ...proForm, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    error={errors.phone}
                    required
                  />
                </div>

                {/* Category and Service Coverage Radius */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Primary Service Category"
                    options={CATEGORY_OPTIONS}
                    value={proForm.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setProForm({
                        ...proForm,
                        category: newCategory,
                        skills: SKILLS_BY_CATEGORY[newCategory] ? [SKILLS_BY_CATEGORY[newCategory][0]] : [],
                      });
                      if (errors.category) setErrors({ ...errors, category: '' });
                    }}
                    error={errors.category}
                    required
                  />
                  <Select
                    label="Service Coverage Radius"
                    options={RADIUS_OPTIONS}
                    value={proForm.coverageRadius}
                    onChange={(e) => {
                      setProForm({ ...proForm, coverageRadius: e.target.value });
                      if (errors.coverageRadius) setErrors({ ...errors, coverageRadius: '' });
                    }}
                    error={errors.coverageRadius}
                    required
                  />
                </div>

                {/* Initial Skills Multi-Select Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide">
                      Initial Skills & Services <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Click to add/remove</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkills.map((skill) => {
                      const isSelected = proForm.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddCustomSkill}
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
                        className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={proForm.password}
                    onChange={(e) => {
                      setProForm({ ...proForm, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    error={errors.password}
                    required
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
                        className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-hidden p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={proForm.confirmPassword}
                    onChange={(e) => {
                      setProForm({ ...proForm, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    error={errors.confirmPassword}
                    required
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
      )}
    </Card>
  );
}

export function ForgotPasswordPage() {
  return (
    <PlaceholderPage
      title="Reset Your Password"
      route="/auth/forgot-password"
      portal="Authentication"
      phase="Phase 02 (Authentication - Tier 2)"
      description="Self-service password recovery flow sending a simulated password reset email token."
      backTo={{ label: 'Back to Sign In', path: '/auth/login' }}
    />
  );
}

export function ResetPasswordPage() {
  return (
    <PlaceholderPage
      title="Set New Password"
      route="/auth/reset-password"
      portal="Authentication"
      phase="Phase 02 (Authentication - Tier 2)"
      description="Password reset submission form with validation for length and complexity."
      backTo={{ label: 'Back to Sign In', path: '/auth/login' }}
    />
  );
}
