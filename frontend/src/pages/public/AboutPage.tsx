import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Accordion, AccordionItemData } from '@/components/ui/Accordion';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Star,
  UserCheck,
  FileCheck2,
  Lock,
  Scale,
  Sliders,
  User,
  Briefcase,
  ArrowDownCircle,
  Compass,
} from 'lucide-react';

export function AboutPage() {
  // Section 3: Interactive How It Works Active Stage
  const [activeStage, setActiveStage] = useState<number>(1);

  // Section 4: Interactive Journey Role Tab
  const [activeRole, setActiveRole] = useState<'customer' | 'pro'>('customer');

  // Section 5: Interactive Sandbox Simulator State
  const sampleProblems = [
    {
      id: 'hvac',
      title: 'Split AC turns on but room remains warm',
      category: 'Home Appliances & HVAC',
      urgency: 'URGENT' as const,
      budget: '₹800–₹1,400',
      locality: 'Kothrud, Pune (Within 3 km)',
      proposals: [
        {
          id: 'p1',
          name: 'Arun HVAC Services',
          rating: 4.8,
          reviews: 142,
          price: '₹900',
          arrival: 'Today, 4:30 PM',
          approach: 'Examine condenser pressure, inspect start capacitor, clear drainage tray, top up R32 gas if below 120 PSI.',
          matchScore: 94,
          tag: 'Top Value Match',
        },
        {
          id: 'p2',
          name: 'CoolPro Climate Care',
          rating: 4.9,
          reviews: 89,
          price: '₹1,150',
          arrival: 'Tomorrow, 10:00 AM',
          approach: 'Indoor jet chemical wash, electronic blower calibration, refrigerant sniffer test, and thermal delta measurement.',
          matchScore: 91,
          tag: 'Comprehensive Service',
        },
      ],
    },
    {
      id: 'plumb',
      title: 'Water pooling under kitchen sink cabinet',
      category: 'Plumbing & Water Systems',
      urgency: 'SOON' as const,
      budget: '₹500–₹900',
      locality: 'Aundh, Pune (Within 4 km)',
      proposals: [
        {
          id: 'p3',
          name: 'RapidFlow Plumbing',
          rating: 4.7,
          reviews: 116,
          price: '₹550',
          arrival: 'Today, 6:00 PM',
          approach: 'Inspect P-trap slip joints, replace degraded silicone washers, and test drain under high flow.',
          matchScore: 93,
          tag: 'Quick Resolution',
        },
        {
          id: 'p4',
          name: 'Apex Sanitation Works',
          rating: 4.9,
          reviews: 204,
          price: '₹750',
          arrival: 'Today, 7:30 PM',
          approach: 'Full pipe snake inspection, dual-seal replacement with reinforced PVC, and 30-day leak warranty.',
          matchScore: 89,
          tag: 'Extended Guarantee',
        },
      ],
    },
    {
      id: 'electric',
      title: 'Main circuit breaker trips under microwave load',
      category: 'Electrical Systems',
      urgency: 'URGENT' as const,
      budget: '₹600–₹1,200',
      locality: 'Baner, Pune (Within 2.5 km)',
      proposals: [
        {
          id: 'p5',
          name: 'VoltSafe Electricals',
          rating: 4.8,
          reviews: 98,
          price: '₹650',
          arrival: 'Today, 5:15 PM',
          approach: 'Load-test 16A circuit breaker, check kitchen branch neutral bonding, and verify earth resistance.',
          matchScore: 95,
          tag: 'Safety Focused',
        },
        {
          id: 'p6',
          name: 'SparkPro Technicians',
          rating: 4.6,
          reviews: 74,
          price: '₹850',
          arrival: 'Tomorrow, 9:00 AM',
          approach: 'Replace worn MCB with Class-C high-inrush breaker and rewire kitchen power point terminals.',
          matchScore: 88,
          tag: 'Component Replacement',
        },
      ],
    },
  ];

  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const currentProblem = sampleProblems[selectedProblemIndex];
  const [selectedProposalId, setSelectedProposalId] = useState<string>(currentProblem.proposals[0].id);

  const handleSelectProblem = (index: number) => {
    setSelectedProblemIndex(index);
    setSelectedProposalId(sampleProblems[index].proposals[0].id);
  };

  const selectedProposal =
    currentProblem.proposals.find((p) => p.id === selectedProposalId) ||
    currentProblem.proposals[0];

  // Section 8: FAQ items
  const faqItems: AccordionItemData[] = [
    {
      id: 'faq-1',
      title: 'What is SolveBid?',
      content:
        'SolveBid is a problem-to-professional service marketplace. Instead of forcing customers to browse static directories, guess technical service categories, and make endless phone calls, SolveBid allows customers to describe what is wrong in plain language. Verified professionals review the symptoms and compete with structured proposals detailing diagnosis, price, arrival time, and scope.',
    },
    {
      id: 'faq-2',
      title: 'How is SolveBid different from a traditional service marketplace?',
      content:
        'Traditional platforms either sell directories of phone numbers or assign technicians blindly without upfront scope clarity. SolveBid is problem-first: you post symptoms once, matching rules identify relevant nearby professionals, and you compare multiple tailored proposals side-by-side before deciding. Once work starts, everything is governed through a dedicated Job Workspace.',
    },
    {
      id: 'faq-3',
      title: 'How does professional matching work?',
      content:
        'The matching engine analyzes the problem category, skill compatibility, geographic coverage radius, real-time availability, and verified reputation. Matching reasons are explainable (e.g., skill match, proximity, and rating) so both customers and professionals understand why an opportunity was recommended.',
    },
    {
      id: 'faq-4',
      title: 'Can customers compare multiple proposals?',
      content:
        'Yes. Comparing transparent solutions is a core feature. Proposals are standardized to display price, diagnostic approach, earliest arrival time, professional rating, and experience side-by-side, preventing low-ball races to the bottom while giving customers clear, multi-dimensional choices.',
    },
    {
      id: 'faq-5',
      title: 'Why must professionals be verified?',
      content:
        'To protect marketplace trust and work quality, professionals must undergo administrator verification of their professional credentials before receiving full bidding privileges. This ensures that customers receive proposals from vetted, legitimate service providers.',
    },
    {
      id: 'faq-6',
      title: 'Can a professional change a quoted price after inspecting a problem on-site?',
      content:
        'If an on-site physical inspection reveals hidden defects or additional required parts, the professional cannot simply inflate the bill unilaterally. They must submit a formal Quote Revision in the Job Workspace with an itemized explanation and evidence. The customer must explicitly review and approve the revised scope before any extra work proceeds.',
    },
    {
      id: 'faq-7',
      title: 'When can a customer submit a review?',
      content:
        'Reviews are strictly restricted to jobs that have been completed and confirmed. Professionals submit completion summaries and evidence, and customers confirm satisfactory resolution before review eligibility opens. This ensures that every public rating reflects genuine, verified work rather than arbitrary ratings.',
    },
    {
      id: 'faq-8',
      title: 'How does SolveBid handle disputes?',
      content:
        'If a disagreement arises regarding scope, service quality, or unapproved price adjustments, either party can open a structured dispute in the Job Workspace. Platform administrators examine the timeline, uploaded photos, messages, quote revision history, and completion evidence to render a fair arbitration decision.',
    },
    {
      id: 'faq-9',
      title: "When can professionals see a customer's exact address?",
      content:
        'Privacy by design is strictly enforced. During problem matching and proposal discovery, professionals only see the approximate locality (neighborhood/city area and radial distance). The exact customer street address, house number, and direct contact details are revealed only to the specifically assigned professional inside the active Job Workspace based on authenticated role and workflow stage.',
    },
    {
      id: 'faq-10',
      title: 'Is the interactive preview connected to live services?',
      content:
        'No. The interactive proposal preview on this page is an illustrative local simulation designed to demonstrate how SolveBid structures problem matching and proposal comparisons. It does not initiate real searches, professional notifications, bookings, or financial transactions.',
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-20 sm:space-y-28 py-8 sm:py-16">
      {/* =========================================================================
          SECTION 1: IMMERSIVE HERO
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>The Problem-First Service Marketplace</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Better solutions begin with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              understanding the problem.
            </span>
          </h1>

          {/* Supporting Message */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            SolveBid helps customers explain their problems, discover suitable professionals, compare transparent proposals, and move toward a resolution with greater clarity and confidence.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => scrollToSection('how-it-works')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore How It Works
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => scrollToSection('user-journeys')}
              leftIcon={<Compass className="w-4 h-4 text-blue-600" />}
            >
              Explore Customer & Pro Journey
            </Button>
          </div>
        </div>

        {/* Hero Visual Composition: Composed UI Preview */}
        <div className="mt-12 p-4 sm:p-8 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white border border-blue-200/80 rounded-3xl shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Customer Problem Card (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  PB-00847
                </span>
                <Badge variant="urgency" urgency="URGENT" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Customer Described Problem
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Split AC turns on but room remains warm
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  "Unit runs for 20 minutes, outdoor fan spins, but air from indoor blower is room temperature. Began yesterday afternoon."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Locality</span>
                  <span className="font-semibold text-slate-800">Kothrud, Pune</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Guide</span>
                  <span className="font-semibold text-slate-800 font-mono">₹900–₹1,500</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px]">
                  <strong>Privacy Rule:</strong> Street address masked during discovery.
                </span>
              </div>
            </div>

            {/* Middle Divider: Matching Engine Pulse (2 cols) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 text-center py-2 lg:py-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Matching Engine</span>
              <span className="text-[11px] text-slate-500 max-w-[120px]">
                Skills & proximity analysis
              </span>
            </div>

            {/* Right Column: Competing Proposals Side-by-Side (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Proposal 1 Card */}
              <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-sm relative">
                <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Top Matched
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Arun HVAC Services</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <strong>4.8</strong> (142 jobs) • 2.1 km away
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-slate-900 font-mono">₹900</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                  "Examine condenser pressure, inspect capacitor, clear drainage, top up R32 gas if low."
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                  <span>Arrival: <strong className="text-slate-800">Today, 4:30 PM</strong></span>
                  <Badge variant="verified" />
                </div>
              </div>

              {/* Proposal 2 Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">CoolPro Climate Care</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <strong>4.9</strong> (89 jobs) • 3.5 km away
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-slate-900 font-mono">₹1,150</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                  "Chemical jet indoor flush, blower check, refrigerant sniff test, thermal delta check."
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                  <span>Arrival: <strong className="text-slate-800">Tomorrow, 10:00 AM</strong></span>
                  <Badge variant="verified" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasteful scroll cue */}
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => scrollToSection('why-solvebid')}
            aria-label="Scroll to Why SolveBid Exists section"
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors text-xs font-medium"
          >
            <span>Learn More</span>
            <ArrowDownCircle className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHY SOLVEBID EXISTS
          ========================================================================= */}
      <section id="why-solvebid" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            The Problem We Solve
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why We Built SolveBid
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finding trustworthy help for an unexpected problem is frequently broken. Traditional platforms either sell phone directories or assign technicians with zero transparency.
          </p>
        </div>

        {/* Side-by-side contrast grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Way */}
          <div className="bg-white border border-rose-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">The Fragmented Traditional Experience</h3>
                <span className="text-xs text-rose-600 font-medium">Uncertainty, friction, and opaque pricing</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Repeated explanations:</strong> Calling 5 different numbers and repeating the same symptoms to technicians who may not specialize in your issue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Incomparable quotes:</strong> One provider quotes ₹500 for a visit, another quotes ₹2,000 for parts, without a shared scope or diagnostic breakdown.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Opaque on-site price changes:</strong> Technicians arrive and inflate prices mid-job without prior justification or written consent.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Unreliable reviews:</strong> Reviews often reflect fake marketing profiles rather than verified, completed jobs.</span>
              </li>
            </ul>
          </div>

          {/* SolveBid Problem-First Way */}
          <div className="bg-white border-2 border-blue-500/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">The SolveBid Problem-First Workflow</h3>
                <span className="text-xs text-blue-600 font-semibold">Structured, transparent, and governed</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Describe once:</strong> Customers submit symptoms, photos, and urgency once. The platform organizes the request into a structured lead.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Transparent proposals:</strong> Verified professionals evaluate symptoms and submit proposals with diagnosis, price, and arrival times.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Mandatory quote revision consent:</strong> On-site price changes require a formal quote revision with customer approval before work proceeds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                <span><strong>Verified reputation integrity:</strong> Ratings and reviews are restricted strictly to confirmed completed jobs.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real-World Service Standards Feature */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-3xl shadow-xs flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-5/12 rounded-2xl overflow-hidden border border-slate-200 shadow-xs aspect-[16/10] shrink-0">
            <img
              src="/images/service-completion-consultation.jpg"
              alt="Homeowner reviewing transparent diagnostic report with a verified technician"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Problem-First Principle</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              Every resolution starts with an accurate diagnosis, not an arbitrary quote
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SolveBid replaces blind phone calls and unrecorded promises with structured diagnostic proposals, upfront pricing breakdowns, and formal quote revisions if unexpected defects appear.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE "HOW SOLVEBID WORKS" JOURNEY
          ========================================================================= */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            How SolveBid Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            The 4-Stage Problem-to-Resolution Journey
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Click any milestone below to inspect how a real-world issue transforms into a confirmed resolution.
          </p>
        </div>

        {/* 4 Interactive Stage Milestone Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { num: 1, title: 'Describe Problem', desc: 'Symptoms & Context' },
            { num: 2, title: 'Discover Pros', desc: 'Explainable Matching' },
            { num: 3, title: 'Compare Proposals', desc: 'Transparent Selection' },
            { num: 4, title: 'Complete Work', desc: 'Governed Lifecycle' },
          ].map((stage) => {
            const isActive = activeStage === stage.num;
            return (
              <button
                key={stage.num}
                type="button"
                onClick={() => setActiveStage(stage.num)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {stage.num}
                  </span>
                  {isActive && <span className="text-[10px] font-bold text-blue-600 uppercase">Active</span>}
                </div>
                <h4 className="font-bold text-sm text-slate-900">{stage.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Central Visual Display for Active Stage */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
          {activeStage === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 1: Describe the Problem
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Focus on what is wrong, not the technical diagnosis
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Customers post symptoms in ordinary language. You don't need to know if an AC needs gas or a capacitor—just describe what happens when you turn it on.
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Upload optional photos or videos of the problem.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Specify urgency (Urgent, Soon, Normal) and preferred service times.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Provide approximate locality (street address is masked for discovery).</span>
                  </div>
                </div>
              </div>

              {/* Stage 1 Preview Mock */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Sample Problem Submission</span>
                  <Badge variant="urgency" urgency="URGENT" />
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-900">Issue Description:</span>
                  <p className="text-slate-600">
                    "Water leak under the bathroom basin whenever cold tap is turned on. Need assistance this evening."
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/9] shadow-2xs">
                  <img
                    src="/images/plumbing-pipe-repair.jpg"
                    alt="Customer attached photo: Inspection of leaking pipe connection under bathroom basin"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium">
                    Attached Photo #1: Pipe fitting inspection
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Attached: <strong>2 Photos</strong></span>
                  <span>Location: <strong>Aundh (Area Only)</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Stage 2: Discover Suitable Professionals
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Explainable matching routes leads to verified specialists
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our matching engine evaluates category expertise, geographical coverage, current availability, and verified reputation to alert relevant technicians.
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Professionals must be verified by administrators prior to bidding.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Technicians only receive leads within their configured travel radius.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer street address remains strictly masked at this stage.</span>
                  </div>
                </div>
              </div>

              {/* Stage 2 Preview Mock */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Professional Lead Alert</span>
                  <Badge variant="match" matchScore={94} />
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">PB-00847: HVAC Issue</span>
                    <span className="text-emerald-700 font-semibold">2.1 km away</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Matched on skill: <strong>AC Compressor & Gas</strong> • Verified Badge
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    * Exact customer address is masked during matching.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStage === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Stage 3: Compare Structured Proposals
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Evaluate price, diagnosis, and arrival times side-by-side
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instead of phone calls with unrecorded quotes, proposals are standardized. You see exactly what each professional plans to do, when they can arrive, and their estimated pricing.
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Clear diagnostic approach explains the proposed repair strategy.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Earliest arrival timestamps let you pick by convenience or urgency.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Selecting a proposal formally assigns the job to that professional.</span>
                  </div>
                </div>
              </div>

              {/* Stage 3 Preview Mock */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border-2 border-blue-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Arun HVAC Services</span>
                    <span className="font-mono font-bold text-blue-600">₹900</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Approach: Coil pressure test & capacitor check.</p>
                  <span className="text-[10px] text-slate-500 block">Arrival: Today, 4:30 PM</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">CoolPro Climate Care</span>
                    <span className="font-mono font-bold text-slate-900">₹1,150</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Approach: Full indoor jet chemical flush & sniffer test.</p>
                  <span className="text-[10px] text-slate-500 block">Arrival: Tomorrow, 10:00 AM</span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Stage 4: Complete the Job Transparently
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Governed execution, quote revision consent, and verified closure
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The active job moves through verified status milestones. If on-site physical inspection discovers additional defects, price changes cannot be added unilaterally.
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Quote revisions require customer approval in the workspace before work proceeds.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exact street address is disclosed strictly to the assigned professional.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reviews are eligible exclusively following confirmed completed work.</span>
                  </div>
                </div>
              </div>

              {/* Stage 4 Preview Mock */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Job Workspace: JOB-00847</span>
                  <Badge variant="status">Customer Confirmed</Badge>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block">Milestones Completed:</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Arrived &rarr; Inspected &rarr; Work Complete &rarr; Customer Confirmed</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    Completion evidence submitted by technician & verified by customer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TWO DISTINCT USER JOURNEYS
          ========================================================================= */}
      <section id="user-journeys" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            User Roles & Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Two Tailored Journeys on One Shared Platform
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you need help with a household emergency or you are a skilled professional growing your business, SolveBid provides dedicated workflows for your goals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveRole('customer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              I'm a Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('pro')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeRole === 'pro'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              I'm a Professional
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeRole === 'customer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Customer 7-Step List (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {[
                { step: 1, title: 'Describe Symptoms', desc: 'Post the issue in plain words with photos, urgency level, and preferred service window.' },
                { step: 2, title: 'Privacy-Protected Discovery', desc: 'Your problem is shared with matching specialists with your exact street address safely masked.' },
                { step: 3, title: 'Receive Competing Proposals', desc: 'Technicians submit structured proposals with diagnostics, arrival times, and transparent pricing.' },
                { step: 4, title: 'Compare & Select Best Fit', desc: 'Compare multi-dimensional solutions side-by-side and choose the professional you prefer.' },
                { step: 5, title: 'Track in Job Workspace', desc: 'Follow scheduling, arrival, and work milestones in real-time with direct messaging.' },
                { step: 6, title: 'Approve or Reject Scope Changes', desc: 'Any unexpected on-site price revision requires your explicit approval before work proceeds.' },
                { step: 7, title: 'Confirm & Leave Verified Review', desc: 'Confirm satisfactory completion before closure, and leave an authentic verified review.' },
              ].map((item) => (
                <div key={item.step} className="p-3.5 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Accompanying Visual (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-blue-50/50 to-white border border-blue-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                  Customer Hub Preview
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">SolveBid Sapphire</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Sarthak's Problem Hub</h3>
                <p className="text-xs text-slate-500">2 active requests • 1 job in progress</p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-600 font-mono">PB-00847</span>
                  <Badge variant="urgency" urgency="URGENT" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">AC turns on but room is not cooling</h4>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-600"><strong>3 Proposals</strong> received</span>
                  <span className="text-blue-600 font-semibold">Ready to Compare &rarr;</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/auth/login">
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started as Customer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Professional 7-Step List (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {[
                { step: 1, title: 'Register & Provide Information', desc: 'Create your professional account and specify your domain categories, services, and operational radius.' },
                { step: 2, title: 'Administrator Credential Verification', desc: 'Submit professional credentials for platform administrator review before receiving full proposal privileges.' },
                { step: 3, title: 'Inspect Matching Problem Leads', desc: 'Review incoming customer requests matched directly to your skills and service coverage area.' },
                { step: 4, title: 'Evaluate Symptoms & Locality', desc: 'Examine symptom descriptions, photos, and approximate distance (customer address is masked).' },
                { step: 5, title: 'Submit Structured Proposal', desc: 'Propose transparent pricing, diagnostic approach, earliest arrival time, and estimated duration.' },
                { step: 6, title: 'Manage Accepted Jobs', desc: 'Access the Job Workspace, view revealed address, update milestones, and submit quote revisions if needed.' },
                { step: 7, title: 'Build Audit-Backed Reputation', desc: 'Earn verified reviews from confirmed completed jobs to boost your matching visibility.' },
              ].map((item) => (
                <div key={item.step} className="p-3.5 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Professional Accompanying Visual (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-amber-50/50 to-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Pro Workbench Preview
                </span>
                <Badge variant="verified" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Arun HVAC Services</h3>
                <p className="text-xs text-slate-500">5 matching leads in 15km radius • 4.8 Rating</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-amber-200/90 aspect-[16/9] shadow-xs">
                <img
                  src="/images/hvac-technician-inspection.jpg"
                  alt="Verified HVAC service technician inspecting a split air conditioning system"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1.5">
                  <Badge variant="verified" />
                  <span>On-Site Technical Inspection</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-700 font-mono">LEAD-00847</span>
                  <Badge variant="match" matchScore={94} />
                </div>
                <h4 className="font-bold text-sm text-slate-900">AC turns on but room is not cooling</h4>
                <p className="text-xs text-slate-600">Approximate Location: <strong>Kothrud (2.1 km)</strong></p>
                <p className="text-[10px] text-slate-500 italic border-t border-slate-100 pt-1">
                  * Customer street address is masked during matching and revealed upon proposal selection.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/auth/register">
                  <Button variant="primary" size="sm" className="w-full bg-amber-600 hover:bg-amber-700 border-amber-500/20">
                    Apply as a Professional
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: EXPERIENCE SOLVEBID THROUGH INTERACTIVE PREVIEWS
          ========================================================================= */}
      <section id="interactive-preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Interactive Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Experience Proposal Comparison in Action
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Select a sample problem below to see how SolveBid standardizes competing solutions so you can compare diagnosis, arrival, and price with clarity.
          </p>
        </div>

        {/* Step 1: Problem Selector Chips */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
            Step 1: Choose a Customer Problem
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {sampleProblems.map((p, idx) => {
              const isSelected = selectedProblemIndex === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProblem(idx)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Problem Summary Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600">{currentProblem.category}</span>
              <span className="text-slate-300">•</span>
              <Badge variant="urgency" urgency={currentProblem.urgency} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{currentProblem.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Approximate Locality: <strong>{currentProblem.locality}</strong> (Street address masked)
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Typical Budget</span>
            <span className="text-base font-mono font-bold text-slate-900">{currentProblem.budget}</span>
          </div>
        </div>

        {/* Step 2: Competing Proposals Selector */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
            Step 2: Compare Competing Proposals (Click to Highlight)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProblem.proposals.map((proposal) => {
              const isSelected = selectedProposalId === proposal.id;
              return (
                <button
                  key={proposal.id}
                  type="button"
                  onClick={() => setSelectedProposalId(proposal.id)}
                  className={`text-left p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-white border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">{proposal.name}</h4>
                        <Badge variant="verified" />
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <strong>{proposal.rating}</strong> ({proposal.reviews} jobs)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Proposed</span>
                      <span className="text-xl font-mono font-extrabold text-slate-900">{proposal.price}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl my-3 text-xs space-y-1">
                    <span className="font-semibold text-slate-800 block">Diagnostic Approach:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{proposal.approach}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Arrival: <strong className="text-slate-800">{proposal.arrival}</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {proposal.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Why Detail Comparison Protects the Customer */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl max-w-4xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <h4 className="font-bold text-sm sm:text-base text-slate-900">
              Why Comparing Details Matters: Selected Solution Breakdown
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By choosing <strong>{selectedProposal.name}</strong> at <strong>{selectedProposal.price}</strong>, you gain a clear diagnostic approach ("<em>{selectedProposal.approach}</em>") and an expected arrival window of <strong>{selectedProposal.arrival}</strong>. Because the scope is documented upfront, any on-site quote modification requires a formal Quote Revision that you must explicitly approve.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: TRUST, SAFETY, AND TRANSPARENCY
          ========================================================================= */}
      <section id="trust-safety" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Trust & Safety
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Trust Built into Every Step
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SolveBid doesn't rely on trust alone. We incorporate accountability mechanisms into every step of the workflow to protect both customers and professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Pro Verification */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Administrator Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Professionals must submit credentials for administrator verification before gaining proposal privileges, ensuring vetted representation.
            </p>
          </div>

          {/* 2. Explainable Matching */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Explainable Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No black-box algorithms. Matching explicitly explains why professionals match a lead based on verified skill domains, distance, and ratings.
            </p>
          </div>

          {/* 3. Transparent Proposals */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Standardized Proposals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Proposals require price, diagnostic approach, and arrival timestamps, preventing low-ball bids and ambiguous telephone quotes.
            </p>
          </div>

          {/* 4. Customer-Approved Quote Revisions */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Quote Revision Consent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If unexpected defects appear during physical inspection, technicians must submit a formal revision. Work cannot proceed without customer acceptance.
            </p>
          </div>

          {/* 5. Privacy by Design */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Privacy by Design</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Street addresses and direct contact numbers are masked during discovery. Exact address is revealed only to the assigned professional inside the Job Workspace.
            </p>
          </div>

          {/* 6. Dispute Arbitration */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Platform Dispute Handling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an unresolved conflict arises regarding scope or completion, administrators examine timeline evidence, photos, and messages to arbitrate fairly.
            </p>
          </div>
        </div>

        {/* Verification & Safety in Practice */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] shadow-md">
            <img
              src="/images/electrician-safety-inspection.jpg"
              alt="Qualified electrician adhering to residential electrical safety protocols"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs text-white shadow-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">
                Vetted credentials & safety-first service standards
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-3.5">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              Verified Marketplace Standards
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Safety, competence, and accountability on every call
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every professional applying to SolveBid submits identity credentials and skill domain declarations for administrator audit. Once verified, clear proposal scopes, on-site quote revision consent, and dispute arbitration guarantee both parties are protected at every stage.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-white block">Audit-Backed Reviews</span>
                <span className="text-slate-400 text-[11px]">Only confirmed jobs can submit ratings</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-white block">Privacy Protection</span>
                <span className="text-slate-400 text-[11px]">Exact address masked until job assignment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Honest Claims Guardrail */}
        <p className="text-center text-xs text-slate-500 max-w-2xl mx-auto italic">
          * SolveBid enforces structured transparency and dispute workflows, but does not provide legal insurance guarantees or claim zero-defect service outcomes.
        </p>
      </section>



      {/* =========================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section id="faqs" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Everything you need to know about the SolveBid platform, privacy rules, and governance.
          </p>
        </div>

        {/* Accessible Accordion Component */}
        <Accordion items={faqItems} defaultOpenId="faq-1" />
      </section>

      {/* =========================================================================
          SECTION 9: CLOSING CALL TO ACTION
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              Ready to Experience Better Service?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Start with the problem.<br />Move forward with clarity.
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Join a modern marketplace where customers describe symptoms once and verified professionals compete with transparent, structured proposals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/auth/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </Link>

            <Link to="/auth/register" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/60 text-white hover:bg-white/10 font-bold"
              >
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Preserve existing PublicProProfilePage export for route: /professionals/:proId
export function PublicProProfilePage() {
  return (
    <PlaceholderPage
      title="Verified Professional Profile Showcase"
      route="/professionals/:proId"
      portal="Public"
      phase="Phase 02 (Public Experience - Tier 1 Core MVP)"
      description="Public professional showcase demonstrating verified credentials, overall and category ratings, completed job counts, service coverage radius, response rate, and verified customer reviews."
      backTo={{ label: 'Back to Home', path: '/' }}
      highlights={[
        'Verified Professional Badge: Awarded exclusively post-admin credential review.',
        'Reputation Breakdown: Ratings across Quality, Professionalism, Punctuality, and Value.',
        'Completed Job History: Verified completed jobs linked to customer confirmed work.',
      ]}
    />
  );
}
