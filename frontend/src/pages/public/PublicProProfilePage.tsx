import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { matchingService, type MockProfessionalProfile } from '@/services/matchingService';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Briefcase,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ThumbsUp,
  Sliders,
} from 'lucide-react';

export function PublicProProfilePage() {
  const { proId } = useParams<{ proId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MockProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!proId) return;
      try {
        const found = await matchingService.getProfessionalById(proId);
        if (isMounted) {
          setProfile(found);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load professional profile:', err);
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [proId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Loading verified contractor profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Professional Not Found</h2>
          <p className="text-xs text-slate-500">
            Could not locate professional with ID &quot;{proId}&quot;.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Previous View
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">ID: {profile.id}</span>
            <Link to="/customer/problems/new">
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Post a Problem
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero Profile Header Card */}
        <Card className="bg-white border-slate-200 shadow-elevated overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {profile.businessName}
                    </h1>
                    {profile.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Professional
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Pending Verification Audit
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2 flex-wrap">
                    <span>Lead Contractor: <strong className="font-semibold text-slate-900">{profile.name}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-600 font-semibold">{profile.category}</span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Based in {profile.neighborhood}, {profile.city} (Serves up to {profile.coverageRadiusKm} km radius)</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span className="text-lg font-black text-slate-900">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.completedJobsCount} Confirmed Jobs
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Experience
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {profile.experienceYears} Years Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Completed Jobs
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {profile.completedJobsCount} Verified Jobs
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Avg. Response Time
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  ~{profile.responseTimeMinutes} Minutes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Credential Audit
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  {profile.verified ? '100% Passed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Two-Column Grid: Reputation Breakdown & Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Column (2 cols) */}
          <div className="md:col-span-2 space-y-8">
            {/* Professional Bio */}
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  About the Contractor & Diagnostic Philosophy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Reputation & Quality Breakdown */}
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Reputation Pillars & Quality Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Diagnostic Quality & Workmanship</span>
                      <span className="text-slate-900 font-bold">{profile.ratingsBreakdown.quality} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${(profile.ratingsBreakdown.quality / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Professionalism & Communication</span>
                      <span className="text-slate-900 font-bold">{profile.ratingsBreakdown.professionalism} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${(profile.ratingsBreakdown.professionalism / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Punctuality & Arrival Precision</span>
                      <span className="text-slate-900 font-bold">{profile.ratingsBreakdown.punctuality} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${(profile.ratingsBreakdown.punctuality / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Pricing Transparency & Value</span>
                      <span className="text-slate-900 font-bold">{profile.ratingsBreakdown.value} / 5.0</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${(profile.ratingsBreakdown.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verified Customer Reviews Portfolio */}
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    Verified Customer Reviews ({profile.sampleReviews.length})
                  </CardTitle>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Exclusively Customer Confirmed Jobs
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {profile.sampleReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">• {rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-900">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-blue-700">{rev.jobTitle}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1 col Sidebar) */}
          <div className="space-y-6">
            {/* Verified Certifications Card */}
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{cert}</span>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900 mt-2">
                  SolveBid validates government licenses and ID background audits before granting the verified contractor seal.
                </div>
              </CardContent>
            </Card>

            {/* Trade Skills Card */}
            <Card className="bg-white border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Specialized Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Direct Problem Match CTA */}
            <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-md border-0">
              <CardContent className="p-5 space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-blue-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Need Diagnostic Help?</h3>
                  <p className="text-xs text-blue-200 leading-relaxed">
                    Post your problem to receive a transparent structured proposal directly from {profile.businessName}.
                  </p>
                </div>
                <Link to="/customer/problems/new" className="block">
                  <Button variant="secondary" size="sm" className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold">
                    Post a Problem Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
