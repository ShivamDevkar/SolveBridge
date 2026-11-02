import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import { mockProposalAdapter } from '@/services/mockProposalAdapter';
import { matchingService, type MockProfessionalProfile } from '@/services/matchingService';
import { useAuth } from '@/context/AuthContext';
import type { Problem } from '@/types/problem';
import type { Proposal } from '@/types/proposal';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export function ProProblemInspectPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const { user } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [proProfile, setProProfile] = useState<MockProfessionalProfile | null>(null);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Proposal Builder Form State
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('1–2 hours');
  const [visitTime, setVisitTime] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [includedList, setIncludedList] = useState<string[]>([
    'On-site diagnostic inspection',
    'Component electrical testing',
  ]);
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [excludedList, setExcludedList] = useState<string[]>([
    'Major motor/PCB replacement parts',
  ]);
  const [newExcludedItem, setNewExcludedItem] = useState('');
  const [notes, setNotes] = useState<string>('30-day workmanship guarantee on diagnostic repairs.');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<Proposal | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!problemId) return;

      try {
        const proId = user?.id || 'user-demo-pro';
        const [prob, profile, proProps] = await Promise.all([
          mockProblemAdapter.getProblemById(problemId),
          matchingService.getProfessionalById(proId),
          mockProposalAdapter.getProposalsByProfessional(proId),
        ]);

        if (!isMounted) return;

        setProblem(prob);
        setProProfile(profile);

        const foundExisting = proProps.find((p) => p.problemId.toUpperCase() === problemId.toUpperCase());
        if (foundExisting) {
          setExistingProposal(foundExisting);
        } else if (prob) {
          // Pre-populate visit time suggestion
          setVisitTime(`Preferred: ${prob.preferredDate} (${prob.preferredTimeWindow})`);
          if (prob.budgetMin) {
            setPrice(String(prob.budgetMin));
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load problem inspection data:', err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [problemId, user]);

  const handleAddIncluded = () => {
    if (newIncludedItem.trim()) {
      setIncludedList([...includedList, newIncludedItem.trim()]);
      setNewIncludedItem('');
    }
  };

  const handleRemoveIncluded = (idx: number) => {
    setIncludedList(includedList.filter((_, i) => i !== idx));
  };

  const handleAddExcluded = () => {
    if (newExcludedItem.trim()) {
      setExcludedList([...excludedList, newExcludedItem.trim()]);
      setNewExcludedItem('');
    }
  };

  const handleRemoveExcluded = (idx: number) => {
    setExcludedList(excludedList.filter((_, i) => i !== idx));
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid quoted estimate (₹).');
      return;
    }
    if (!visitTime.trim()) {
      setFormError('Please specify your proposed visit time.');
      return;
    }
    if (!diagnosis.trim() || diagnosis.trim().length < 20) {
      setFormError('Please provide a descriptive initial diagnosis (at least 20 characters).');
      return;
    }
    if (includedList.length === 0) {
      setFormError('Please include at least one diagnostic or service item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const proId = user?.id || 'user-demo-pro';
      const proIdentity = {
        id: proId,
        name: proProfile?.name || user?.name || 'Professional User',
        businessName: proProfile?.businessName || user?.businessName || 'Pro Services',
        verified: proProfile?.verified ?? (user?.verificationStatus === 'VERIFIED'),
        averageRating: proProfile?.averageRating || 4.8,
        completedJobsCount: proProfile?.completedJobsCount || 20,
        experienceYears: proProfile?.experienceYears || 5,
      };

      const newProposal = await mockProposalAdapter.submitProposal(
        {
          problemId: problem!.id,
          estimatedPrice: numPrice,
          estimatedDuration: duration,
          proposedVisitTime: visitTime.trim(),
          initialDiagnosis: diagnosis.trim(),
          includedServices: includedList,
          excludedServices: excludedList,
          notes: notes.trim(),
        },
        proIdentity
      );

      setExistingProposal(newProposal);
      setSubmissionSuccess(newProposal);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading problem details and diagnostic specifications...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Problem Not Found</h2>
          <p className="text-xs text-slate-500">
            Could not locate problem #{problemId}. It may have been archived.
          </p>
        </div>
        <Link to="/pro/matching-problems">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Matching Feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/pro/matching-problems"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Matching Problems Feed
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Posted {new Date(problem.createdAt).toLocaleDateString()}
        </span>
      </div>

      {submissionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Proposal Successfully Submitted!</h4>
              <p className="text-emerald-800 mt-0.5">
                Your quote of ₹{submissionSuccess.estimatedPrice.toLocaleString()} has been sent to the customer for review.
              </p>
            </div>
          </div>
          <Link to="/pro/proposals">
            <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800 shrink-0">
              View Tracker
            </Button>
          </Link>
        </div>
      )}

      {/* Header Context Banner */}
      <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {problem.id}
                </span>
                <Badge variant="urgency" urgency={problem.urgency} />
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {problem.category}
                </span>
                {existingProposal && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Proposal Submitted
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{problem.title}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Customer: <strong className="text-slate-700">{problem.customerName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {problem.location.neighborhood}, {problem.location.city} (~{problem.location.distanceKm || 3.2} km)
                </span>
              </p>
            </div>

            {existingProposal && (
              <div className="shrink-0 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Your Submitted Quote</span>
                <span className="text-xl font-black text-emerald-900">₹{existingProposal.estimatedPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Problem Breakdown & Proposal Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Information (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Symptoms & Description */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Reported Symptoms & Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {problem.description}
              </p>

              {(problem.budgetMin || problem.budgetMax) && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Customer Budget Expectation
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{problem.budgetMin || '0'} – ₹{problem.budgetMax || 'Flexible'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attached Evidence Media */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                Customer Photos ({problem.mediaUrls?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {problem.mediaUrls && problem.mediaUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {problem.mediaUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer hover:border-blue-400"
                    >
                      <img
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Inspect
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No photos attached by customer.</p>
              )}
            </CardContent>
          </Card>

          {/* Location Privacy Safeguard */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Service Area & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Approximate Locality
                </span>
                <span className="font-bold text-slate-900">
                  {problem.location.neighborhood}, {problem.location.city}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Masked Landmark
                </span>
                <span className="text-slate-700 font-medium">
                  {problem.location.maskedAddress}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Safeguard:</strong> The customer&apos;s exact flat number and street are private and will be unlocked automatically inside your Job Workspace once your proposal is accepted.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Proposal Submission / Submitted View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {existingProposal ? (
            /* Existing Submitted Proposal Display */
            <Card className="bg-white border-emerald-300 shadow-elevated">
              <div className="p-5 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-emerald-950">
                    Your Proposal Has Been Submitted
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {existingProposal.id}
                </span>
              </div>

              <CardContent className="p-6 space-y-5 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quoted Price</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{existingProposal.estimatedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Arrival Time</span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">
                      {existingProposal.proposedVisitTime}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                    Your Initial Diagnostic Approach
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {existingProposal.initialDiagnosis}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                    Included Services
                  </span>
                  <ul className="space-y-1">
                    {existingProposal.includedServices.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {existingProposal.excludedServices?.length > 0 && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                      Excluded Items
                    </span>
                    <ul className="space-y-1">
                      {existingProposal.excludedServices.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-500">
                          <span className="text-red-400 font-bold shrink-0">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="text-slate-700">{existingProposal.status}</strong>
                  </span>
                  <Link to="/pro/proposals">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View in Proposals Tracker
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Proposal Builder Form */
            <Card className="bg-white border-slate-200 shadow-elevated">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Structured Proposal Builder
                </CardTitle>
                <p className="text-xs text-slate-500">
                  SolveBid eliminates low-ball bidding. Formulate a transparent diagnostic proposal with clear scope and arrival time.
                </p>
              </CardHeader>

              <CardContent className="p-6">
                {/* Unverified Pro Warning */}
                {proProfile && !proProfile.verified && (
                  <div className="p-3.5 mb-5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Verification Notice:</strong> Your contractor account is currently pending credential audit. You may draft proposals, but they will be labeled as unverified in the customer comparison matrix.
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitProposal} className="space-y-5 text-xs">
                  {/* Price & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Quoted Diagnostic Estimate (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 950"
                          min="100"
                          max="50000"
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-900"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Covers diagnosis and minor fixes</span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Estimated Service Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-800"
                      >
                        <option value="45 minutes">45 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="1–2 hours">1–2 hours</option>
                        <option value="2–3 hours">2–3 hours</option>
                        <option value="Half day">Half day (3–5 hours)</option>
                        <option value="Full day">Full day</option>
                      </select>
                    </div>
                  </div>

                  {/* Proposed Visit Time */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Proposed Arrival Time Window <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      placeholder="e.g. Today, 4:30 PM or Tomorrow, 10:00 AM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-slate-800"
                      required
                    />
                  </div>

                  {/* Initial Diagnostic Approach */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Initial Diagnostic Approach & Hypothesis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={3}
                      placeholder="Explain how you plan to test and diagnose the issue (e.g. Test capacitor capacitance, measure condenser gas pressure with manifold, inspect wiring terminals)..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Customers rely on diagnostic transparency rather than lowest price.
                    </span>
                  </div>

                  {/* Included Services Builder */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Included in this Quote <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIncludedItem}
                          onChange={(e) => setNewIncludedItem(e.target.value)}
                          placeholder="e.g. Capacitor testing, drain flush..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddIncluded();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddIncluded}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                      </div>

                      <div className="space-y-1">
                        {includedList.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {item}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveIncluded(idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Excluded Services Builder */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Excluded / Out of Scope Items
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExcludedItem}
                          onChange={(e) => setNewExcludedItem(e.target.value)}
                          placeholder="e.g. Major compressor replacement, parts above ₹500..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddExcluded();
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddExcluded}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                      </div>

                      <div className="space-y-1">
                        {excludedList.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="text-red-400 font-bold">•</span>
                              {item}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExcluded(idx)}
                              className="text-slate-400 hover:text-red-600 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Workmanship Warranty / Notes */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Workmanship Guarantee & Terms
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. 30-day workmanship warranty on repair"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="shadow-2xs"
                    >
                      Submit Structured Proposal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Problem Photo Inspection"
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImage}
                alt="Enlarged problem photo"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
