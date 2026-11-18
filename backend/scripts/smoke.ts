// End-to-end smoke tests for the SolveBridge backend API.
// Usage: npm run smoke
//
// Creates (or reuses) two Supabase test accounts — a customer and a
// professional — then exercises the implemented endpoints of every phase.
// Exits non-zero if any check fails.
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/config/prisma";
import type { NotificationType } from "../generated/prisma/enums";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:4000";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in backend/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CUSTOMER_EMAIL = process.env.SMOKE_CUSTOMER_EMAIL ?? "sb.smoke.customer@gmail.com";
const PRO_EMAIL = process.env.SMOKE_PRO_EMAIL ?? "sb.smoke.pro@gmail.com";
const PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? "SbTest!2026";

const CUSTOMER_PROFILE = {
  role: "CUSTOMER",
  firstName: "Test",
  lastName: "Customer",
  phone: "+919000000001",
};

const PRO_PROFILE = {
  role: "PROFESSIONAL",
  firstName: "Test",
  lastName: "Pro",
  phone: "+919000000002",
  businessName: "Smoke Test Services",
  coverageRadius: 15,
};

const PRO_EMAIL_2 = process.env.SMOKE_PRO2_EMAIL ?? "sb.smoke.pro2@gmail.com";

const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "sb.smoke.admin@gmail.com";

const ADMIN_PROFILE = {
  role: "ADMIN",
  firstName: "Smoke",
  lastName: "Admin",
};

const PRO_PROFILE_2 = {
  role: "PROFESSIONAL",
  firstName: "Test",
  lastName: "Pro Two",
  phone: "+919000000003",
  businessName: "Smoke Test Services Two",
  coverageRadius: 15,
};

/** Pune city centre — matches coordinatesForCity("Pune") so distance math is testable. */
const PUNE = { latitude: 18.5204, longitude: 73.8567 };

interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function check(name: string, pass: boolean, detail?: string): void {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

interface ApiResponse {
  status: number;
  json: any;
}

async function api(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // non-JSON body
  }

  return { status: response.status, json };
}

interface Account {
  token: string;
  userId: string;
}

async function ensureAccount(
  email: string,
  profile: Record<string, unknown>,
): Promise<Account | null> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: PASSWORD,
    options: { data: profile },
  });

  if (signUpError && !/already registered|already exists/i.test(signUpError.message)) {
    console.error(`Sign-up failed for ${email}: ${signUpError.message}`);
    return null;
  }

  const needsConfirmation = Boolean(signUpData?.user && !signUpData?.session);
  if (needsConfirmation) {
    console.error(
      `\nEmail confirmation appears to be enabled. Confirm ${email} in the ` +
        `Supabase dashboard (or disable confirmation), then re-run the smoke tests.\n`,
    );
    return null;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: PASSWORD,
  });

  if (signInError || !signInData.session) {
    console.error(`Sign-in failed for ${email}: ${signInError?.message ?? "no session"}`);
    return null;
  }

  return { token: signInData.session.access_token, userId: signInData.user.id };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * The public sync endpoint only allows CUSTOMER/PROFESSIONAL, so the admin
 * fixture is promoted directly in the database after sign-up.
 */
async function ensureAdminAccount(): Promise<Account | null> {
  const account = await ensureAccount(ADMIN_EMAIL, ADMIN_PROFILE);
  if (!account) return null;

  await prisma.user.upsert({
    where: { id: account.userId },
    create: {
      id: account.userId,
      role: "ADMIN",
      firstName: ADMIN_PROFILE.firstName,
      lastName: ADMIN_PROFILE.lastName,
    },
    update: { role: "ADMIN", status: "ACTIVE", deletedAt: null },
  });

  return account;
}

async function phase1(customer: Account | null, pro: Account | null): Promise<void> {
  console.log("\n=== Phase 1: foundation, categories, notifications ===\n");

  // Health
  const health = await api("/api/v1/health");
  check("health endpoint ok", health.status === 200 && health.json?.success === true && health.json?.data?.database === "connected", JSON.stringify(health.json));

  // Public categories
  const categories = await api("/api/v1/categories");
  const list: any[] = categories.json?.data?.categories ?? [];
  check("categories endpoint ok", categories.status === 200 && categories.json?.success === true, JSON.stringify(categories.json));
  check("categories seeded (>0)", list.length > 0, `count=${list.length}`);
  check(
    "categories shape valid",
    list.every((c) => isUuid(c.id) && typeof c.name === "string" && typeof c.slug === "string" && Array.isArray(c.skills)),
  );
  check("plumbing category present", list.some((c) => c.slug === "plumbing"));

  if (!customer || !pro) {
    return;
  }

  // Profile sync
  const customerSync = await api("/api/v1/auth/sync", { method: "POST", token: customer.token, body: CUSTOMER_PROFILE });
  check("customer sync ok", customerSync.status === 200 && customerSync.json?.data?.user?.role === "CUSTOMER", JSON.stringify(customerSync.json));
  check("customer sync echoes email", customerSync.json?.data?.email === CUSTOMER_EMAIL);

  const proSync = await api("/api/v1/auth/sync", { method: "POST", token: pro.token, body: PRO_PROFILE });
  check(
    "professional sync ok",
    proSync.status === 200 && proSync.json?.data?.user?.role === "PROFESSIONAL",
    JSON.stringify(proSync.json),
  );
  check(
    "professional profile created/updated",
    proSync.json?.data?.user?.professionalProfile?.businessName === PRO_PROFILE.businessName &&
      proSync.json?.data?.user?.professionalProfile?.serviceRadius === PRO_PROFILE.coverageRadius,
    JSON.stringify(proSync.json?.data?.user?.professionalProfile),
  );

  const me = await api("/api/v1/auth/me", { token: customer.token });
  check("auth/me returns synced user", me.status === 200 && me.json?.data?.user?.role === "CUSTOMER", JSON.stringify(me.json));

  // Validation errors
  const badSync = await api("/api/v1/auth/sync", { method: "POST", token: customer.token, body: { role: "CUSTOMER" } });
  check(
    "sync rejects missing names with 400 VALIDATION_ERROR",
    badSync.status === 400 && badSync.json?.code === "VALIDATION_ERROR",
    JSON.stringify(badSync.json),
  );

  const badRadius = await api("/api/v1/auth/sync", {
    method: "POST",
    token: pro.token,
    body: { ...PRO_PROFILE, coverageRadius: 500 },
  });
  check(
    "sync rejects out-of-range radius",
    badRadius.status === 400 && badRadius.json?.code === "VALIDATION_ERROR",
    JSON.stringify(badRadius.json),
  );

  // Notifications: auth required
  const noToken = await api("/api/v1/notifications");
  check("notifications require auth", noToken.status === 401, JSON.stringify(noToken.json));

  // Seed a real notification row for the customer through Prisma, then verify
  // the API surfaces and marks it read.
  const seeded = await prisma.notification.create({
    data: {
      userId: customer.userId,
      title: "Smoke test notification",
      message: "Created by scripts/smoke.ts",
      type: "SYSTEM",
    },
  });

  const listNotifications = await api("/api/v1/notifications", { token: customer.token });
  const notificationList: any[] = listNotifications.json?.data?.notifications ?? [];
  check(
    "customer sees seeded notification",
    listNotifications.status === 200 &&
      notificationList.some((n) => n.id === seeded.id && n.isRead === false),
    JSON.stringify(listNotifications.json),
  );
  check(
    "unreadCount reflects unread notification",
    (listNotifications.json?.data?.unreadCount ?? 0) >= 1,
    `unreadCount=${listNotifications.json?.data?.unreadCount}`,
  );
  check(
    "pagination block present",
    typeof listNotifications.json?.data?.pagination?.total === "number" &&
      typeof listNotifications.json?.data?.pagination?.totalPages === "number",
  );

  // Professional must not see the customer's notification
  const proList = await api("/api/v1/notifications", { token: pro.token });
  const proListIds: string[] = (proList.json?.data?.notifications ?? []).map((n: any) => n.id);
  check("professional cannot see customer's notification", !proListIds.includes(seeded.id));

  // Cross-user mark-read must 404
  const foreignRead = await api(`/api/v1/notifications/${seeded.id}/read`, { method: "POST", token: pro.token });
  check("foreign notification mark-read returns 404", foreignRead.status === 404 && foreignRead.json?.code === "NOT_FOUND", JSON.stringify(foreignRead.json));

  // Unknown id mark-read must 404
  const unknownRead = await api(`/api/v1/notifications/${crypto.randomUUID()}/read`, { method: "POST", token: customer.token });
  check("unknown notification mark-read returns 404", unknownRead.status === 404, JSON.stringify(unknownRead.json));

  // Own mark-read works and is idempotent
  const markRead = await api(`/api/v1/notifications/${seeded.id}/read`, { method: "POST", token: customer.token });
  check("own notification mark-read ok", markRead.status === 200 && markRead.json?.data?.isRead === true, JSON.stringify(markRead.json));
  const afterRead = await api("/api/v1/notifications", { token: customer.token });
  const readNotification: any = (afterRead.json?.data?.notifications ?? []).find((n: any) => n.id === seeded.id);
  check("notification is read after mark-read", readNotification?.isRead === true);

  // Read-all
  const readAll = await api("/api/v1/notifications/read-all", { method: "POST", token: customer.token });
  check("read-all ok", readAll.status === 200 && typeof readAll.json?.data?.updated === "number", JSON.stringify(readAll.json));
  const afterReadAll = await api("/api/v1/notifications?unreadOnly=true", { token: customer.token });
  check("no unread remain after read-all", (afterReadAll.json?.data?.notifications ?? []).length === 0, JSON.stringify(afterReadAll.json?.data));

  // Clean up the seeded notification so repeated runs stay tidy.
  await prisma.notification.delete({ where: { id: seeded.id } });
}

// ---------------------------------------------------------------------------
// Phase 2: problems
// ---------------------------------------------------------------------------

interface CreatedProblem {
  id: string;
  [key: string]: any;
}

async function phase2(customer: Account, pro: Account): Promise<void> {
  console.log("\n=== Phase 2: problems ===\n");

  // Idempotent cleanup of earlier runs.
  await prisma.problem.deleteMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P2" } },
  });

  // Give the professional base coordinates so distance + radius notifications
  // are exercisable.
  await prisma.professionalProfile.update({
    where: { userId: pro.userId },
    data: { baseLatitude: PUNE.latitude, baseLongitude: PUNE.longitude },
  });

  const createPayload = {
    title: "SMOKE-P2 Leaking kitchen tap needs urgent repair",
    description: "The kitchen tap has been leaking for two days and water is pooling under the sink.",
    categorySlug: "plumbing",
    urgency: "URGENT",
    budgetMin: 500,
    budgetMax: 1500,
    preferredDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    preferredTimeWindow: "Morning (08:00 AM - 12:00 PM)",
    city: "Pune",
    neighborhood: "Kothrud",
    landmark: "Near Sayaji Hotel",
    images: ["https://example.com/tap.jpg"],
  };

  const created = await api("/api/v1/problems", { method: "POST", token: customer.token, body: createPayload });
  const problem: CreatedProblem | undefined = created.json?.data?.problem;
  check("problem created", created.status === 201 && Boolean(problem?.id && isUuid(problem.id)), JSON.stringify(created.json));
  if (!problem) return;

  check("problem status OPEN", problem.status === "OPEN");
  check("budgets echoed in rupees", problem.budgetMin === 500 && problem.budgetMax === 1500, JSON.stringify({ budgetMin: problem.budgetMin, budgetMax: problem.budgetMax }));
  check(
    "address composed + masked correctly",
    problem.location?.maskedAddress === "Kothrud, Pune" &&
      problem.location?.fullAddress === "Kothrud, Pune (Near Sayaji Hotel)",
    JSON.stringify(problem.location),
  );
  check("time window parsed", problem.preferredTimeWindow === "08:00 - 12:00", problem.preferredTimeWindow);
  check("preferred date echoed", problem.preferredDate === createPayload.preferredDate, problem.preferredDate);
  check("images stored", problem.images?.length === 1 && problem.images[0] === "https://example.com/tap.jpg");
  check("owner sees own name", problem.customerName === "Test Customer", problem.customerName);
  check("category resolved from slug", problem.category?.slug === "plumbing", JSON.stringify(problem.category));

  // Nearby-professional notification pipeline (pro is 0 km from the problem).
  const proNotifications = await api("/api/v1/notifications", { token: pro.token });
  const matched = (proNotifications.json?.data?.notifications ?? []).find(
    (n: any) => n.type === "PROBLEM_MATCHED" && n.message.includes(problem.title),
  );
  check("professional notified of new nearby problem", Boolean(matched), JSON.stringify(proNotifications.json?.data?.notifications?.slice(0, 3)));

  // Validation errors
  const shortTitle = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: { ...createPayload, title: "tiny" },
  });
  check("short title rejected", shortTitle.status === 400 && shortTitle.json?.code === "VALIDATION_ERROR", JSON.stringify(shortTitle.json));

  const badCategory = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: { ...createPayload, categorySlug: "does-not-exist" },
  });
  check("unknown category rejected", badCategory.status === 400 && badCategory.json?.message === "Unknown service category", JSON.stringify(badCategory.json));

  const badBudget = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: { ...createPayload, budgetMin: 2000, budgetMax: 1000 },
  });
  check("budgetMax < budgetMin rejected", badBudget.status === 400, JSON.stringify(badBudget.json));

  // Role restriction
  const proCreate = await api("/api/v1/problems", { method: "POST", token: pro.token, body: createPayload });
  check("professional cannot create problems", proCreate.status === 403, JSON.stringify(proCreate.json));

  // Customer list
  const customerList = await api("/api/v1/problems", { token: customer.token });
  const customerItems: any[] = customerList.json?.data?.problems ?? [];
  check("customer list contains own problem", customerItems.some((p) => p.id === problem.id));
  check(
    "customer list pagination",
    typeof customerList.json?.data?.pagination?.total === "number" &&
      typeof customerList.json?.data?.pagination?.totalPages === "number",
  );

  const searchList = await api("/api/v1/problems?search=leaking", { token: customer.token });
  check("search filter finds problem", (searchList.json?.data?.problems ?? []).some((p: any) => p.id === problem.id));

  const wrongSearch = await api("/api/v1/problems?search=zzz-not-there", { token: customer.token });
  check("search filter excludes", !(wrongSearch.json?.data?.problems ?? []).some((p: any) => p.id === problem.id));

  // Professional available list
  const proList = await api("/api/v1/problems", { token: pro.token });
  const proItems: any[] = proList.json?.data?.problems ?? [];
  const proView = proItems.find((p) => p.id === problem.id);
  check("professional sees available problem", Boolean(proView));
  check("pro view has no full address", proView && proView.location?.fullAddress === null, JSON.stringify(proView?.location));
  check("pro view hasProposed false", proView?.hasProposed === false);
  check("pro distance computed", proView?.distanceKm === 0, `distanceKm=${proView?.distanceKm}`);
  check("pro sees masked customer name", proView?.customerName === "Test C.", proView?.customerName);

  // Detail views
  const proDetail = await api(`/api/v1/problems/${problem.id}`, { token: pro.token });
  check("pro detail ok", proDetail.status === 200 && proDetail.json?.data?.problem?.location?.fullAddress === null, JSON.stringify(proDetail.json));

  const customerDetail = await api(`/api/v1/problems/${problem.id}`, { token: customer.token });
  check("owner detail has full address", customerDetail.status === 200 && customerDetail.json?.data?.problem?.location?.fullAddress === "Kothrud, Pune (Near Sayaji Hotel)", JSON.stringify(customerDetail.json));

  const unknownDetail = await api(`/api/v1/problems/${crypto.randomUUID()}`, { token: customer.token });
  check("unknown problem detail 404", unknownDetail.status === 404);

  // Update
  const updated = await api(`/api/v1/problems/${problem.id}`, {
    method: "PATCH",
    token: customer.token,
    body: { title: "SMOKE-P2 Leaking kitchen tap — retitled", budgetMax: 1800 },
  });
  check(
    "owner update works",
    updated.status === 200 &&
      updated.json?.data?.problem?.title === "SMOKE-P2 Leaking kitchen tap — retitled" &&
      updated.json?.data?.problem?.budgetMax === 1800,
    JSON.stringify(updated.json),
  );

  const proUpdate = await api(`/api/v1/problems/${problem.id}`, {
    method: "PATCH",
    token: pro.token,
    body: { title: "hijack attempt" },
  });
  check("professional cannot update problems", proUpdate.status === 403, JSON.stringify(proUpdate.json));

  // Cancel flow (second problem)
  const second = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: { ...createPayload, title: "SMOKE-P2 Second problem to cancel", landmark: undefined },
  });
  const secondProblem = second.json?.data?.problem;
  check("second problem created", second.status === 201 && isUuid(secondProblem?.id), JSON.stringify(second.json));

  if (secondProblem) {
    const proCancel = await api(`/api/v1/problems/${secondProblem.id}/cancel`, { method: "POST", token: pro.token });
    check("professional cannot cancel problems", proCancel.status === 403, JSON.stringify(proCancel.json));

    const cancelled = await api(`/api/v1/problems/${secondProblem.id}/cancel`, { method: "POST", token: customer.token });
    check("owner cancel works", cancelled.status === 200 && cancelled.json?.data?.problem?.status === "CANCELLED", JSON.stringify(cancelled.json));

    const proListAfter = await api("/api/v1/problems", { token: pro.token });
    check("cancelled problem hidden from professionals", !(proListAfter.json?.data?.problems ?? []).some((p: any) => p.id === secondProblem.id));

    const cancelledFilter = await api("/api/v1/problems?status=CANCELLED", { token: customer.token });
    check("status filter shows cancelled problem", (cancelledFilter.json?.data?.problems ?? []).some((p: any) => p.id === secondProblem.id));

    const openFilter = await api("/api/v1/problems?status=OPEN", { token: customer.token });
    check("status filter OPEN excludes cancelled", !(openFilter.json?.data?.problems ?? []).some((p: any) => p.id === secondProblem.id));
  }

  // Expiry behavior (third problem, expiresAt forced into the past)
  const third = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: { ...createPayload, title: "SMOKE-P2 Third problem (expiry test)" },
  });
  const thirdProblem = third.json?.data?.problem;
  check("third problem created", third.status === 201 && isUuid(thirdProblem?.id), JSON.stringify(third.json));

  if (thirdProblem) {
    await prisma.problem.update({
      where: { id: thirdProblem.id },
      data: { expiresAt: new Date(Date.now() - 3_600_000) },
    });

    const proListExpired = await api("/api/v1/problems", { token: pro.token });
    check("expired problem hidden from professional list", !(proListExpired.json?.data?.problems ?? []).some((p: any) => p.id === thirdProblem.id));

    const proDetailExpired = await api(`/api/v1/problems/${thirdProblem.id}`, { token: pro.token });
    check("expired problem detail 404 for professionals", proDetailExpired.status === 404, JSON.stringify(proDetailExpired.json));

    const ownerDetailExpired = await api(`/api/v1/problems/${thirdProblem.id}`, { token: customer.token });
    check("owner still sees expired problem", ownerDetailExpired.status === 200);
  }

  // Cleanup: remove all smoke problems + generated notifications.
  const deleted = await prisma.problem.deleteMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P2" } },
  });
  await prisma.notification.deleteMany({
    where: { userId: pro.userId, type: "PROBLEM_MATCHED" },
  });
  console.log(`  (cleaned up ${deleted.count} smoke problems)`);
}

// ---------------------------------------------------------------------------
// Phase 3: proposals
// ---------------------------------------------------------------------------

async function phase3(customer: Account, pro: Account): Promise<void> {
  console.log("\n=== Phase 3: proposals ===\n");

  // Idempotent cleanup of earlier runs (proposals first: FK is Restrict).
  const oldProblems = await prisma.problem.findMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P3" } },
    select: { id: true },
  });
  if (oldProblems.length > 0) {
    await prisma.proposal.deleteMany({
      where: { problemId: { in: oldProblems.map((p) => p.id) } },
    });
    await prisma.problem.deleteMany({
      where: { id: { in: oldProblems.map((p) => p.id) } },
    });
  }
  await prisma.notification.deleteMany({
    where: { userId: customer.userId, type: "NEW_PROPOSAL" },
  });

  // Customer posts a problem.
  const created = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: {
      title: "SMOKE-P3 Washing machine making loud noise",
      description: "The washing machine shakes violently and makes a grinding noise during the spin cycle.",
      categorySlug: "appliance-repair",
      urgency: "SOON",
      city: "Pune",
      neighborhood: "Baner",
    },
  });
  const problem = created.json?.data?.problem;
  check("P3 problem created", created.status === 201 && isUuid(problem?.id), JSON.stringify(created.json));
  if (!problem) return;

  const visitTime = new Date(Date.now() + 86_400_000).toISOString();
  const proposalPayload = {
    price: 800,
    estimatedDurationMinutes: 90,
    proposedVisitTime: visitTime,
    diagnosis: "Likely a worn drum bearing or shock absorber; needs on-site inspection to confirm.",
    includedServices: ["On-site diagnosis", "Bearing replacement"],
    excludedServices: ["New drum purchase"],
    notes: "30-day workmanship guarantee.",
  };

  // Role guard
  const customerSubmit = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: customer.token,
    body: proposalPayload,
  });
  check("customer cannot submit proposals", customerSubmit.status === 403, JSON.stringify(customerSubmit.json));

  // Validation
  const zeroPrice = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: { ...proposalPayload, price: 0 },
  });
  check("zero price rejected", zeroPrice.status === 400 && zeroPrice.json?.code === "VALIDATION_ERROR", JSON.stringify(zeroPrice.json));

  const pastVisit = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: { ...proposalPayload, proposedVisitTime: "2020-01-01T09:00:00.000Z" },
  });
  check("past visit time rejected", pastVisit.status === 400 && pastVisit.json?.message?.includes("future"), JSON.stringify(pastVisit.json));

  const shortDiagnosis = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: { ...proposalPayload, diagnosis: "too short" },
  });
  check("short diagnosis rejected", shortDiagnosis.status === 400, JSON.stringify(shortDiagnosis.json));

  const unknownProblem = await api(`/api/v1/problems/${crypto.randomUUID()}/proposals`, {
    method: "POST",
    token: pro.token,
    body: proposalPayload,
  });
  check("proposal on unknown problem 404", unknownProblem.status === 404, JSON.stringify(unknownProblem.json));

  // Happy path
  const submitted = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: proposalPayload,
  });
  const proposal = submitted.json?.data?.proposal;
  check("proposal submitted", submitted.status === 201 && isUuid(proposal?.id), JSON.stringify(submitted.json));
  if (!proposal) return;

  check("proposal price echoed in rupees", proposal.price === 800, `price=${proposal.price}`);
  check("proposal status SUBMITTED", proposal.status === "SUBMITTED");
  check("duration formatted", proposal.estimatedDuration === "1 hr 30 min", proposal.estimatedDuration);
  check(
    "professional summary present",
    proposal.professional?.businessName === PRO_PROFILE.businessName &&
      proposal.professional?.verified === false &&
      typeof proposal.professional?.averageRating === "number",
    JSON.stringify(proposal.professional),
  );
  check(
    "problem summary present for pro viewer",
    proposal.problem?.id === problem.id && proposal.problem?.customerName === "Test C.",
    JSON.stringify(proposal.problem),
  );
  check("proposed visit time ISO", new Date(proposal.proposedVisitTime).toISOString() === visitTime, proposal.proposedVisitTime);

  // Duplicate blocked
  const duplicate = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: proposalPayload,
  });
  check(
    "duplicate proposal rejected",
    duplicate.status === 409 && duplicate.json?.message === "You have already submitted a proposal for this problem",
    JSON.stringify(duplicate.json),
  );

  // Problem moved to PROPOSALS_RECEIVED
  const customerDetail = await api(`/api/v1/problems/${problem.id}`, { token: customer.token });
  check("problem now PROPOSALS_RECEIVED", customerDetail.json?.data?.problem?.status === "PROPOSALS_RECEIVED", customerDetail.json?.data?.problem?.status);

  // Customer notified
  const customerNotifications = await api("/api/v1/notifications", { token: customer.token });
  const newProposalNotification = (customerNotifications.json?.data?.notifications ?? []).find(
    (n: any) => n.type === "NEW_PROPOSAL" && n.message.includes("Washing machine"),
  );
  check("customer notified of new proposal", Boolean(newProposalNotification));

  // Listing proposals on the problem
  const customerView = await api(`/api/v1/problems/${problem.id}/proposals`, { token: customer.token });
  const customerProposals: any[] = customerView.json?.data?.proposals ?? [];
  check("owner sees all proposals", customerProposals.length === 1 && customerProposals[0].id === proposal.id, JSON.stringify(customerView.json));

  const proView = await api(`/api/v1/problems/${problem.id}/proposals`, { token: pro.token });
  check("professional sees only own proposals", (proView.json?.data?.proposals ?? []).length === 1);

  // Professional's own proposals list
  const mine = await api("/api/v1/proposals", { token: pro.token });
  const mineItems: any[] = mine.json?.data?.proposals ?? [];
  const mineEntry = mineItems.find((p) => p.id === proposal.id);
  check("my proposals list contains proposal", Boolean(mineEntry));
  check(
    "my proposals include problem summary",
    mineEntry?.problem?.title === "SMOKE-P3 Washing machine making loud noise" && mineEntry?.problem?.customerName === "Test C.",
    JSON.stringify(mineEntry?.problem),
  );

  const mineFiltered = await api("/api/v1/proposals?status=SUBMITTED", { token: pro.token });
  check("status filter SUBMITTED finds it", (mineFiltered.json?.data?.proposals ?? []).some((p: any) => p.id === proposal.id));

  const customerMine = await api("/api/v1/proposals", { token: customer.token });
  check("customers cannot use my-proposals endpoint", customerMine.status === 403, JSON.stringify(customerMine.json));

  // Withdraw flow on a second problem
  const second = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: {
      title: "SMOKE-P3 Second problem for withdraw test",
      description: "Need a ceiling fan installed in the bedroom; the mount is already in place.",
      categorySlug: "electrical",
      city: "Pune",
      neighborhood: "Aundh",
    },
  });
  const secondProblem = second.json?.data?.problem;
  check("second problem created", second.status === 201 && isUuid(secondProblem?.id), JSON.stringify(second.json));

  if (secondProblem) {
    const secondProposal = await api(`/api/v1/problems/${secondProblem.id}/proposals`, {
      method: "POST",
      token: pro.token,
      body: { ...proposalPayload, price: 450, estimatedDurationMinutes: 45 },
    });
    const secondProposalData = secondProposal.json?.data?.proposal;
    check("second proposal submitted", secondProposal.status === 201 && isUuid(secondProposalData?.id), JSON.stringify(secondProposal.json));

    if (secondProposalData) {
      const customerWithdraw = await api(`/api/v1/proposals/${secondProposalData.id}/withdraw`, {
        method: "POST",
        token: customer.token,
      });
      check("customers cannot withdraw proposals", customerWithdraw.status === 403, JSON.stringify(customerWithdraw.json));

      const foreignWithdraw = await api(`/api/v1/proposals/${crypto.randomUUID()}/withdraw`, {
        method: "POST",
        token: pro.token,
      });
      check("unknown proposal withdraw 404", foreignWithdraw.status === 404);

      const withdrawn = await api(`/api/v1/proposals/${secondProposalData.id}/withdraw`, {
        method: "POST",
        token: pro.token,
      });
      check(
        "owner withdraw works",
        withdrawn.status === 200 && withdrawn.json?.data?.proposal?.status === "WITHDRAWN",
        JSON.stringify(withdrawn.json),
      );

      const withdrawnDetail = await api(`/api/v1/problems/${secondProblem.id}`, { token: customer.token });
      check("problem reopened after last withdraw", withdrawnDetail.json?.data?.problem?.status === "OPEN", withdrawnDetail.json?.data?.problem?.status);

      const proListReopened = await api("/api/v1/problems", { token: pro.token });
      check("reopened problem visible to professionals again", (proListReopened.json?.data?.problems ?? []).some((p: any) => p.id === secondProblem.id));

      const reWithdraw = await api(`/api/v1/proposals/${secondProposalData.id}/withdraw`, {
        method: "POST",
        token: pro.token,
      });
      check("already-withdrawn proposal cannot be withdrawn again", reWithdraw.status === 409, JSON.stringify(reWithdraw.json));

      const mineWithdrawn = await api("/api/v1/proposals?status=WITHDRAWN", { token: pro.token });
      check("WITHDRAWN filter finds withdrawn proposal", (mineWithdrawn.json?.data?.proposals ?? []).some((p: any) => p.id === secondProposalData.id));
    }
  }

  // Cleanup
  const problems = await prisma.problem.findMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P3" } },
    select: { id: true },
  });
  await prisma.proposal.deleteMany({ where: { problemId: { in: problems.map((p) => p.id) } } });
  const deletedProblems = await prisma.problem.deleteMany({
    where: { id: { in: problems.map((p) => p.id) } },
  });
  await prisma.notification.deleteMany({
    where: { userId: customer.userId, type: "NEW_PROPOSAL" },
  });
  console.log(`  (cleaned up ${deletedProblems.count} smoke problems)`);
}

// ---------------------------------------------------------------------------
// Phase 4: acceptance, jobs, messages
// ---------------------------------------------------------------------------

const PHASE4_NOTIFICATION_TYPES: NotificationType[] = [
  "PROPOSAL_ACCEPTED",
  "PROPOSAL_NOT_SELECTED",
  "JOB_STATUS_CHANGED",
  "NEW_MESSAGE",
];

/** Removes every SMOKE-P4 problem plus dependent jobs/messages/notifications. */
async function cleanupPhase4(customer: Account, pro: Account, pro2: Account): Promise<void> {
  const problems = await prisma.problem.findMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P4" } },
    select: { id: true },
  });
  const problemIds = problems.map((p) => p.id);

  if (problemIds.length > 0) {
    const jobs = await prisma.job.findMany({
      where: { problemId: { in: problemIds } },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length > 0) {
      await prisma.message.deleteMany({ where: { jobId: { in: jobIds } } });
      await prisma.jobStatusHistory.deleteMany({ where: { jobId: { in: jobIds } } });
      await prisma.job.deleteMany({ where: { id: { in: jobIds } } });
    }

    await prisma.proposal.deleteMany({ where: { problemId: { in: problemIds } } });
    await prisma.problem.deleteMany({ where: { id: { in: problemIds } } });
  }

  await prisma.notification.deleteMany({
    where: {
      userId: { in: [customer.userId, pro.userId, pro2.userId] },
      type: { in: PHASE4_NOTIFICATION_TYPES },
    },
  });
}

async function phase4(
  customer: Account,
  pro: Account,
  pro2: Account,
): Promise<void> {
  console.log("\n=== Phase 4: acceptance, jobs, messages ===\n");

  // pro2 may be new — make sure its application profile exists.
  const pro2Sync = await api("/api/v1/auth/sync", { method: "POST", token: pro2.token, body: PRO_PROFILE_2 });
  check("pro2 profile synced", pro2Sync.status === 200 && pro2Sync.json?.data?.user?.role === "PROFESSIONAL", JSON.stringify(pro2Sync.json));

  await cleanupPhase4(customer, pro, pro2);

  // Customer posts a problem, both professionals bid, customer accepts one.
  const created = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: {
      title: "SMOKE-P4 Ceiling fan wiring sparking near balcony",
      description: "Sparks from the ceiling fan wiring when switched on; smells burnt near the balcony switchboard.",
      categorySlug: "electrical",
      urgency: "URGENT",
      city: "Pune",
      neighborhood: "Viman Nagar",
      landmark: "Near Phoenix Mall",
    },
  });
  const problem = created.json?.data?.problem;
  check("P4 problem created", created.status === 201 && isUuid(problem?.id), JSON.stringify(created.json));
  if (!problem) return;

  const visitTime = new Date(Date.now() + 86_400_000).toISOString();
  const proposalPayload = {
    price: 1200,
    estimatedDurationMinutes: 120,
    proposedVisitTime: visitTime,
    diagnosis: "Likely a short in the fan winding or a burnt capacitor; needs inspection before rewiring.",
    includedServices: ["Inspection", "Rewiring"],
  };

  // Both professionals bid.
  const pro1Bid = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: proposalPayload,
  });
  const pro1Proposal = pro1Bid.json?.data?.proposal;
  check("pro1 proposal submitted", pro1Bid.status === 201 && isUuid(pro1Proposal?.id), JSON.stringify(pro1Bid.json));

  const pro2Bid = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro2.token,
    body: { ...proposalPayload, price: 1100 },
  });
  const pro2Proposal = pro2Bid.json?.data?.proposal;
  check("pro2 proposal submitted", pro2Bid.status === 201 && isUuid(pro2Proposal?.id), JSON.stringify(pro2Bid.json));

  if (!pro1Proposal || !pro2Proposal) return;

  // Role guard + unknown id
  const proAccept = await api(`/api/v1/proposals/${pro1Proposal.id}/accept`, { method: "POST", token: pro.token });
  check("professional cannot accept proposals", proAccept.status === 403, JSON.stringify(proAccept.json));

  const unknownAccept = await api(`/api/v1/proposals/${crypto.randomUUID()}/accept`, { method: "POST", token: customer.token });
  check("accept unknown proposal 404", unknownAccept.status === 404, JSON.stringify(unknownAccept.json));

  // Happy path: accept pro1's bid.
  const accepted = await api(`/api/v1/proposals/${pro1Proposal.id}/accept`, { method: "POST", token: customer.token });
  const job = accepted.json?.data?.job;
  check("proposal accepted -> job created", accepted.status === 201 && isUuid(job?.id), JSON.stringify(accepted.json));
  if (!job) return;

  check("job starts SCHEDULED", job.status === "SCHEDULED", job.status);
  check("job amounts echo proposal price", job.originalAmount === 1200 && job.currentAmount === 1200, JSON.stringify({ originalAmount: job.originalAmount, currentAmount: job.currentAmount }));
  check("job scheduledAt echoes proposed visit time", new Date(job.scheduledAt).toISOString() === visitTime, job.scheduledAt);
  check("job exposes exact address to owner", job.location?.fullAddress === "Viman Nagar, Pune (Near Phoenix Mall)", JSON.stringify(job.location));
  check("job links problem + proposal", job.problemId === problem.id && job.proposalId === pro1Proposal.id);
  check("job names participants", job.customer?.name === "Test Customer" && job.professional?.name === "Test Pro", JSON.stringify({ customer: job.customer, professional: job.professional }));

  const problemAfter = await api(`/api/v1/problems/${problem.id}`, { token: customer.token });
  check("problem now PROFESSIONAL_SELECTED", problemAfter.json?.data?.problem?.status === "PROFESSIONAL_SELECTED", problemAfter.json?.data?.problem?.status);

  const pro1ProposalDetail = await api("/api/v1/proposals?status=ACCEPTED", { token: pro.token });
  check("accepted proposal status ACCEPTED", (pro1ProposalDetail.json?.data?.proposals ?? []).some((p: any) => p.id === pro1Proposal.id));

  // Second accept attempt is blocked.
  const doubleAccept = await api(`/api/v1/proposals/${pro2Proposal.id}/accept`, { method: "POST", token: customer.token });
  check(
    "accepting another proposal on same problem 409",
    doubleAccept.status === 409 && /already/i.test(doubleAccept.json?.message ?? ""),
    JSON.stringify(doubleAccept.json),
  );

  // Notifications to winner and loser.
  const pro1Notifications = await api("/api/v1/notifications", { token: pro.token });
  check(
    "winner notified PROPOSAL_ACCEPTED",
    (pro1Notifications.json?.data?.notifications ?? []).some((n: any) => n.type === "PROPOSAL_ACCEPTED" && n.linkUrl?.includes(job.id)),
  );
  const pro2Notifications = await api("/api/v1/notifications", { token: pro2.token });
  check(
    "loser notified PROPOSAL_NOT_SELECTED",
    (pro2Notifications.json?.data?.notifications ?? []).some((n: any) => n.type === "PROPOSAL_NOT_SELECTED"),
  );

  // Access control on jobs
  const pro2Detail = await api(`/api/v1/jobs/${job.id}`, { token: pro2.token });
  check("unassigned professional job detail 404", pro2Detail.status === 404, JSON.stringify(pro2Detail.json));

  const customerDetail = await api(`/api/v1/jobs/${job.id}`, { token: customer.token });
  check("customer job detail ok", customerDetail.status === 200 && customerDetail.json?.data?.job?.id === job.id, JSON.stringify(customerDetail.json));
  check("job detail includes status history", (customerDetail.json?.data?.statusHistory ?? []).length >= 1 && customerDetail.json?.data?.statusHistory[0].oldStatus === null, JSON.stringify(customerDetail.json?.data?.statusHistory?.slice(0, 2)));

  const unknownJob = await api(`/api/v1/jobs/${crypto.randomUUID()}`, { token: customer.token });
  check("unknown job detail 404", unknownJob.status === 404);

  const customerJobs = await api("/api/v1/jobs", { token: customer.token });
  check("customer job list contains job", (customerJobs.json?.data?.jobs ?? []).some((j: any) => j.id === job.id));
  const scheduledFilter = await api("/api/v1/jobs?status=SCHEDULED", { token: customer.token });
  check("status filter SCHEDULED finds job", (scheduledFilter.json?.data?.jobs ?? []).some((j: any) => j.id === job.id));
  const proJobs = await api("/api/v1/jobs", { token: pro.token });
  check("professional job list contains assigned job", (proJobs.json?.data?.jobs ?? []).some((j: any) => j.id === job.id));
  const pro2Jobs = await api("/api/v1/jobs", { token: pro2.token });
  check("unassigned professional job list empty of job", !(pro2Jobs.json?.data?.jobs ?? []).some((j: any) => j.id === job.id));

  // ---------------------------------------------------------------------------
  // Messages (while job is SCHEDULED)
  // ---------------------------------------------------------------------------

  const customerMessage = await api(`/api/v1/jobs/${job.id}/messages`, {
    method: "POST",
    token: customer.token,
    body: { content: "Can you arrive a bit earlier? I am home from 10 AM." },
  });
  check("customer sends message", customerMessage.status === 201 && customerMessage.json?.data?.message?.senderRole === "CUSTOMER", JSON.stringify(customerMessage.json));
  const firstMessage = customerMessage.json?.data?.message;

  const emptyMessage = await api(`/api/v1/jobs/${job.id}/messages`, {
    method: "POST",
    token: customer.token,
    body: {},
  });
  check("empty message rejected", emptyMessage.status === 400, JSON.stringify(emptyMessage.json));

  const pro2Message = await api(`/api/v1/jobs/${job.id}/messages`, {
    method: "POST",
    token: pro2.token,
    body: { content: "let me in please" },
  });
  check("unassigned professional cannot send messages", pro2Message.status === 404, JSON.stringify(pro2Message.json));

  const proMessage = await api(`/api/v1/jobs/${job.id}/messages`, {
    method: "POST",
    token: pro.token,
    body: {
      content: "Yes, I can be there by 10.",
      attachment: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==", name: "schedule.png" },
    },
  });
  check(
    "professional sends text+attachment message",
    proMessage.status === 201 && proMessage.json?.data?.message?.messageType === "TEXT" && Boolean(proMessage.json?.data?.message?.attachmentUrl),
    JSON.stringify(proMessage.json),
  );
  const secondMessage = proMessage.json?.data?.message;

  const imageMessage = await api(`/api/v1/jobs/${job.id}/messages`, {
    method: "POST",
    token: pro.token,
    body: { attachment: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==", name: "photo.png" } },
  });
  check("image-only message stored as IMAGE", imageMessage.status === 201 && imageMessage.json?.data?.message?.messageType === "IMAGE", JSON.stringify(imageMessage.json));

  const messageList = await api(`/api/v1/jobs/${job.id}/messages`, { token: customer.token });
  const listedMessages: any[] = messageList.json?.data?.messages ?? [];
  check(
    "message list oldest-first",
    listedMessages.length === 3 &&
      listedMessages[0].id === firstMessage.id &&
      listedMessages[2].id === imageMessage.json?.data?.message?.id,
    JSON.stringify(listedMessages.map((m) => m.id)),
  );
  check("message list sender names", listedMessages[1].senderName === "Test Pro", listedMessages[1].senderName);

  // read-all marks the counterpart's messages read
  const readAll = await api(`/api/v1/jobs/${job.id}/messages/read-all`, { method: "POST", token: pro.token });
  check("read-all returns count", readAll.status === 200 && readAll.json?.data?.updated === 1, JSON.stringify(readAll.json));
  const afterReadAll = await api(`/api/v1/jobs/${job.id}/messages`, { token: pro.token });
  const proViewMessages: any[] = afterReadAll.json?.data?.messages ?? [];
  check(
    "counterpart message marked read",
    proViewMessages.find((m: any) => m.id === firstMessage.id)?.isRead === true,
  );

  const customerMessageNotifications = await api("/api/v1/notifications", { token: pro.token });
  check(
    "pro notified of new customer message",
    (customerMessageNotifications.json?.data?.notifications ?? []).some((n: any) => n.type === "NEW_MESSAGE" && n.linkUrl?.includes("/chat")),
  );

  // Cursor pagination: fetch 1 before the second message -> only the first.
  const paged = await api(
    `/api/v1/jobs/${job.id}/messages?limit=1&before=${encodeURIComponent(secondMessage.createdAt)}`,
    { token: customer.token },
  );
  const pagedMessages: any[] = paged.json?.data?.messages ?? [];
  check(
    "cursor pagination returns older page",
    paged.status === 200 && pagedMessages.length === 1 && pagedMessages[0].id === firstMessage.id && paged.json?.data?.hasMore === false,
    JSON.stringify(paged.json),
  );

  // ---------------------------------------------------------------------------
  // Status flow (professional drives, customer confirms)
  // ---------------------------------------------------------------------------

  const customerStatus = await api(`/api/v1/jobs/${job.id}/status`, {
    method: "POST",
    token: customer.token,
    body: { status: "ON_THE_WAY" },
  });
  check("customer cannot drive job status", customerStatus.status === 403, JSON.stringify(customerStatus.json));

  const invalidSkip = await api(`/api/v1/jobs/${job.id}/status`, {
    method: "POST",
    token: pro.token,
    body: { status: "IN_PROGRESS" },
  });
  check("skipping status steps rejected", invalidSkip.status === 409, JSON.stringify(invalidSkip.json));

  const flow: Array<[string, string]> = [
    ["ON_THE_WAY", "en route to the customer"],
    ["ARRIVED", "reached the location"],
    ["INSPECTION", "starting inspection"],
    ["IN_PROGRESS", "repair in progress"],
    ["COMPLETED", "wiring replaced and tested; fan working normally"],
  ];
  let statusOk = true;
  for (const [status, reason] of flow) {
    const step = await api(`/api/v1/jobs/${job.id}/status`, {
      method: "POST",
      token: pro.token,
      body: { status, reason },
    });
    if (step.status !== 200 || step.json?.data?.job?.status !== status) {
      statusOk = false;
      check(`status transition to ${status}`, false, JSON.stringify(step.json));
    }
  }
  check("full status flow advances to COMPLETED", statusOk);

  const completedDetail = await api(`/api/v1/jobs/${job.id}`, { token: pro.token });
  check("completedAt timestamped", Boolean(completedDetail.json?.data?.job?.completedAt), JSON.stringify(completedDetail.json?.data?.job?.completedAt));
  check(
    "status history records every step",
    (completedDetail.json?.data?.statusHistory ?? []).length === 6,
    `entries=${completedDetail.json?.data?.statusHistory?.length}`,
  );

  const proNotificationsAfterFlow = await api("/api/v1/notifications", { token: customer.token });
  check(
    "customer notified of job status changes",
    (proNotificationsAfterFlow.json?.data?.notifications ?? []).some((n: any) => n.type === "JOB_STATUS_CHANGED"),
  );

  // Confirm / cancel guards
  const proConfirm = await api(`/api/v1/jobs/${job.id}/confirm`, { method: "POST", token: pro.token });
  check("professional cannot customer-confirm", proConfirm.status === 403, JSON.stringify(proConfirm.json));

  const prematureCancel = await api(`/api/v1/jobs/${job.id}/cancel`, {
    method: "POST",
    token: customer.token,
    body: { reason: "changed my mind" },
  });
  check("completed job cannot be cancelled", prematureCancel.status === 409, JSON.stringify(prematureCancel.json));

  const confirmed = await api(`/api/v1/jobs/${job.id}/confirm`, {
    method: "POST",
    token: customer.token,
    body: { notes: "Great work, tested and working." },
  });
  check(
    "customer confirm works",
    confirmed.status === 200 && confirmed.json?.data?.job?.status === "CUSTOMER_CONFIRMED" && Boolean(confirmed.json?.data?.job?.customerConfirmedAt),
    JSON.stringify(confirmed.json),
  );

  const reConfirm = await api(`/api/v1/jobs/${job.id}/confirm`, { method: "POST", token: customer.token, body: {} });
  check("already-confirmed job cannot be confirmed again", reConfirm.status === 409, JSON.stringify(reConfirm.json));

  // Cancel path on a second job (pro cancels while SCHEDULED)
  const second = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: {
      title: "SMOKE-P4 Geyser leaking in bathroom",
      description: "Water is dripping from the geyser pressure valve continuously; bathroom floor stays wet.",
      categorySlug: "plumbing",
      city: "Pune",
      neighborhood: "Kharadi",
    },
  });
  const secondProblem = second.json?.data?.problem;
  check("second problem created", second.status === 201 && isUuid(secondProblem?.id), JSON.stringify(second.json));

  if (secondProblem) {
    const bid = await api(`/api/v1/problems/${secondProblem.id}/proposals`, {
      method: "POST",
      token: pro.token,
      body: { ...proposalPayload, price: 750, estimatedDurationMinutes: 60 },
    });
    const bidProposal = bid.json?.data?.proposal;

    if (bidProposal) {
      const acceptedSecond = await api(`/api/v1/proposals/${bidProposal.id}/accept`, { method: "POST", token: customer.token });
      const secondJob = acceptedSecond.json?.data?.job;
      check("second job created", acceptedSecond.status === 201 && isUuid(secondJob?.id), JSON.stringify(acceptedSecond.json));

      if (secondJob) {
        const cancelByPro = await api(`/api/v1/jobs/${secondJob.id}/cancel`, {
          method: "POST",
          token: pro.token,
          body: { reason: "Double-booked; apologise to the customer." },
        });
        check(
          "professional cancels scheduled job",
          cancelByPro.status === 200 && cancelByPro.json?.data?.job?.status === "CANCELLED" && Boolean(cancelByPro.json?.data?.job?.closedAt),
          JSON.stringify(cancelByPro.json),
        );

        const cancelledJobs = await api("/api/v1/jobs?status=CANCELLED", { token: customer.token });
        check("cancelled job appears in filter", (cancelledJobs.json?.data?.jobs ?? []).some((j: any) => j.id === secondJob.id));

        const customerStatusOnCancelled = await api(`/api/v1/jobs/${secondJob.id}/status`, {
          method: "POST",
          token: pro.token,
          body: { status: "ON_THE_WAY" },
        });
        check("cancelled job cannot be advanced", customerStatusOnCancelled.status === 409, JSON.stringify(customerStatusOnCancelled.json));
      }
    }
  }

  await cleanupPhase4(customer, pro, pro2);
  console.log("  (cleaned up phase 4 data)");
}

// ---------------------------------------------------------------------------
// Phase 5: reviews + rating aggregation
// ---------------------------------------------------------------------------

/** Deletes SMOKE-P5 data and resets the professional's rating aggregates. */
async function cleanupPhase5(customer: Account, pro: Account): Promise<void> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: pro.userId },
    select: { id: true },
  });

  if (profile) {
    // ReviewResponse cascades from Review.
    await prisma.review.deleteMany({ where: { professionalId: profile.id } });

    // Reset the aggregates to the source-data truth (no reviews left).
    const confirmedJobs = await prisma.job.count({
      where: { professionalId: profile.id, status: { in: ["CUSTOMER_CONFIRMED", "CLOSED"] } },
    });
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { averageRating: 0, totalJobs: confirmedJobs },
    });
  }

  const problems = await prisma.problem.findMany({
    where: { customerId: customer.userId, title: { startsWith: "SMOKE-P5" } },
    select: { id: true },
  });
  const problemIds = problems.map((p) => p.id);

  if (problemIds.length > 0) {
    const jobs = await prisma.job.findMany({
      where: { problemId: { in: problemIds } },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length > 0) {
      await prisma.message.deleteMany({ where: { jobId: { in: jobIds } } });
      await prisma.jobStatusHistory.deleteMany({ where: { jobId: { in: jobIds } } });
      await prisma.job.deleteMany({ where: { id: { in: jobIds } } });
    }

    await prisma.proposal.deleteMany({ where: { problemId: { in: problemIds } } });
    await prisma.problem.deleteMany({ where: { id: { in: problemIds } } });
  }

  await prisma.notification.deleteMany({
    where: {
      userId: { in: [customer.userId, pro.userId] },
      type: { in: ["REVIEW_RECEIVED" as NotificationType] },
    },
  });
}

/** Full happy path helper: post problem, bid, accept, drive to confirmed. */
async function createConfirmedJob(
  customer: Account,
  pro: Account,
  title: string,
  price: number,
  options: { confirm?: boolean } = {},
): Promise<any | null> {
  const created = await api("/api/v1/problems", {
    method: "POST",
    token: customer.token,
    body: {
      title,
      description: "Smoke fixture for the review flow; needs an inspection and a small repair.",
      categorySlug: "appliance-repair",
      city: "Pune",
      neighborhood: "Balewadi",
    },
  });
  const problem = created.json?.data?.problem;
  if (created.status !== 201 || !problem) {
    check(`fixture problem ${title}`, false, JSON.stringify(created.json));
    return null;
  }

  const bid = await api(`/api/v1/problems/${problem.id}/proposals`, {
    method: "POST",
    token: pro.token,
    body: {
      price,
      estimatedDurationMinutes: 60,
      proposedVisitTime: new Date(Date.now() + 86_400_000).toISOString(),
      diagnosis: "Fixture diagnosis for the review smoke test.",
    },
  });
  const proposal = bid.json?.data?.proposal;
  if (bid.status !== 201 || !proposal) {
    check(`fixture proposal ${title}`, false, JSON.stringify(bid.json));
    return null;
  }

  const accepted = await api(`/api/v1/proposals/${proposal.id}/accept`, { method: "POST", token: customer.token });
  const job = accepted.json?.data?.job;
  if (accepted.status !== 201 || !job) {
    check(`fixture accept ${title}`, false, JSON.stringify(accepted.json));
    return null;
  }

  for (const status of ["ON_THE_WAY", "ARRIVED", "INSPECTION", "IN_PROGRESS", "COMPLETED"]) {
    const step = await api(`/api/v1/jobs/${job.id}/status`, { method: "POST", token: pro.token, body: { status } });
    if (step.status !== 200) {
      check(`fixture status ${status} ${title}`, false, JSON.stringify(step.json));
      return null;
    }
  }

  if (options.confirm !== false) {
    const confirmed = await api(`/api/v1/jobs/${job.id}/confirm`, { method: "POST", token: customer.token, body: {} });
    if (confirmed.status !== 200) {
      check(`fixture confirm ${title}`, false, JSON.stringify(confirmed.json));
      return null;
    }
  }

  return job;
}

async function phase5(customer: Account, pro: Account, pro2: Account): Promise<void> {
  console.log("\n=== Phase 5: reviews + rating aggregation ===\n");

  await cleanupPhase5(customer, pro);

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: pro.userId },
    select: { id: true },
  });
  if (!profile) {
    check("professional profile exists for phase 5", false);
    return;
  }

  // Two confirmed jobs -> two reviews (4 and 5 stars).
  const job1 = await createConfirmedJob(customer, pro, "SMOKE-P5 Microwave not heating", 900);
  check("fixture job 1 confirmed", Boolean(job1?.id));
  const job2 = await createConfirmedJob(customer, pro, "SMOKE-P5 Water purifier service", 600);
  check("fixture job 2 confirmed", Boolean(job2?.id));
  if (!job1 || !job2) return;

  // Guards: review before confirmation, wrong role, bad rating value.
  const beforeConfirmJob = await createConfirmedJob(
    customer,
    pro,
    "SMOKE-P5 Fixture not yet confirmed",
    300,
    { confirm: false },
  );
  if (beforeConfirmJob) {
    const proStatuses = await prisma.jobStatusHistory.findMany({
      where: { jobId: beforeConfirmJob.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    const lastStatus = proStatuses[0]?.newStatus;
    if (lastStatus === "CUSTOMER_CONFIRMED") {
      check("fixture job left unconfirmed", false, "unexpectedly confirmed");
    } else {
      const earlyReview = await api(`/api/v1/jobs/${beforeConfirmJob.id}/review`, {
        method: "POST",
        token: customer.token,
        body: { overallRating: 5, qualityRating: 5, professionalismRating: 5, timelinessRating: 5, valueRating: 5 },
      });
      check(
        "review before customer-confirm rejected",
        earlyReview.status === 409,
        JSON.stringify(earlyReview.json),
      );
    }
  }

  const proReview = await api(`/api/v1/jobs/${job1.id}/review`, {
    method: "POST",
    token: pro.token,
    body: { overallRating: 5, qualityRating: 5, professionalismRating: 5, timelinessRating: 5, valueRating: 5 },
  });
  check("professional cannot review jobs", proReview.status === 403, JSON.stringify(proReview.json));

  const badRating = await api(`/api/v1/jobs/${job1.id}/review`, {
    method: "POST",
    token: customer.token,
    body: { overallRating: 6, qualityRating: 5, professionalismRating: 5, timelinessRating: 5, valueRating: 5 },
  });
  check("rating > 5 rejected", badRating.status === 400 && badRating.json?.code === "VALIDATION_ERROR", JSON.stringify(badRating.json));

  // Review job 1 (4 stars).
  const review1 = await api(`/api/v1/jobs/${job1.id}/review`, {
    method: "POST",
    token: customer.token,
    body: {
      overallRating: 4,
      qualityRating: 5,
      professionalismRating: 4,
      timelinessRating: 4,
      valueRating: 5,
      comment: "Solid work, arrived on time.",
    },
  });
  const review1Data = review1.json?.data?.review;
  check("review created", review1.status === 201 && isUuid(review1Data?.id), JSON.stringify(review1.json));
  if (!review1Data) return;

  check("review shape", review1Data.customerName === "Test Customer" && review1Data.ratings?.overall === 4 && review1Data.response === null, JSON.stringify(review1Data));

  const duplicate = await api(`/api/v1/jobs/${job1.id}/review`, {
    method: "POST",
    token: customer.token,
    body: { overallRating: 5, qualityRating: 5, professionalismRating: 5, timelinessRating: 5, valueRating: 5 },
  });
  check("double review rejected", duplicate.status === 409 && /already/i.test(duplicate.json?.message ?? ""), JSON.stringify(duplicate.json));

  // Review job 2 (5 stars).
  const review2 = await api(`/api/v1/jobs/${job2.id}/review`, {
    method: "POST",
    token: customer.token,
    body: {
      overallRating: 5,
      qualityRating: 5,
      professionalismRating: 5,
      timelinessRating: 5,
      valueRating: 5,
      comment: "Excellent service.",
    },
  });
  check("second review created", review2.status === 201 && isUuid(review2.json?.data?.review?.id), JSON.stringify(review2.json));

  // Aggregates over the professional's reviews.
  const list = await api(`/api/v1/reviews?professionalId=${profile.id}`, { token: customer.token });
  const listData = list.json?.data;
  check(
    "review list contains both reviews",
    list.status === 200 && (listData?.reviews ?? []).length === 2,
    JSON.stringify(list.json),
  );
  check(
    "summary aggregates (avg 4.5, distribution 4:1 5:1)",
    listData?.summary?.averageRating === 4.5 &&
      listData?.summary?.totalReviews === 2 &&
      listData?.summary?.distribution?.["4"] === 1 &&
      listData?.summary?.distribution?.["5"] === 1,
    JSON.stringify(listData?.summary),
  );
  check(
    "breakdown averages computed",
    listData?.summary?.breakdown?.quality === 5 && listData?.summary?.breakdown?.timeliness === 4.5,
    JSON.stringify(listData?.summary?.breakdown),
  );
  check(
    "pagination present",
    listData?.pagination?.total === 2 && listData?.pagination?.totalPages === 1,
    JSON.stringify(listData?.pagination),
  );

  const unknownPro = await api(`/api/v1/reviews?professionalId=${crypto.randomUUID()}`, { token: customer.token });
  check("unknown professional reviews 404", unknownPro.status === 404, JSON.stringify(unknownPro.json));

  // Professional profile aggregate synced (visible in the sync response).
  const proSync = await api("/api/v1/auth/sync", { method: "POST", token: pro.token, body: PRO_PROFILE });
  const proProfile = proSync.json?.data?.user?.professionalProfile;
  check(
    "professional profile averageRating synced to 4.5",
    Number(proProfile?.averageRating) === 4.5 && proProfile?.totalJobs === 2,
    JSON.stringify(proProfile),
  );

  // Review response flow
  const customerResponse = await api(`/api/v1/reviews/${review1Data.id}/response`, {
    method: "POST",
    token: customer.token,
    body: { responseText: "thank you!" },
  });
  check("customers cannot respond to reviews", customerResponse.status === 403, JSON.stringify(customerResponse.json));

  const foreignResponse = await api(`/api/v1/reviews/${review1Data.id}/response`, {
    method: "POST",
    token: pro2.token,
    body: { responseText: "not my review" },
  });
  check("unassigned professional response 404", foreignResponse.status === 404, JSON.stringify(foreignResponse.json));

  const proResponse = await api(`/api/v1/reviews/${review1Data.id}/response`, {
    method: "POST",
    token: pro.token,
    body: { responseText: "Thanks for the feedback — glad everything works!" },
  });
  check(
    "professional responds to review",
    proResponse.status === 201 && proResponse.json?.data?.review?.response?.text === "Thanks for the feedback — glad everything works!",
    JSON.stringify(proResponse.json),
  );

  const secondResponse = await api(`/api/v1/reviews/${review1Data.id}/response`, {
    method: "POST",
    token: pro.token,
    body: { responseText: "another response" },
  });
  check("double response rejected", secondResponse.status === 409, JSON.stringify(secondResponse.json));

  const listAfterResponse = await api(`/api/v1/reviews?professionalId=${profile.id}`, { token: pro.token });
  const respondedReview: any = (listAfterResponse.json?.data?.reviews ?? []).find((r: any) => r.id === review1Data.id);
  check("response visible in review list", respondedReview?.response?.text === "Thanks for the feedback — glad everything works!", JSON.stringify(respondedReview?.response));

  const customerNotifications = await api("/api/v1/notifications", { token: customer.token });
  check(
    "customer notified of review response",
    (customerNotifications.json?.data?.notifications ?? []).some((n: any) => n.type === "REVIEW_RECEIVED"),
  );

  const proNotifications = await api("/api/v1/notifications", { token: pro.token });
  check(
    "professional notified of new review",
    (proNotifications.json?.data?.notifications ?? []).some((n: any) => n.type === "REVIEW_RECEIVED" && n.title === "You received a new review"),
  );

  await cleanupPhase5(customer, pro);
  console.log("  (cleaned up phase 5 data)");
}

async function phase7(
  admin: Account,
  customer: Account,
  pro: Account,
  pro2: Account,
): Promise<void> {
  console.log("\n=== Phase 7: admin APIs ===\n");

  // Authorization boundaries.
  const anonymous = await api("/api/v1/admin/stats");
  check("admin endpoints require authentication", anonymous.status === 401, JSON.stringify(anonymous.json));

  const asCustomer = await api("/api/v1/admin/stats", { token: customer.token });
  check(
    "customers blocked from admin endpoints",
    asCustomer.status === 403 && asCustomer.json?.code === "ROLE_FORBIDDEN",
    JSON.stringify(asCustomer.json),
  );

  // Dashboard metrics.
  const stats = await api("/api/v1/admin/stats", { token: admin.token });
  check("admin stats ok", stats.status === 200 && stats.json?.success === true, JSON.stringify(stats.json));
  const metrics = stats.json?.data?.stats;
  check(
    "admin stats shape",
    typeof metrics?.users?.total === "number" &&
      typeof metrics?.problems?.open === "number" &&
      typeof metrics?.proposals?.total === "number" &&
      typeof metrics?.jobs?.total === "number" &&
      typeof metrics?.revenue?.grossRupees === "number" &&
      typeof metrics?.pendingVerifications === "number",
    JSON.stringify(metrics),
  );
  check(
    "admin stats counts are plausible",
    metrics?.users?.total >= 3 && metrics?.users?.customers >= 1 && metrics?.users?.professionals >= 2,
    JSON.stringify(metrics?.users),
  );

  // User listing + filters.
  const users = await api("/api/v1/admin/users?pageSize=50", { token: admin.token });
  const userRows: any[] = users.json?.data?.users ?? [];
  check("admin user list ok", users.status === 200 && userRows.length >= 3, JSON.stringify(users.json));
  check(
    "admin user list shape",
    userRows.every(
      (u) => isUuid(u.id) && typeof u.role === "string" && typeof u.status === "string" && typeof u.name === "string",
    ),
  );
  check(
    "admin user list pagination",
    users.json?.data?.pagination?.total >= userRows.length &&
      users.json?.data?.pagination?.pageSize === 50,
    JSON.stringify(users.json?.data?.pagination),
  );

  const proUsers = await api("/api/v1/admin/users?role=PROFESSIONAL&pageSize=50", { token: admin.token });
  const proRows: any[] = proUsers.json?.data?.users ?? [];
  check(
    "admin user role filter",
    proRows.length >= 2 && proRows.every((u) => u.role === "PROFESSIONAL" && Boolean(u.professional)),
    JSON.stringify(proRows.map((u) => u.role)),
  );

  // Guards.
  const selfStatus = await api(`/api/v1/admin/users/${admin.userId}/status`, {
    method: "PATCH",
    token: admin.token,
    body: { status: "SUSPENDED" },
  });
  check("admin cannot change own status", selfStatus.status === 400, JSON.stringify(selfStatus.json));

  const unknownUser = await api("/api/v1/admin/users/00000000-0000-4000-8000-000000000000/status", {
    method: "PATCH",
    token: admin.token,
    body: { status: "SUSPENDED" },
  });
  check("unknown user returns 404", unknownUser.status === 404, JSON.stringify(unknownUser.json));

  // Suspend -> request blocked -> reactivate.
  const suspend = await api(`/api/v1/admin/users/${pro2.userId}/status`, {
    method: "PATCH",
    token: admin.token,
    body: { status: "SUSPENDED", reason: "smoke test" },
  });
  check(
    "admin suspends a user",
    suspend.status === 200 && suspend.json?.data?.user?.status === "SUSPENDED",
    JSON.stringify(suspend.json),
  );

  const suspendedAccess = await api("/api/v1/jobs", { token: pro2.token });
  check(
    "suspended user loses API access",
    suspendedAccess.status === 403 && suspendedAccess.json?.code === "PROFILE_INACTIVE",
    JSON.stringify(suspendedAccess.json),
  );

  const suspendedNotice = await prisma.notification.findFirst({
    where: { userId: pro2.userId, type: "SYSTEM" },
    orderBy: { createdAt: "desc" },
  });
  check("suspended user is notified", Boolean(suspendedNotice), JSON.stringify(suspendedNotice));

  const reactivate = await api(`/api/v1/admin/users/${pro2.userId}/status`, {
    method: "PATCH",
    token: admin.token,
    body: { status: "ACTIVE" },
  });
  check(
    "admin reactivates a user",
    reactivate.status === 200 && reactivate.json?.data?.user?.status === "ACTIVE",
    JSON.stringify(reactivate.json),
  );

  const restoredAccess = await api("/api/v1/jobs", { token: pro2.token });
  check("reactivated user regains API access", restoredAccess.status === 200, JSON.stringify(restoredAccess.json));

  // Verification queue + decision.
  const proProfile = await prisma.professionalProfile.findUnique({
    where: { userId: pro.userId },
    select: { id: true, verificationStatus: true },
  });
  if (!proProfile) {
    check("professional profile exists for admin phase", false);
    return;
  }

  const originalVerification = proProfile.verificationStatus;
  const documentMarker = `smoke-verification-${Date.now()}`;

  await prisma.professionalProfile.update({
    where: { id: proProfile.id },
    data: { verificationStatus: "PENDING" },
  });
  const request = await prisma.verificationRequest.create({
    data: {
      professionalId: proProfile.id,
      documentType: "GOVERNMENT_ID",
      documentUrl: documentMarker,
      status: "PENDING",
    },
  });

  const queue = await api("/api/v1/admin/verifications?status=PENDING&pageSize=100", {
    token: admin.token,
  });
  const queued = (queue.json?.data?.verifications ?? []).find(
    (v: any) => v.professionalId === proProfile.id,
  );
  check(
    "pending verification appears in queue",
    queue.status === 200 && Boolean(queued) && queued.requests.some((r: any) => r.id === request.id),
    JSON.stringify(queue.json),
  );

  const approve = await api(`/api/v1/admin/verifications/${proProfile.id}/decision`, {
    method: "POST",
    token: admin.token,
    body: { decision: "APPROVE", notes: "smoke approval" },
  });
  check(
    "admin approves verification",
    approve.status === 200 &&
      approve.json?.data?.verification?.verificationStatus === "VERIFIED" &&
      approve.json?.data?.verification?.requests.some(
        (r: any) => r.id === request.id && r.status === "APPROVED" && r.adminNotes === "smoke approval",
      ),
    JSON.stringify(approve.json),
  );

  const approvedRow = await prisma.verificationRequest.findUnique({ where: { id: request.id } });
  check(
    "verification request reviewed",
    approvedRow?.status === "APPROVED" && approvedRow?.reviewedById === admin.userId,
    JSON.stringify(approvedRow),
  );

  const auditEntry = await prisma.auditLog.findFirst({
    where: { entityType: "ProfessionalProfile", entityId: proProfile.id, action: "VERIFICATION_APPROVE" },
  });
  check("verification decision audited", Boolean(auditEntry), JSON.stringify(auditEntry));

  const proVerificationNote = await api("/api/v1/notifications", { token: pro.token });
  check(
    "professional notified of verification decision",
    (proVerificationNote.json?.data?.notifications ?? []).some(
      (n: any) => n.type === "VERIFICATION_UPDATE",
    ),
  );

  const reject = await api(`/api/v1/admin/verifications/${proProfile.id}/decision`, {
    method: "POST",
    token: admin.token,
    body: { decision: "REJECT", notes: "smoke rejection path" },
  });
  check(
    "admin can reject verification",
    reject.status === 200 && reject.json?.data?.verification?.verificationStatus === "REJECTED",
    JSON.stringify(reject.json),
  );

  // Cleanup: restore the professional's original verification state.
  await prisma.professionalProfile.update({
    where: { id: proProfile.id },
    data: { verificationStatus: originalVerification },
  });
  await prisma.verificationRequest.deleteMany({ where: { id: request.id } });

  // Category management.
  const categoryName = `Smoke Category ${Date.now()}`;
  const created = await api("/api/v1/admin/categories", {
    method: "POST",
    token: admin.token,
    body: { name: categoryName, description: "temporary smoke category" },
  });
  const createdCategory = created.json?.data?.category;
  check(
    "admin creates a category",
    created.status === 201 && createdCategory?.name === categoryName && typeof createdCategory?.slug === "string",
    JSON.stringify(created.json),
  );

  if (!createdCategory?.id) return;

  const duplicate = await api("/api/v1/admin/categories", {
    method: "POST",
    token: admin.token,
    body: { name: categoryName },
  });
  check("duplicate category rejected", duplicate.status === 409, JSON.stringify(duplicate.json));

  const updated = await api(`/api/v1/admin/categories/${createdCategory.id}`, {
    method: "PATCH",
    token: admin.token,
    body: { description: "updated smoke category", isActive: false },
  });
  check(
    "admin updates a category",
    updated.status === 200 &&
      updated.json?.data?.category?.description === "updated smoke category" &&
      updated.json?.data?.category?.isActive === false,
    JSON.stringify(updated.json),
  );

  const adminCategories = await api("/api/v1/admin/categories", { token: admin.token });
  check(
    "admin category list includes new category",
    (adminCategories.json?.data?.categories ?? []).some((c: any) => c.id === createdCategory.id),
  );

  const deleted = await api(`/api/v1/admin/categories/${createdCategory.id}`, {
    method: "DELETE",
    token: admin.token,
  });
  check(
    "admin deletes an unused category",
    deleted.status === 200 && deleted.json?.data?.deleted === true,
    JSON.stringify(deleted.json),
  );

  const remaining = await prisma.serviceCategory.findUnique({ where: { id: createdCategory.id } });
  check("deleted category is gone", remaining === null);

  const invalidCategory = await api("/api/v1/admin/categories", {
    method: "POST",
    token: admin.token,
    body: { name: "x" },
  });
  check("invalid category payload rejected", invalidCategory.status === 400, JSON.stringify(invalidCategory.json));

  // Audit trail endpoint.
  const auditLogs = await api("/api/v1/admin/audit-logs?pageSize=50", { token: admin.token });
  const logs: any[] = auditLogs.json?.data?.logs ?? [];
  check("admin audit logs ok", auditLogs.status === 200 && logs.length > 0, JSON.stringify(auditLogs.json));
  check(
    "audit logs capture admin actions",
    logs.some((l) => l.action === "CATEGORY_CREATED" && typeof l.actorName === "string") &&
      logs.some((l) => l.action === "USER_STATUS_CHANGED"),
    JSON.stringify(logs.map((l) => l.action).slice(0, 10)),
  );
}

async function main(): Promise<void> {
  console.log(`Smoke testing ${BASE} (customer=${CUSTOMER_EMAIL}, pro=${PRO_EMAIL})`);

  try {
    const customer = await ensureAccount(CUSTOMER_EMAIL, CUSTOMER_PROFILE);
    check("customer test account usable", Boolean(customer), customer ? undefined : "sign-up/sign-in failed");
    const pro = await ensureAccount(PRO_EMAIL, PRO_PROFILE);
    check("professional test account usable", Boolean(pro), pro ? undefined : "sign-up/sign-in failed");

    const pro2 = await ensureAccount(PRO_EMAIL_2, PRO_PROFILE_2);
    check("second professional test account usable", Boolean(pro2), pro2 ? undefined : "sign-up/sign-in failed");

    const admin = await ensureAdminAccount();
    check("admin test account usable", Boolean(admin), admin ? undefined : "sign-up/sign-in failed");

    await phase1(customer, pro);
    if (customer && pro) {
      await phase2(customer, pro);
      await phase3(customer, pro);
    }
    if (customer && pro && pro2) {
      await phase4(customer, pro, pro2);
      await phase5(customer, pro, pro2);
    }
    if (admin && customer && pro && pro2) {
      await phase7(admin, customer, pro, pro2);
    }
  } finally {
    await prisma.$disconnect();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);

  if (failed.length > 0) {
    console.log("\nFailed checks:");
    for (const r of failed) {
      console.log(`  ✗ ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Smoke test crashed:", error);
  process.exit(1);
});
