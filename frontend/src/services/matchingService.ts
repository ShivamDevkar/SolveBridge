// [DEV-ONLY FIXTURE]: Client-side matching engine prototype simulation.
// Does NOT execute server-side algorithms or production geospatial indexing.

import type { Problem } from '@/types/problem';
import type { MatchScoreBreakdown } from '@/types/proposal';

export interface MockProfessionalProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  category: string;
  skills: string[];
  coverageRadiusKm: number;
  verified: boolean;
  averageRating: number;
  completedJobsCount: number;
  experienceYears: number;
  responseTimeMinutes: number;
  bio: string;
  certifications: string[];
  ratingsBreakdown: {
    quality: number;
    professionalism: number;
    punctuality: number;
    value: number;
  };
  sampleReviews: Array<{
    id: string;
    customerName: string;
    rating: number;
    date: string;
    comment: string;
    jobTitle: string;
  }>;
}

/**
 * Seed Professional Profiles for Matching Engine and Public Profiles
 */
export const SEED_PROFESSIONALS: MockProfessionalProfile[] = [
  {
    id: 'user-demo-pro',
    name: 'Arun Kumar',
    businessName: 'Arun HVAC Services',
    email: 'pro.hvac@solvebid.demo',
    phone: '+91 98765 43211',
    city: 'Pune',
    neighborhood: 'Kothrud',
    category: 'Home Appliances & HVAC',
    skills: [
      'AC Gas Refill & Cooling',
      'Compressor Diagnostics',
      'Inverter PCB Repair',
      'Copper Pipe Brazing',
      'Condenser Coil Cleaning',
    ],
    coverageRadiusKm: 15,
    verified: true,
    averageRating: 4.85,
    completedJobsCount: 142,
    experienceYears: 8,
    responseTimeMinutes: 12,
    bio: 'Certified HVAC technician with 8+ years specializing in residential and commercial inverter split AC troubleshooting, compressor electrical diagnostics, and high-efficiency refrigerant recovery.',
    certifications: [
      'National Trade Certificate (NTC) — Refrigeration & Air Conditioning',
      'Certified Inverter AC Technician (Govt. Skill India)',
      'Background Audited & ID Verified',
    ],
    ratingsBreakdown: {
      quality: 4.9,
      professionalism: 4.9,
      punctuality: 4.8,
      value: 4.8,
    },
    sampleReviews: [
      {
        id: 'rev-01',
        customerName: 'Rahul Verma',
        rating: 5,
        date: '2026-10-28',
        comment:
          'Arun diagnosed our Daikin split AC humming issue within 15 minutes. Replaced the faulty capacitor and refrigerant level is back to optimal. Very transparent on pricing.',
        jobTitle: 'Split AC Compressor Capacitor Replacement',
      },
      {
        id: 'rev-02',
        customerName: 'Priya Joshi',
        rating: 4.8,
        date: '2026-10-15',
        comment:
          'Prompt response, arrived exactly at the scheduled time with all manifold gauges and leak detection tools. Highly recommend for HVAC work.',
        jobTitle: 'AC Jet Wash and Cooling Coil Descaling',
      },
    ],
  },
  {
    id: 'pro-coolpro',
    name: 'Rajesh Sharma',
    businessName: 'CoolPro Climate Care',
    email: 'rajesh.coolpro@solvebid.demo',
    phone: '+91 98765 43212',
    city: 'Pune',
    neighborhood: 'Baner',
    category: 'Home Appliances & HVAC',
    skills: [
      'AC Gas Refill & Cooling',
      'Condenser Jet Chemical Wash',
      'Electronic Blower Calibration',
      'Refrigerant Sniffer Test',
      'HVAC Duct Inspection',
    ],
    coverageRadiusKm: 18,
    verified: true,
    averageRating: 4.92,
    completedJobsCount: 89,
    experienceYears: 6,
    responseTimeMinutes: 18,
    bio: 'Founder of CoolPro Climate Care. Dedicated to precision climate diagnostics, electronic airflow calibration, and certified eco-friendly R32/R410A refrigerant handling.',
    certifications: [
      'Diploma in Mechanical Engineering (Refrigeration)',
      'Daikin & Voltas Factory Certified Technician',
      'Police Verification Cleared',
    ],
    ratingsBreakdown: {
      quality: 5.0,
      professionalism: 4.9,
      punctuality: 4.9,
      value: 4.8,
    },
    sampleReviews: [
      {
        id: 'rev-03',
        customerName: 'Anil Kulkarni',
        rating: 5,
        date: '2026-10-22',
        comment:
          'CoolPro provided an incredibly thorough diagnostic report with temperature delta photos before and after service. Room cooling is now icy cold.',
        jobTitle: 'Split AC Deep Foam Chemical Cleaning & Tuning',
      },
    ],
  },
  {
    id: 'pro-quickchill',
    name: 'Suresh Nair',
    businessName: 'QuickChill Solutions',
    email: 'suresh.quickchill@solvebid.demo',
    phone: '+91 98765 43213',
    city: 'Pune',
    neighborhood: 'Shivajinagar',
    category: 'Home Appliances & HVAC',
    skills: [
      'Compressor Diagnostics',
      'Drainage Pipe Unclogging',
      'Thermostat Replacement',
      'Washing Machine Motor Repair',
    ],
    coverageRadiusKm: 12,
    verified: true,
    averageRating: 4.65,
    completedJobsCount: 54,
    experienceYears: 5,
    responseTimeMinutes: 25,
    bio: 'Quick turnaround appliance repair specialist serving central Pune. Focuses on pragmatic electrical component fixes without unnecessary part replacements.',
    certifications: [
      'ITI Air Conditioning & Refrigeration Certification',
      'Verified Trade Professional',
    ],
    ratingsBreakdown: {
      quality: 4.6,
      professionalism: 4.7,
      punctuality: 4.6,
      value: 4.7,
    },
    sampleReviews: [
      {
        id: 'rev-04',
        customerName: 'Meera Deshmukh',
        rating: 4.5,
        date: '2026-10-18',
        comment:
          'Quick diagnosis and affordable pricing. Resolved our drain leakage without delay.',
        jobTitle: 'AC Drainage Water Leak Fix',
      },
    ],
  },
  {
    id: 'pro-ecocool',
    name: 'Vikram Deshmukh',
    businessName: 'EcoCool Services',
    email: 'vikram.ecocool@solvebid.demo',
    phone: '+91 98765 43214',
    city: 'Pune',
    neighborhood: 'Aundh',
    category: 'Home Appliances & HVAC',
    skills: ['AC Gas Refill & Cooling', 'Filter Cleaning', 'Window AC Servicing'],
    coverageRadiusKm: 10,
    verified: false, // Explicitly unverified to demonstrate badge contrast
    averageRating: 4.3,
    completedJobsCount: 18,
    experienceYears: 2,
    responseTimeMinutes: 45,
    bio: 'Independent technician offering budget-friendly appliance checkups and seasonal AC cleaning across Aundh and neighboring areas.',
    certifications: ['Basic Electrical Certificate (In Review)'],
    ratingsBreakdown: {
      quality: 4.3,
      professionalism: 4.4,
      punctuality: 4.2,
      value: 4.5,
    },
    sampleReviews: [
      {
        id: 'rev-05',
        customerName: 'Sanjay Shinde',
        rating: 4.2,
        date: '2026-10-05',
        comment: 'Good basic service for the price.',
        jobTitle: 'Window AC Routine Servicing',
      },
    ],
  },
  {
    id: 'pro-precision-elec',
    name: 'Mahesh Patil',
    businessName: 'Pune Precision Electricals',
    email: 'mahesh.elec@solvebid.demo',
    phone: '+91 98765 43215',
    city: 'Pune',
    neighborhood: 'Viman Nagar',
    category: 'Electrical Systems',
    skills: [
      'MCB & Distribution Board Rewiring',
      'Geyser & Water Heater Troubleshooting',
      'Short Circuit Diagnostics',
      'Earthing & Surge Protection',
    ],
    coverageRadiusKm: 20,
    verified: true,
    averageRating: 4.95,
    completedJobsCount: 210,
    experienceYears: 11,
    responseTimeMinutes: 10,
    bio: 'Licensed Wireman and Master Electrician. 11+ years resolving high-load tripping, residential electrical faults, and compliance safety inspections.',
    certifications: [
      'Licensed Electrical Wireman (Govt. of Maharashtra)',
      'Class B Electrical Contractor License',
      'Certified Energy & Safety Inspector',
    ],
    ratingsBreakdown: {
      quality: 5.0,
      professionalism: 5.0,
      punctuality: 4.9,
      value: 4.9,
    },
    sampleReviews: [
      {
        id: 'rev-06',
        customerName: 'Deepak Merchant',
        rating: 5,
        date: '2026-10-30',
        comment:
          'Identified a melted neutral link in our main DB board that had been causing MCB trips for weeks. Fixed it cleanly and re-balanced the phases.',
        jobTitle: 'Main Switchboard & MCB Load Balancing',
      },
    ],
  },
];

export interface MatchingResult {
  professional: MockProfessionalProfile;
  matchScore: MatchScoreBreakdown;
  distanceKm: number;
  eligible: boolean;
  matchReason: string;
}

class MatchingEngineService {
  private professionals: Map<string, MockProfessionalProfile> = new Map();

  constructor() {
    SEED_PROFESSIONALS.forEach((pro) => this.professionals.set(pro.id, pro));
  }

  /**
   * Calculates explainable simulated match score based on 5 weighted criteria:
   * 1. Skill Match: 30% weight
   * 2. Distance Match: 25% weight
   * 3. Availability Match: 20% weight
   * 4. Rating Match: 15% weight
   * 5. Response Speed Match: 10% weight
   */
  calculateMatchScore(
    problem: Problem,
    pro: MockProfessionalProfile,
    distanceKm: number
  ): MatchScoreBreakdown {
    // 1. Skill Match (30%)
    let skillScore = 70; // baseline for same category
    if (problem.category.toLowerCase().includes(pro.category.toLowerCase()) ||
        pro.category.toLowerCase().includes(problem.category.toLowerCase())) {
      skillScore = 85;
      // Check keyword overlap with problem description/title
      const problemText = `${problem.title} ${problem.description}`.toLowerCase();
      const matchingSkillsCount = pro.skills.filter((s) =>
        problemText.includes(s.toLowerCase().split(' ')[0])
      ).length;
      skillScore = Math.min(100, skillScore + matchingSkillsCount * 6);
    } else {
      skillScore = 40;
    }

    // 2. Distance Match (25%)
    let distanceScore = 100;
    if (distanceKm <= 3) {
      distanceScore = 98;
    } else if (distanceKm <= 6) {
      distanceScore = 90;
    } else if (distanceKm <= 10) {
      distanceScore = 82;
    } else if (distanceKm <= pro.coverageRadiusKm) {
      distanceScore = 70;
    } else {
      distanceScore = Math.max(20, Math.round(100 - (distanceKm - pro.coverageRadiusKm) * 8));
    }

    // 3. Availability Match (20%)
    // Pro availability based on verification and schedule readiness
    const availabilityScore = pro.verified ? 95 : 80;

    // 4. Rating Match (15%)
    // Scale 5.0 rating to 100
    const ratingScore = Math.round((pro.averageRating / 5.0) * 100);

    // 5. Response Speed Match (10%)
    // Under 15 mins -> 95+, under 30 mins -> 85, over 30 mins -> 70
    const responseSpeedScore =
      pro.responseTimeMinutes <= 15 ? 98 : pro.responseTimeMinutes <= 30 ? 86 : 72;

    // Compute weighted composite overall score
    const overall = Math.round(
      skillScore * 0.3 +
        distanceScore * 0.25 +
        availabilityScore * 0.2 +
        ratingScore * 0.15 +
        responseSpeedScore * 0.1
    );

    return {
      overall,
      skillMatch: Math.round(skillScore),
      distanceMatch: Math.round(distanceScore),
      availabilityMatch: Math.round(availabilityScore),
      ratingMatch: Math.round(ratingScore),
      responseSpeedMatch: Math.round(responseSpeedScore),
    };
  }

  /**
   * Discovers matching professionals for a customer problem request.
   */
  async findMatchingProfessionals(problem: Problem): Promise<MatchingResult[]> {
    const results: MatchingResult[] = [];

    const problemDist = problem.location.distanceKm || 3.5;

    for (const pro of this.professionals.values()) {
      // Check trade category compatibility
      const categoryMatch =
        pro.category.toLowerCase().includes(problem.category.toLowerCase()) ||
        problem.category.toLowerCase().includes(pro.category.toLowerCase()) ||
        problem.category === 'General Diagnosis';

      if (!categoryMatch) {
        continue;
      }

      // Compute simulated distance between pro neighborhood and problem
      let distanceKm = problemDist;
      if (pro.neighborhood.toLowerCase() === problem.location.neighborhood.toLowerCase()) {
        distanceKm = Math.min(problemDist, 2.4);
      } else {
        distanceKm = Math.round((problemDist + (pro.id.charCodeAt(pro.id.length - 1) % 4)) * 10) / 10;
      }

      const matchScore = this.calculateMatchScore(problem, pro, distanceKm);
      const eligible = distanceKm <= pro.coverageRadiusKm;

      let matchReason = 'High skill and proximity match for diagnostic symptoms';
      if (matchScore.overall >= 92) {
        matchReason = 'Top Tier Match — Local neighborhood contractor with 90%+ specialized skill match';
      } else if (matchScore.overall >= 85) {
        matchReason = 'Strong Match — Verified specialist within standard service radius';
      } else {
        matchReason = 'Eligible Match — Available for scheduled diagnostic inspection';
      }

      results.push({
        professional: pro,
        matchScore,
        distanceKm,
        eligible,
        matchReason,
      });
    }

    // Sort descending by overall match score
    results.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

    return results;
  }

  /**
   * Retrieves an individual professional profile by ID
   */
  async getProfessionalById(proId: string): Promise<MockProfessionalProfile | null> {
    const found = this.professionals.get(proId);
    return found ? { ...found } : null;
  }

  /**
   * Retrieves all registered mock professionals
   */
  async getAllProfessionals(): Promise<MockProfessionalProfile[]> {
    return Array.from(this.professionals.values());
  }
}

export const matchingService = new MatchingEngineService();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_matching_service = matchingService;
}
