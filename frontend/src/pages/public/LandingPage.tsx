import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Wrench,
  Star,
  Wind,
  Car,
  Laptop,
  Building2,
} from 'lucide-react';

export function LandingPage() {
  const [problemText, setProblemText] = useState('');
  const navigate = useNavigate();

  // Rotating realistic consumer problem examples
  const examplePrompts = [
    'My AC is running but the room is not cooling...',
    'There is a persistent leak under my kitchen sink...',
    'Main circuit breaker trips whenever microwave turns on...',
    'Washing machine drum fills with water but does not spin...',
    'Laptop powers on with fan noise but display remains black...',
  ];
  const [promptIndex, setPromptIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (isReducedMotion || problemText.length > 0) return;
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % examplePrompts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isReducedMotion, problemText, examplePrompts.length]);

  const handleQuickPost = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/auth/login');
  };

  const handleChipClick = (suggestion: string) => {
    setProblemText(suggestion);
  };

  const quickSuggestions = [
    { label: '❄️ AC Not Cooling', text: 'Split AC is running but blowing warm room air' },
    { label: '💧 Sink Pipe Leak', text: 'Water pooling under kitchen sink cabinet' },
    { label: '⚡ Breaker Tripping', text: 'Main circuit breaker trips under appliance load' },
    { label: '🧺 Washer Drain Failure', text: 'Front-load washing machine not draining water' },
  ];

  const serviceCategories = [
    {
      id: 'home',
      name: 'Home Appliances & HVAC',
      desc: 'Air conditioning, refrigerator, washing machine, plumbing, wiring',
      icon: <Wind className="w-5 h-5 text-blue-600" />,
      tag: 'Most Active',
      examples: ['AC Gas Refill & Cooling', 'Water Purifier Service', 'Bathroom Leak Repair'],
    },
    {
      id: 'vehicle',
      name: 'Vehicle & Roadside Breakdown',
      desc: 'On-demand jumpstart, tire puncture, brake noise, roadside diagnosis',
      icon: <Car className="w-5 h-5 text-amber-600" />,
      tag: 'On-Demand',
      examples: ['Car Battery Dead', 'Flat Tire Assistance', 'Brake Fluid Check'],
    },
    {
      id: 'tech',
      name: 'Tech Hardware & Networking',
      desc: 'Laptop screen repair, WiFi mesh setup, router configuration, CCTV',
      icon: <Laptop className="w-5 h-5 text-purple-600" />,
      tag: 'Specialist',
      examples: ['Laptop Display Replacement', 'Home Office WiFi Setup', 'CCTV Camera Offline'],
    },
    {
      id: 'commercial',
      name: 'Commercial & Facility',
      desc: 'Restaurant refrigeration, office HVAC, generator maintenance, lighting',
      icon: <Building2 className="w-5 h-5 text-emerald-600" />,
      tag: 'Business',
      examples: ['Commercial Freezer Service', 'Office LED Troffer Repair', 'Exhaust Fan Overhaul'],
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-16">
      {/* 1. Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Architecture Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>The Problem-First Service Marketplace</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Describe the problem.<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Compare the solutions.
          </span><br />
          Get it solved.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Skip calling dozens of unverified technicians with unpredictable rates. Tell us what is wrong in plain words.
          Nearby verified professionals examine your symptoms and submit transparent, fixed-scope proposals.
        </p>

        {/* Interactive Problem Search Bar (Consumer-focused) */}
        <div className="max-w-2xl mx-auto space-y-3 pt-2">
          <form
            onSubmit={handleQuickPost}
            className="p-2 sm:p-2.5 bg-white border-2 border-slate-200 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 rounded-2xl shadow-elevated transition-all flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center pl-2 sm:pl-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={
                  isReducedMotion
                    ? 'Describe your problem in plain words...'
                    : examplePrompts[promptIndex]
                }
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 px-3 py-2 focus:outline-none font-medium"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto shadow-sm shrink-0 font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </form>

          {/* Quick Problem Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium mr-1 text-[11px] uppercase tracking-wider">
              Common issues:
            </span>
            {quickSuggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleChipClick(item.text)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors shadow-xs text-xs font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium">
            <Badge variant="verified" />
            <span className="text-slate-500">Document & License Audited</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Average 3 Proposals in 30 Mins</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quote Revision Transparency</span>
          </div>
        </div>
      </section>

      {/* 2. Core Value Differentiator: Side-by-Side Proposal Comparison Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-blue-50/60 to-white border border-blue-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Why SolveBid is Different
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Compare complete solutions, not just telephone estimates
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you post a problem, nearby verified professionals examine your photos and symptoms, then submit transparent proposals specifying diagnostic approach, price, and earliest visit.
            </p>
          </div>

          {/* Comparison Cards Mock Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Proposal 1 */}
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-md relative flex flex-col justify-between">
              <div className="absolute -top-3 right-5 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                ⭐ Top Matched Solution
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Arun HVAC Services</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <strong>4.8</strong> (142 verified jobs) • 2.1 km away
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Price</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">₹900</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diagnosis & Action Plan</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    "Examine condenser coil pressure, inspect starting capacitor, flush drainage tray, and top up R32 gas if below 120 PSI."
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Earliest Arrival: <strong className="text-slate-800">Today, 4:30 PM</strong>
                  </span>
                  <span className="text-emerald-700 font-medium">Coil inspection included</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Badge variant="verified" />
                <Link to="/auth/login">
                  <Button variant="primary" size="sm" className="font-semibold">
                    Select This Solution
                  </Button>
                </Link>
              </div>
            </div>

            {/* Proposal 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">CoolPro Climate Care</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <strong>4.9</strong> (89 verified jobs) • 3.5 km away
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Price</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">₹1,150</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diagnosis & Action Plan</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    "Chemical indoor jet flush, electronic blower check, refrigerant leak sniff test, and airflow thermal delta measurement."
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Earliest Arrival: <strong className="text-slate-800">Tomorrow, 10:00 AM</strong>
                  </span>
                  <span className="text-slate-500">Chemical service</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Badge variant="verified" />
                <Link to="/auth/login">
                  <Button variant="secondary" size="sm" className="font-semibold">
                    Select This Solution
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four-Step Problem-to-Resolution Workflow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Clear, Governed Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How SolveBid Works</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            From the moment your issue begins until you confirm satisfactory completion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-blue-300 transition-all">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Describe Symptoms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post your issue in plain words with photos, urgency level, and preferred service window. Exact address is masked for discovery.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-300 transition-all">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Explainable Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our engine immediately notifies nearby verified technicians based on matched skills, service radius, and real-time availability.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-300 transition-all">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Compare Proposals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare price, diagnostic approach, earliest arrival time, and verified ratings side-by-side. Choose the solution that fits best.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-300 transition-all">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Governed Workspace</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track job lifecycle milestones, approve price amendments before work begins, and confirm satisfactory completion before closure.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Service Categories Catalog */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Supported Problem Categories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore common service domains supported by verified professionals</p>
          </div>
          <Link to="/about" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Explore All in About →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {serviceCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {cat.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Typical Issues:</span>
                  <ul className="text-[11px] text-slate-600 space-y-0.5">
                    {cat.examples.map((ex, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-3">
                <Link to="/auth/login">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
