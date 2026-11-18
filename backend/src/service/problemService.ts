import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import {
  coordinatesForCity,
  haversineDistanceKm,
  type Coordinates,
} from "../utils/geo";
import { formatTimeWindow, parseTimeWindow } from "../utils/timeWindow";
import { createNotifications } from "./notificationService";
import type { Prisma } from "../../generated/prisma/client";
import type { ProblemStatus, Role } from "../../generated/prisma/enums";

/** Problem lifetime before it stops appearing in professional search. */
const PROBLEM_EXPIRY_DAYS = 7;
/** Maximum professionals notified per newly posted problem. */
const MAX_PROBLEM_NOTIFICATIONS = 50;
const MAX_IMAGES_PER_PROBLEM = 5;

const PAISE_PER_RUPEE = 100;

type UrgencyValue = "NORMAL" | "SOON" | "URGENT";

export interface ProblemInput {
  title: string;
  description: string;
  urgency: UrgencyValue;
  /** Rupees; stored as integer paise. */
  budgetMin?: number;
  budgetMax?: number;
  /** "YYYY-MM-DD"; null clears the field. */
  preferredDate?: string | null;
  /** Human string such as "Morning (08:00 AM - 12:00 PM)"; parsed server-side. Null clears. */
  preferredTimeWindow?: string | null;
  city: string;
  neighborhood: string;
  landmark?: string;
  images?: string[];
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
}

export interface ProblemListQuery {
  page: number;
  pageSize: number;
  status?: ProblemStatus;
  urgency?: UrgencyValue;
  /** Category slug or UUID. */
  category?: string;
  search?: string;
}

export interface Viewer {
  id: string;
  role: Role;
}

export interface SerializedProblem {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: { id: string; name: string; slug: string };
  urgency: UrgencyValue;
  status: string;
  location: {
    maskedAddress: string;
    fullAddress: string | null;
    city: string;
    neighborhood: string;
  };
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null;
  preferredTimeWindow: string;
  images: string[];
  proposalsCount: number;
  customerName: string;
  distanceKm: number | null;
  hasProposed: boolean;
  expiresAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createCustomerProblem(
  customerId: string,
  input: ProblemInput,
): Promise<SerializedProblem> {
  const category = await resolveCategory(input);

  const coordinates = coordinatesForCity(input.city);
  const times = input.preferredTimeWindow
    ? parseTimeWindow(input.preferredTimeWindow)
    : { start: null, end: null };
  const expiresAt = new Date(
    Date.now() + PROBLEM_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  const problem = await prisma.problem.create({
    data: {
      customerId,
      categoryId: category.id,
      title: input.title,
      description: input.description,
      urgency: input.urgency,
      budgetMin: rupeesToPaise(input.budgetMin),
      budgetMax: rupeesToPaise(input.budgetMax),
      preferredDate: input.preferredDate
        ? new Date(`${input.preferredDate}T00:00:00.000Z`)
        : null,
      preferredTimeStart: times.start ? timeToDate(times.start) : null,
      preferredTimeEnd: times.end ? timeToDate(times.end) : null,
      address: buildAddress(input.neighborhood, input.city, input.landmark),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      expiresAt,
      images: {
        create: (input.images ?? [])
          .slice(0, MAX_IMAGES_PER_PROBLEM)
          .map((imageUrl) => ({
            imageUrl,
          })),
      },
    },
    include: problemInclude,
  });

  await notifyNearbyProfessionals({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    title: problem.title,
  });

  return serializeProblem(problem, { id: customerId, role: "CUSTOMER" });
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function listProblemsForViewer(
  viewer: Viewer,
  query: ProblemListQuery,
): Promise<{ problems: SerializedProblem[]; pagination: Pagination }> {
  const where = buildListWhere(viewer, query);
  const professionalProfileId =
    viewer.role === "PROFESSIONAL"
      ? await getProfessionalProfileId(viewer.id)
      : null;
  const proCoordinates =
    viewer.role === "PROFESSIONAL"
      ? await getProfessionalCoordinates(viewer.id)
      : null;

  const [problems, total] = await prisma.$transaction([
    prisma.problem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: problemInclude,
    }),
    prisma.problem.count({ where }),
  ]);

  // Which of the returned problems the current professional proposed on.
  let proposedProblemIds = new Set<string>();
  if (professionalProfileId && problems.length > 0) {
    const ownProposals = await prisma.proposal.findMany({
      where: {
        professionalId: professionalProfileId,
        problemId: { in: problems.map((problem) => problem.id) },
      },
      select: { problemId: true },
    });
    proposedProblemIds = new Set(
      ownProposals.map((proposal) => proposal.problemId),
    );
  }

  return {
    problems: problems.map((problem) =>
      serializeProblem(
        problem,
        viewer,
        professionalProfileId,
        proCoordinates,
        proposedProblemIds.has(problem.id) ? problem.id : null,
      ),
    ),
    pagination: paginate(query.page, query.pageSize, total),
  };
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export async function getProblemForViewer(
  problemId: string,
  viewer: Viewer,
): Promise<SerializedProblem> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { ...problemInclude, job: { select: { professionalId: true } } },
  });

  if (!problem || problem.deletedAt) {
    throw ApiError.notFound("Problem not found");
  }

  if (viewer.role === "CUSTOMER") {
    if (problem.customerId !== viewer.id) {
      // Do not reveal that someone else's problem exists.
      throw ApiError.notFound("Problem not found");
    }
    return serializeProblem(problem, viewer);
  }

  if (viewer.role === "ADMIN") {
    return serializeProblem(problem, viewer);
  }

  // Professional: can inspect open problems, problems they proposed on, and
  // problems where they hold the job.
  const professionalProfileId = await getProfessionalProfileId(viewer.id);
  if (!professionalProfileId) {
    throw ApiError.notFound("Problem not found");
  }

  const ownProposal = await prisma.proposal.findFirst({
    where: { problemId: problem.id, professionalId: professionalProfileId },
    select: { id: true },
  });

  const holdsJob = problem.job?.professionalId === professionalProfileId;
  const isAvailable =
    ["OPEN", "PROPOSALS_RECEIVED"].includes(problem.status) &&
    problem.expiresAt > new Date();

  if (!ownProposal && !holdsJob && !isAvailable) {
    throw ApiError.notFound("Problem not found");
  }

  const proCoordinates = await getProfessionalCoordinates(viewer.id);
  return serializeProblem(
    problem,
    viewer,
    professionalProfileId,
    proCoordinates,
    ownProposal?.id ?? null,
  );
}

// ---------------------------------------------------------------------------
// Update (owner, while open)
// ---------------------------------------------------------------------------

export async function updateCustomerProblem(
  problemId: string,
  customerId: string,
  input: Partial<ProblemInput>,
): Promise<SerializedProblem> {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });

  if (!problem || problem.deletedAt) {
    throw ApiError.notFound("Problem not found");
  }
  if (problem.customerId !== customerId) {
    throw ApiError.notFound("Problem not found");
  }
  if (problem.status !== "OPEN") {
    throw ApiError.conflict("Only open problems can be edited");
  }

  let categoryId = problem.categoryId;
  if (input.categoryId || input.categorySlug || input.categoryName) {
    categoryId = (await resolveCategory(input as ProblemInput)).id;
  }

  let address = problem.address;
  let latitude = problem.latitude;
  let longitude = problem.longitude;
  if (input.neighborhood || input.city) {
    const city = input.city ?? extractCityFromAddress(problem.address) ?? "";
    const neighborhood =
      input.neighborhood ?? extractNeighborhood(problem.address) ?? "";
    address = buildAddress(neighborhood, city, input.landmark);
    const coordinates = coordinatesForCity(city);
    latitude = coordinates.latitude;
    longitude = coordinates.longitude;
  }

  const times =
    input.preferredTimeWindow !== undefined
      ? input.preferredTimeWindow
        ? parseTimeWindow(input.preferredTimeWindow)
        : { start: null, end: null }
      : null;

  const updated = await prisma.problem.update({
    where: { id: problemId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.urgency !== undefined ? { urgency: input.urgency } : {}),
      ...(input.budgetMin !== undefined
        ? { budgetMin: rupeesToPaise(input.budgetMin) }
        : {}),
      ...(input.budgetMax !== undefined
        ? { budgetMax: rupeesToPaise(input.budgetMax) }
        : {}),
      ...(input.preferredDate !== undefined
        ? {
            preferredDate: input.preferredDate
              ? new Date(`${input.preferredDate}T00:00:00.000Z`)
              : null,
          }
        : {}),
      ...(times
        ? {
            preferredTimeStart: times.start ? timeToDate(times.start) : null,
            preferredTimeEnd: times.end ? timeToDate(times.end) : null,
          }
        : {}),
      ...(input.neighborhood || input.city
        ? { address, latitude, longitude }
        : {}),
      ...(categoryId !== problem.categoryId ? { categoryId } : {}),
      ...(input.images
        ? {
            images: {
              deleteMany: {},
              create: input.images
                .slice(0, MAX_IMAGES_PER_PROBLEM)
                .map((imageUrl) => ({ imageUrl })),
            },
          }
        : {}),
    },
    include: problemInclude,
  });

  return serializeProblem(updated, { id: customerId, role: "CUSTOMER" });
}

// ---------------------------------------------------------------------------
// Cancel (owner)
// ---------------------------------------------------------------------------

const CANCELLABLE_STATUSES = new Set([
  "OPEN",
  "MATCHING",
  "PROPOSALS_RECEIVED",
]);

export async function cancelCustomerProblem(
  problemId: string,
  customerId: string,
): Promise<SerializedProblem> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { job: { select: { id: true } } },
  });

  if (!problem || problem.deletedAt) {
    throw ApiError.notFound("Problem not found");
  }
  if (problem.customerId !== customerId) {
    throw ApiError.notFound("Problem not found");
  }
  if (problem.job) {
    throw ApiError.conflict(
      "This problem already has a job and cannot be cancelled",
    );
  }
  if (!CANCELLABLE_STATUSES.has(problem.status)) {
    throw ApiError.conflict(
      `A ${problem.status.toLowerCase()} problem cannot be cancelled`,
    );
  }

  const cancelled = await prisma.problem.update({
    where: { id: problemId },
    data: { status: "CANCELLED" },
    include: problemInclude,
  });

  return serializeProblem(cancelled, { id: customerId, role: "CUSTOMER" });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const problemInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { select: { imageUrl: true } },
  customer: { select: { firstName: true, lastName: true } },
  _count: { select: { proposals: true } },
} as const;

interface ProblemWithIncludes {
  id: string;
  title: string;
  description: string;
  status: string;
  urgency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: Date | null;
  preferredTimeStart: Date | null;
  preferredTimeEnd: Date | null;
  address: string;
  latitude: number;
  longitude: number;
  expiresAt: Date;
  createdAt: Date;
  customerId: string;
  category: { id: string; name: string; slug: string };
  images: Array<{ imageUrl: string }>;
  customer: { firstName: string; lastName: string };
  _count: { proposals: number };
  proposals?: Array<{ id: string }>;
}

function serializeProblem(
  problem: ProblemWithIncludes,
  viewer: Viewer,
  professionalProfileId: string | null = null,
  proCoordinates: Coordinates | null = null,
  ownProposalId: string | null = null,
): SerializedProblem {
  const isOwner =
    viewer.role !== "PROFESSIONAL" && problem.customerId === viewer.id;
  const isProfessional = viewer.role === "PROFESSIONAL";

  const distanceKm =
    isProfessional && proCoordinates
      ? Math.round(
          haversineDistanceKm(proCoordinates, {
            latitude: problem.latitude,
            longitude: problem.longitude,
          }) * 10,
        ) / 10
      : null;

  return {
    id: problem.id,
    customerId: problem.customerId,
    title: problem.title,
    description: problem.description,
    category: problem.category,
    urgency: problem.urgency as UrgencyValue,
    status: problem.status,
    location: {
      maskedAddress: maskAddress(problem.address),
      fullAddress: isOwner || viewer.role === "ADMIN" ? problem.address : null,
      city: extractCityFromAddress(problem.address) ?? "",
      neighborhood: extractNeighborhood(problem.address) ?? "",
    },
    budgetMin: paiseToRupees(problem.budgetMin),
    budgetMax: paiseToRupees(problem.budgetMax),
    preferredDate: problem.preferredDate
      ? toDateString(problem.preferredDate)
      : null,
    preferredTimeWindow: formatTimeWindow(
      problem.preferredTimeStart
        ? toTimeString(problem.preferredTimeStart)
        : null,
      problem.preferredTimeEnd ? toTimeString(problem.preferredTimeEnd) : null,
    ),
    images: problem.images.map((image) => image.imageUrl),
    proposalsCount: problem._count.proposals,
    customerName: isProfessional
      ? `${problem.customer.firstName} ${problem.customer.lastName.charAt(0)}.`
      : `${problem.customer.firstName} ${problem.customer.lastName}`,
    distanceKm,
    hasProposed: isProfessional ? Boolean(ownProposalId) : false,
    expiresAt: problem.expiresAt.toISOString(),
    createdAt: problem.createdAt.toISOString(),
  };
}

async function resolveCategory(input: {
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
}) {
  if (input.categoryId) {
    const byId = await prisma.serviceCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (byId?.isActive) return byId;
    throw ApiError.badRequest("Unknown service category");
  }

  if (input.categorySlug) {
    const bySlug = await prisma.serviceCategory.findUnique({
      where: { slug: input.categorySlug },
    });
    if (bySlug?.isActive) return bySlug;
    throw ApiError.badRequest("Unknown service category");
  }

  if (input.categoryName) {
    const byName = await prisma.serviceCategory.findUnique({
      where: { name: input.categoryName },
    });
    if (byName?.isActive) return byName;
    throw ApiError.badRequest("Unknown service category");
  }

  throw ApiError.badRequest("A service category is required");
}

function buildListWhere(
  viewer: Viewer,
  query: ProblemListQuery,
): Prisma.ProblemWhereInput {
  const now = new Date();

  if (viewer.role === "CUSTOMER") {
    return {
      customerId: viewer.id,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.urgency ? { urgency: query.urgency } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  if (viewer.role === "PROFESSIONAL") {
    // Professionals see open problems and problems that already received
    // proposals from others (competitive bidding), until one is accepted.
    return {
      status: { in: ["OPEN", "PROPOSALS_RECEIVED"] },
      expiresAt: { gt: now },
      deletedAt: null,
      category: { isActive: true },
      ...(query.urgency ? { urgency: query.urgency } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { description: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  // Admin: everything, optional filters.
  return {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.urgency ? { urgency: query.urgency } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search } },
            { description: { contains: query.search } },
          ],
        }
      : {}),
  };
}

async function notifyNearbyProfessionals(problem: {
  latitude: number;
  longitude: number;
  title: string;
}): Promise<void> {
  const profiles = await prisma.professionalProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    select: {
      userId: true,
      baseLatitude: true,
      baseLongitude: true,
      serviceRadius: true,
    },
  });

  const targets = profiles
    .filter(
      (profile) =>
        profile.baseLatitude !== null &&
        profile.baseLongitude !== null &&
        haversineDistanceKm(
          { latitude: profile.baseLatitude, longitude: profile.baseLongitude },
          { latitude: problem.latitude, longitude: problem.longitude },
        ) <= profile.serviceRadius,
    )
    .slice(0, MAX_PROBLEM_NOTIFICATIONS)
    .map((profile) => ({
      userId: profile.userId,
      title: "New problem in your area",
      message: `A new "${problem.title}" problem was posted nearby. Submit a proposal.`,
      type: "PROBLEM_MATCHED" as const,
      linkUrl: "/pro/matching-problems",
    }));

  await createNotifications(targets);
}

async function getProfessionalProfileId(
  userId: string,
): Promise<string | null> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

async function getProfessionalCoordinates(
  userId: string,
): Promise<Coordinates | null> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { baseLatitude: true, baseLongitude: true },
  });

  if (!profile?.baseLatitude || !profile?.baseLongitude) {
    return null;
  }

  return { latitude: profile.baseLatitude, longitude: profile.baseLongitude };
}

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

function buildAddress(
  neighborhood: string,
  city: string,
  landmark?: string,
): string {
  const base = `${neighborhood}, ${city}`;
  return landmark ? `${base} (${landmark})` : base;
}

/** Strips the "(landmark)" suffix so professionals only see the coarse area. */
export function maskAddress(address: string): string {
  return address.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function extractNeighborhood(address: string): string | null {
  const commaIndex = address.indexOf(",");
  return commaIndex > 0 ? address.slice(0, commaIndex).trim() : null;
}

function extractCityFromAddress(address: string): string | null {
  const withoutLandmark = maskAddress(address);
  const commaIndex = withoutLandmark.indexOf(",");
  return commaIndex > 0 ? withoutLandmark.slice(commaIndex + 1).trim() : null;
}

function rupeesToPaise(rupees: number | undefined | null): number | null {
  if (rupees === undefined || rupees === null) return null;
  return Math.round(rupees * PAISE_PER_RUPEE);
}

function paiseToRupees(paise: number | null | undefined): number | null {
  if (paise === null || paise === undefined) return null;
  return paise / PAISE_PER_RUPEE;
}

function timeToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

function toTimeString(date: Date): string {
  return date.toISOString().slice(11, 16);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate(
  page: number,
  pageSize: number,
  total: number,
): Pagination {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
