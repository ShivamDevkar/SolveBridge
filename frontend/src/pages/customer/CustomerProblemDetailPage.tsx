import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import type { Problem, ProblemStatus } from '@/types/problem';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export function CustomerProblemDetailPage() {
  const { problemId } = useParams<{ problemId: string }>();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProblem() {
      if (!problemId) return;

      try {
        const found = await mockProblemAdapter.getProblemById(problemId);
        if (isMounted) {
          setProblem(found);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load problem:', err);
          setIsLoading(false);
        }
      }
    }

    loadProblem();

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading problem request details...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Problem Request Not Found</h2>
          <p className="text-xs text-slate-500">
            Could not locate problem with ID #{problemId}. It may have been archived or removed.
          </p>
        </div>
        <Link to="/customer/problems">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Problems Directory
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Open for Proposals
          </span>
        );
      case 'PROPOSALS_RECEIVED':
        return (
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Comparing Proposals
          </span>
        );
      case 'PROFESSIONAL_SELECTED':
        return (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Professional Selected
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/problems"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Problems Directory
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Created {new Date(problem.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Main Header Card */}
      <Card className="bg-white border-slate-200/90 shadow-elevated overflow-hidden">
        <div className="h-2 bg-blue-600" />
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {problem.id}
                </span>
                <Badge variant="urgency" urgency={problem.urgency} />
                {getStatusBadge(problem.status)}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {problem.title}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-slate-700">{problem.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {problem.location.neighborhood}, {problem.location.city}
                </span>
              </p>
            </div>

            {problem.proposalsCount > 0 && (
              <Link to={`/customer/problems/${problem.id}/compare`} className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-2xs"
                >
                  Compare Proposals ({problem.proposalsCount})
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Two Column Layout: Main Details & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Symptoms */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Problem Symptoms & Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {problem.description}
              </p>
            </CardContent>
          </Card>

          {/* Evidence Media Gallery */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Attached Evidence & Photos ({problem.mediaUrls?.length || 0})
                </CardTitle>
                <span className="text-[11px] text-slate-400">Click photo to zoom</span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {problem.mediaUrls && problem.mediaUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {problem.mediaUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <img
                        src={url}
                        alt={`Evidence photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        View Photo
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Camera className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                  <p className="text-xs">No photos attached with this request.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matching Engine Activity Banner */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                SolveBid Matching Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {problem.status === 'PROFESSIONAL_SELECTED' ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-950 block">
                      Professional Selected — Job Workspace Active
                    </span>
                    <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                      You have accepted a quote and confirmed a verified contractor for this service request.
                      Your private street address has been shared, and job execution is underway.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-950 block">
                      {problem.proposalsCount > 0
                        ? `${problem.proposalsCount} Transparent Proposals Ready for Comparison`
                        : 'Matching Engine Scanning Area'}
                    </span>
                    <p className="text-[11px] text-purple-900/90 leading-relaxed">
                      {problem.proposalsCount > 0
                        ? 'Local verified contractors have reviewed your symptom report and submitted structured estimates covering diagnostic approach, arrival time, and price.'
                        : 'Your problem request is actively visible to verified professionals in your coverage radius. Proposals will appear here shortly.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {problem.status === 'PROFESSIONAL_SELECTED' && (
                  <Link to={`/jobs/JOB-${problem.id.replace('PB-', '')}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Open Job Workspace
                    </Button>
                  </Link>
                )}
                {problem.proposalsCount > 0 && (
                  <Link to={`/customer/problems/${problem.id}/compare`}>
                    <Button
                      variant={problem.status === 'PROFESSIONAL_SELECTED' ? 'outline' : 'primary'}
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {problem.status === 'PROFESSIONAL_SELECTED' ? 'View Selected Quote' : 'Open Comparison Matrix'}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col Sidebar) */}
        <div className="space-y-6">
          {/* Service Location Card */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  City & Neighborhood
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {problem.location.neighborhood}, {problem.location.city}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Contractor Masked Address
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  {problem.location.maskedAddress}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Your exact apartment number is kept private until you accept a quote.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Urgency & Preferred Timing Card */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Timing & Urgency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Urgency Level
                </span>
                <div className="mt-1">
                  <Badge variant="urgency" urgency={problem.urgency} />
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Preferred Service Date
                </span>
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {problem.preferredDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Arrival Time Window
                </span>
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {problem.preferredTimeWindow}
                </span>
              </div>

              {(problem.budgetMin || problem.budgetMax) && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Customer Budget Range
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    ₹{problem.budgetMin || '0'} – ₹{problem.budgetMax || 'Any'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardContent className="p-4 space-y-2">
              <Link to="/customer/problems/new" className="block">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Post Another Problem
                </Button>
              </Link>
              <Link to="/customer/dashboard" className="block">
                <Button variant="ghost" size="sm" className="w-full text-slate-600">
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title="Attached Problem Photo"
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImage}
                alt="Enlarged evidence"
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
