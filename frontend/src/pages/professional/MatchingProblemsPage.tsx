import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockProblemAdapter } from '@/services/mockProblemAdapter';
import { mockProposalAdapter } from '@/services/mockProposalAdapter';
import { matchingService, type MockProfessionalProfile } from '@/services/matchingService';
import { useAuth } from '@/context/AuthContext';
import type { Problem } from '@/types/problem';
import type { MatchScoreBreakdown } from '@/types/proposal';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Info,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface ProblemWithMatch {
  problem: Problem;
  matchScore: MatchScoreBreakdown;
  distanceKm: number;
  hasSubmitted: boolean;
}

export function MatchingProblemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ProblemWithMatch[]>([]);
  const [proProfile, setProProfile] = useState<MockProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'EMERGENCY' | 'URGENT' | 'SOON' | 'NORMAL'>('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(20);

  // Match score explain modal
  const [activeScoreBreakdown, setActiveScoreBreakdown] = useState<{
    problemTitle: string;
    breakdown: MatchScoreBreakdown;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const proId = user?.id || 'user-demo-pro';
        const [profile, allProblems, proProposals] = await Promise.all([
          matchingService.getProfessionalById(proId),
          mockProblemAdapter.getProblems(),
          mockProposalAdapter.getProposalsByProfessional(proId),
        ]);

        if (!isMounted) return;

        setProProfile(profile);

        const submittedProblemIds = new Set(proProposals.map((p) => p.problemId.toUpperCase()));

        // Calculate matching score for each active problem
        const matchedList: ProblemWithMatch[] = [];

        for (const problem of allProblems) {
          const distanceKm = problem.location.distanceKm || 3.5;
          const matchScore = profile
            ? matchingService.calculateMatchScore(problem, profile, distanceKm)
            : {
                overall: 88,
                skillMatch: 85,
                distanceMatch: 90,
                availabilityMatch: 90,
                ratingMatch: 95,
                responseSpeedMatch: 85,
              };

          const hasSubmitted = submittedProblemIds.has(problem.id.toUpperCase());

          matchedList.push({
            problem,
            matchScore,
            distanceKm,
            hasSubmitted,
          });
        }

        // Sort by overall match score descending
        matchedList.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

        setItems(matchedList);
        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load matching problems:', err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (urgencyFilter !== 'ALL' && item.problem.urgency !== urgencyFilter) {
        return false;
      }
      if (item.distanceKm > maxDistanceKm) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.problem.title.toLowerCase().includes(q);
        const matchesCategory = item.problem.category.toLowerCase().includes(q);
        const matchesDesc = item.problem.description.toLowerCase().includes(q);
        const matchesLoc = item.problem.location.neighborhood.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc && !matchesLoc) {
          return false;
        }
      }
      return true;
    });
  }, [items, urgencyFilter, maxDistanceKm, searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-16 text-center text-slate-500 space-y-3">
        <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium">Scanning active problems within your service radius...</p>
      </div>
    );
  }

  const activeCount = items.filter((i) => i.problem.status === 'OPEN' || i.problem.status === 'PROPOSALS_RECEIVED').length;
  const submittedCount = items.filter((i) => i.hasSubmitted).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header and Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Matching Customer Problems Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lead feed tailored to your trade specialties in{' '}
            <strong className="text-slate-700">{proProfile?.category || 'HVAC & Appliances'}</strong> with explainable match scores.
          </p>
        </div>

        <Link to="/pro/proposals">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            My Submitted Proposals ({submittedCount})
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Active Opportunities
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{activeCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Top Match Score
            </span>
            <span className="text-2xl font-bold text-purple-600 mt-0.5 block">
              {items[0] ? `${items[0].matchScore.overall}%` : 'N/A'}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Configured Radius
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
              {proProfile?.coverageRadiusKm || 15} km
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Proposals Sent
            </span>
            <span className="text-2xl font-bold text-emerald-600 mt-0.5 block">{submittedCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="bg-white border-slate-200 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptom descriptions, equipment, or neighborhood..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="ALL">All Urgencies</option>
                <option value="EMERGENCY">Emergency (Immediate)</option>
                <option value="URGENT">Urgent (&lt; 24h)</option>
                <option value="SOON">Soon (2-3 days)</option>
                <option value="NORMAL">Normal / Flexible</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={15}>Within 15 km</option>
                <option value={25}>Within 25 km</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of Problem Cards */}
      {filteredItems.length === 0 ? (
        <Card className="bg-white border-slate-200 shadow-2xs p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Matching Problems Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query, distance slider, or urgency filter.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setUrgencyFilter('ALL');
              setMaxDistanceKm(20);
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(({ problem, matchScore, distanceKm, hasSubmitted }) => {
            const isClosed = problem.status === 'PROFESSIONAL_SELECTED' || problem.status === 'CLOSED';

            return (
              <Card
                key={problem.id}
                className={`bg-white border transition-all ${
                  hasSubmitted
                    ? 'border-blue-300 bg-blue-50/10'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-elevated'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Problem Meta & Title */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {problem.id}
                        </span>
                        <Badge variant="urgency" urgency={problem.urgency} />
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {problem.category}
                        </span>

                        {/* Match Score Pill */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>{matchScore.overall}% Match</span>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveScoreBreakdown({
                                problemTitle: problem.title,
                                breakdown: matchScore,
                              })
                            }
                            className="text-purple-400 hover:text-purple-700 ml-0.5 cursor-pointer"
                            title="View Score Breakdown"
                          >
                            <Info className="w-3 h-3" />
                          </button>
                        </div>

                        {hasSubmitted && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Proposal Submitted
                          </span>
                        )}

                        {isClosed && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Contractor Hired
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {problem.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {problem.description}
                      </p>

                      {/* Locality & Timing Chips */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {problem.location.neighborhood}, {problem.location.city} (~{distanceKm} km away)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Preferred: {problem.preferredDate} ({problem.preferredTimeWindow})
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {problem.proposalsCount} proposals submitted
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Link to={`/pro/matching-problems/${problem.id}`} className="block w-full sm:w-auto">
                        <Button
                          variant={hasSubmitted ? 'outline' : 'primary'}
                          size="md"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          className="w-full sm:w-auto shadow-2xs"
                        >
                          {hasSubmitted ? 'Inspect Request' : 'Inspect & Draft Proposal'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MATCH SCORE EXPLAINABILITY MODAL */}
      {activeScoreBreakdown && (
        <Modal
          isOpen={!!activeScoreBreakdown}
          onClose={() => setActiveScoreBreakdown(null)}
          title="Explainable Match Score Breakdown"
          size="md"
        >
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-purple-950">
                    {activeScoreBreakdown.problemTitle}
                  </h4>
                  <p className="text-[11px] text-purple-800">
                    Algorithmic suitability assessment based on your professional profile
                  </p>
                </div>
                <div className="text-xl font-extrabold text-purple-700">
                  {activeScoreBreakdown.breakdown.overall}%
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Skill Compatibility (30% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.skillMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.skillMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Geographic Proximity (25% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.distanceMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.distanceMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Calendar Availability (20% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.availabilityMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.availabilityMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Contractor Rating (15% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.ratingMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.ratingMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Historical Response Speed (10% weight)</span>
                  <span className="text-slate-900 font-bold">{activeScoreBreakdown.breakdown.responseSpeedMatch}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${activeScoreBreakdown.breakdown.responseSpeedMatch}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveScoreBreakdown(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
