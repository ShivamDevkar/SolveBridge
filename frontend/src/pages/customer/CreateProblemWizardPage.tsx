import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dropzone, UploadedFile } from '@/components/ui/Dropzone';
import { useAuth } from '@/context/AuthContext';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import {
  validateProblemStep1,
  validateProblemStep3,
  validateProblemStep4,
} from '@/lib/validation';
import { UrgencyLevel } from '@/types/common';
import {
  FileText,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  AlertCircle,
  HelpCircle,
  Eye,
  Sparkles,
  Check,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'General Diagnosis', label: 'Let SolveBid match automatically (Recommended)' },
  { value: 'Home Appliances & HVAC', label: 'Home Appliances & HVAC' },
  { value: 'Plumbing & Water Systems', label: 'Plumbing & Water Systems' },
  { value: 'Electrical Systems', label: 'Electrical Systems' },
  { value: 'Vehicle & Roadside Breakdown', label: 'Vehicle & Roadside Breakdown' },
  { value: 'Tech Hardware & Networking', label: 'Tech Hardware & Networking' },
  { value: 'Commercial Facility Maintenance', label: 'Commercial Facility Maintenance' },
];

const CITY_OPTIONS = [
  { value: 'Pune', label: 'Pune, Maharashtra' },
  { value: 'Mumbai', label: 'Mumbai, Maharashtra' },
  { value: 'Bengaluru', label: 'Bengaluru, Karnataka' },
  { value: 'Delhi NCR', label: 'Delhi NCR' },
  { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
  { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
  { value: 'Kolkata', label: 'Kolkata, West Bengal' },
  { value: 'Ahmedabad', label: 'Ahmedabad, Gujarat' },
];

const TIME_WINDOWS = [
  { value: 'Morning (08:00 AM - 12:00 PM)', label: 'Morning (08:00 AM - 12:00 PM)' },
  { value: 'Afternoon (12:00 PM - 04:00 PM)', label: 'Afternoon (12:00 PM - 04:00 PM)' },
  { value: 'Evening (04:00 PM - 08:00 PM)', label: 'Evening (04:00 PM - 08:00 PM)' },
  { value: 'Any time / Flexible', label: 'Any time / Flexible' },
];

// Calculate tomorrow's date formatted as YYYY-MM-DD for date input default & min
const todayIso = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const tomorrowIso = tomorrow.toISOString().split('T')[0];

export function CreateProblemWizardPage() {
  const { user } = useAuth();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProblemId, setCreatedProblemId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Problem Description
    title: '',
    description: '',
    category: 'General Diagnosis',
    // Step 2: Evidence Files
    uploadedFiles: [] as UploadedFile[],
    // Step 3: Approximate Location
    city: user?.city || 'Pune',
    neighborhood: '',
    landmark: '',
    // Step 4: Urgency & Timing
    urgency: 'SOON' as UrgencyLevel,
    preferredDate: tomorrowIso,
    preferredTimeWindow: 'Morning (08:00 AM - 12:00 PM)',
    budgetMin: '',
    budgetMax: '',
  });

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // -------------------------------------------------------------------------
  // STEP VALIDATION HANDLERS
  // -------------------------------------------------------------------------
  const handleNextStep = () => {
    setSubmitError(null);

    if (currentStep === 1) {
      const v = validateProblemStep1({
        title: formData.title,
        description: formData.description,
      });
      if (!v.isValid) {
        setErrors(v.errors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Evidence is optional
      setErrors({});
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const v = validateProblemStep3({
        city: formData.city,
        neighborhood: formData.neighborhood,
      });
      if (!v.isValid) {
        setErrors(v.errors);
        return;
      }
      setErrors({});
      setCurrentStep(4);
    } else if (currentStep === 4) {
      const v = validateProblemStep4({
        urgency: formData.urgency,
        preferredDate: formData.preferredDate,
        preferredTimeWindow: formData.preferredTimeWindow,
      });
      if (!v.isValid) {
        setErrors(v.errors);
        return;
      }
      setErrors({});
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setSubmitError(null);
      setErrors({});
      setCurrentStep(stepNumber);
    }
  };

  // -------------------------------------------------------------------------
  // FINAL SUBMISSION
  // -------------------------------------------------------------------------
  const handleSubmitProblem = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert uploaded file previews or generate mock media URLs
      const mediaUrls = formData.uploadedFiles
        .map((f) => f.previewUrl)
        .filter((url): url is string => Boolean(url));

      const customerId = user?.id || 'user-demo-customer';
      const customerName = user?.name || 'Customer User';

      const created = await mockProblemAdapter.createProblem(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          city: formData.city,
          neighborhood: formData.neighborhood,
          landmark: formData.landmark || undefined,
          urgency: formData.urgency,
          preferredDate: formData.preferredDate,
          preferredTimeWindow: formData.preferredTimeWindow,
          budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
          mediaUrls,
        },
        customerId,
        customerName
      );

      setCreatedProblemId(created.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to publish problem request. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // SUCCESS / CONFIRMATION SCREEN
  // -------------------------------------------------------------------------
  if (createdProblemId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="bg-white border-emerald-200 shadow-elevated overflow-hidden text-center">
          <div className="h-2 bg-emerald-600" />
          <CardContent className="p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Problem Published Successfully
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Request #{createdProblemId} is Live
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your problem request has been entered into the SolveBid matching engine. Nearby qualified professionals in{' '}
                <strong className="text-slate-900 font-semibold">{formData.city}</strong> will inspect your symptoms.
              </p>
            </div>

            {/* Structured Receipt Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Problem Title:</span>
                <span className="text-slate-900 font-semibold truncate max-w-[240px]">{formData.title}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Service Area:</span>
                <span className="text-slate-900 font-medium">
                  {formData.neighborhood}, {formData.city}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Urgency:</span>
                <Badge variant="urgency" urgency={formData.urgency} />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Service Window:</span>
                <span className="text-slate-900 font-medium">
                  {formData.preferredDate} • {formData.preferredTimeWindow}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-left text-xs text-blue-900 flex items-start gap-2.5 max-w-lg mx-auto">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-blue-950">What happens next?</span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Professionals will submit transparent, multi-factor proposals. You can compare proposals side-by-side on price, arrival time, and diagnostic approach before selecting.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to={`/customer/problems/${createdProblemId}`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  View Problem Details
                </Button>
              </Link>
              <Link to="/customer/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // WIZARD STEP HEADER
  // -------------------------------------------------------------------------
  const STEPS = [
    { num: 1, title: 'Describe', icon: FileText },
    { num: 2, title: 'Evidence', icon: Camera },
    { num: 3, title: 'Location', icon: MapPin },
    { num: 4, title: 'Urgency', icon: Clock },
    { num: 5, title: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Post a Problem Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            5-step symptom-first guided wizard. Describe what is broken; verified contractors will diagnose and bid.
          </p>
        </div>
        <Link
          to="/customer/dashboard"
          className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
        >
          Cancel & Exit
        </Link>
      </div>

      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            const StepIcon = s.icon;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleJumpToStep(s.num)}
                disabled={s.num > currentStep}
                className={`flex flex-col items-center text-center gap-1.5 transition-all p-1 rounded-lg ${
                  isCurrent
                    ? 'text-blue-700'
                    : isCompleted
                    ? 'text-emerald-700 cursor-pointer hover:bg-slate-50'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span className="text-[11px] font-semibold hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Container Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated overflow-hidden">
        <div className="h-1.5 bg-blue-600" />

        {submitError && (
          <div
            role="alert"
            className="p-3.5 mx-6 mt-6 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-950">
                Submission Error
              </span>
              <p className="text-red-800 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 1: DESCRIBE THE PROBLEM                                      */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 1 — Describe Symptoms & Issue
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Focus on symptoms you observe. Technical jargon is not required.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Helpful Tips:</strong> Mention what sounds, leaks, smells, or visual clues you noticed (e.g., &ldquo;Blinking error code E20&rdquo;, &ldquo;Pungent burning odor&rdquo;, or &ldquo;Trips when both oven and geyser run together&rdquo;).
                </p>
              </div>

              <Input
                label="Problem Summary / Title"
                placeholder="e.g. AC turns on and blows air but does not cool the room"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                error={errors.title}
                required
                helperText="A clear headline describing what is broken (5–100 characters)."
              />

              <Textarea
                label="Detailed Symptom Description"
                placeholder="Describe what happens when the issue occurs. Did it happen suddenly? Is there any visible damage, leaking water, strange noises, or burnt smell? How long has it been happening?"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                error={errors.description}
                required
                maxChars={1000}
                rows={5}
                helperText="Provide at least 20 characters so contractors can prepare proper diagnostic tools."
              />

              <Select
                label="Service Category (Optional)"
                options={CATEGORY_OPTIONS}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                helperText="If unsure, leave as automatic. SolveBid matches problem symptoms with verified contractor trade tags."
              />
            </CardContent>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 2: UPLOAD EVIDENCE                                           */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 2 — Attach Evidence & Media (Optional)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Photos of the issue help professionals assess spare parts and deliver accurate quotes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <Dropzone
                label="Drag & Drop Photos of the Problem"
                helperText="Supports JPG, PNG, or WEBP up to 10MB per file (max 5 photos)."
                accept={['image/jpeg', 'image/png', 'image/webp']}
                maxFiles={5}
                files={formData.uploadedFiles}
                onFilesChange={(newFiles) => setFormData({ ...formData, uploadedFiles: newFiles })}
              />

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Recommended Photos:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500">
                  <li>Wide shot showing the equipment / installation in its room.</li>
                  <li>Close-up shot of the specific leaking valve, burned socket, or broken component.</li>
                  <li>Manufacturer label or model number sticker if accessible.</li>
                </ul>
              </div>
            </CardContent>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 3: APPROXIMATE LOCATION                                      */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 3 — Approximate Service Location
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Specify where the work is needed. Your exact address remains masked and private.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Privacy Banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/90 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-950 block">Customer Address Privacy Guarantee</span>
                  <p className="text-[11px] text-blue-900/90 leading-relaxed">
                    SolveBid protects your privacy. During discovery and proposal bidding, professionals only see your general neighborhood and city. Your complete street address and contact phone number are only revealed once you formally select a proposal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Service City"
                  options={CITY_OPTIONS}
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (errors.city) setErrors({ ...errors, city: undefined });
                  }}
                  error={errors.city}
                  required
                />

                <Input
                  label="Neighborhood / Locality"
                  placeholder="e.g. Kothrud, Baner, Indiranagar, Andheri"
                  value={formData.neighborhood}
                  onChange={(e) => {
                    setFormData({ ...formData, neighborhood: e.target.value });
                    if (errors.neighborhood) setErrors({ ...errors, neighborhood: undefined });
                  }}
                  error={errors.neighborhood}
                  required
                  helperText="Area or sector name used to match nearby professionals."
                />
              </div>

              <Input
                label="Prominent Landmark / Area Hint (Optional)"
                placeholder="e.g. Near Karve Statue, Opposite Metro Station, Behind D-Mart"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                helperText="Helps calculate accurate travel dispatch distance without revealing your private flat number."
              />
            </CardContent>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 4: URGENCY & TIMING                                          */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 4 — Urgency & Preferred Window
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Select how quickly you require diagnostic assistance and preferred arrival timing.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Urgency Selector Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  How urgent is this repair? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Normal */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFormData({ ...formData, urgency: 'NORMAL' })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({ ...formData, urgency: 'NORMAL' });
                      }
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.urgency === 'NORMAL'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">NORMAL</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 block mt-1">
                      Flexible (3–5 Days)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Standard diagnostic rates. Gives contractors time to submit competitive quotes.
                    </p>
                  </div>

                  {/* Soon */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFormData({ ...formData, urgency: 'SOON' })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({ ...formData, urgency: 'SOON' });
                      }
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.urgency === 'SOON'
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">SOON</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 block mt-1">
                      Priority (24–48 Hours)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      High priority dispatch. Contractors receive notifications to bid promptly.
                    </p>
                  </div>

                  {/* Urgent */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFormData({ ...formData, urgency: 'URGENT' })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({ ...formData, urgency: 'URGENT' });
                      }
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.urgency === 'URGENT'
                        ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-950 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-red-600" /> URGENT
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-red-800 block mt-1">
                      Emergency (Today / ASAP)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Instant alerts broadcasted to on-duty contractors in your immediate radius.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Preferred Service Date"
                  min={todayIso}
                  value={formData.preferredDate}
                  onChange={(e) => {
                    setFormData({ ...formData, preferredDate: e.target.value });
                    if (errors.preferredDate) setErrors({ ...errors, preferredDate: undefined });
                  }}
                  error={errors.preferredDate}
                  required
                />

                <Select
                  label="Preferred Arrival Window"
                  options={TIME_WINDOWS}
                  value={formData.preferredTimeWindow}
                  onChange={(e) => {
                    setFormData({ ...formData, preferredTimeWindow: e.target.value });
                    if (errors.preferredTimeWindow) setErrors({ ...errors, preferredTimeWindow: undefined });
                  }}
                  error={errors.preferredTimeWindow}
                  required
                />
              </div>

              {/* Optional Budget Guidance */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Expected Budget Range (Optional ₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min ₹ (e.g. 500)"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max ₹ (e.g. 2000)"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Optional. Contractors will submit itemized quotes with parts, labor, and arrival estimates.
                </p>
              </div>
            </CardContent>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 5: REVIEW & CONFIRMATION                                     */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 5 && (
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Step 5 — Review & Publish Request
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Verify your problem details before publishing into the marketplace matching queue.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Review Section 1: Problem Overview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Problem Summary & Symptoms
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Edit Step 1
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{formData.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {formData.description}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Category:</span>
                  <span className="text-[11px] font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {formData.category}
                  </span>
                </div>
              </div>

              {/* Review Section 2: Uploaded Evidence */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Supporting Photos ({formData.uploadedFiles.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Edit Step 2
                  </button>
                </div>
                {formData.uploadedFiles.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {formData.uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center gap-2"
                      >
                        {file.previewUrl && (
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="w-8 h-8 rounded object-cover border border-slate-100"
                          />
                        )}
                        <span className="text-[10px] font-medium text-slate-700 truncate">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No photos attached (optional).</p>
                )}
              </div>

              {/* Review Section 3: Location */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Location & Privacy
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Edit Step 3
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      City & Area
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formData.neighborhood}, {formData.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Contractor Masked Address
                    </span>
                    <span className="text-slate-700 font-medium">
                      {formData.landmark ? `Near ${formData.landmark}, ` : ''}
                      {formData.neighborhood}, {formData.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Section 4: Urgency & Timing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Urgency & Timing
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Edit Step 4
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Urgency
                    </span>
                    <Badge variant="urgency" urgency={formData.urgency} />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Target Date
                    </span>
                    <span className="font-semibold text-slate-900">{formData.preferredDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Arrival Window
                    </span>
                    <span className="font-medium text-slate-800">{formData.preferredTimeWindow}</span>
                  </div>
                </div>
              </div>

              {/* Prototype Matching Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  <strong>Marketplace Prototype:</strong> Submitting will record this problem in your account session and simulate the dispatch process. No real credit card or payment transaction occurs at this stage.
                </p>
              </div>
            </CardContent>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* WIZARD ACTIONS FOOTER                                             */}
        {/* ----------------------------------------------------------------- */}
        <CardFooter className="flex items-center justify-between p-4 bg-slate-50/70 border-t border-slate-100">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmitProblem}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Publish Problem Request
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
