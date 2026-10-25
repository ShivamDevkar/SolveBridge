import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { ProfessionalLayout } from '@/layouts/ProfessionalLayout';
import { JobWorkspaceLayout } from '@/layouts/JobWorkspaceLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage, PublicProProfilePage } from '@/pages/public/AboutPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth/RegisterPage';

// Customer Pages
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import {
  CreateProblemPage,
  CustomerProblemsListPage,
  CustomerProblemDetailPage,
  ProposalComparisonPage,
  CustomerJobsListPage,
  CustomerMessagesPage,
  CustomerReviewsPage,
  CustomerNotificationsPage,
  CustomerProfilePage,
  CustomerSettingsPage,
} from '@/pages/customer/CustomerProblemPages';

// Professional Pages
import { ProDashboardPage } from '@/pages/professional/ProDashboardPage';
import {
  MatchingProblemsPage,
  ProProblemInspectPage,
  MyProposalsPage,
  ProJobsListPage,
  ProMessagesPage,
  ProReviewsPage,
  ProSchedulePage,
  ProEarningsPage,
  ProProfileEditPage,
  ProVerificationPage,
  ProSettingsPage,
} from '@/pages/professional/ProPages';

// Job Workspace Pages
import {
  JobWorkspaceOverviewPage,
  JobWorkspaceChatPage,
  QuoteRevisionPage,
  JobCompletionPage,
  JobReviewPage,
  JobDisputePage,
} from '@/pages/job/JobWorkspacePages';

// Admin Console Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import {
  AdminProfessionalsListPage,
  AdminVerificationQueuePage,
  AdminVerificationDetailPage,
  AdminProblemsListPage,
  AdminJobsListPage,
  AdminDisputesListPage,
  AdminDisputeDetailPage,
  AdminCategoriesPage,
  AdminUsersListPage,
  AdminReportsPage,
  AdminAnalyticsPage,
  AdminAuditLogsPage,
  AdminSettingsPage,
} from '@/pages/admin/AdminPages';

// 404
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // 1. Public Marketing Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'professionals/:proId', element: <PublicProProfilePage /> },
    ],
  },

  // 2. Authentication Routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // 3. Customer Portal Routes
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: 'dashboard', element: <CustomerDashboardPage /> },
      { path: 'problems/new', element: <CreateProblemPage /> },
      { path: 'problems', element: <CustomerProblemsListPage /> },
      { path: 'problems/:problemId', element: <CustomerProblemDetailPage /> },
      { path: 'problems/:problemId/compare', element: <ProposalComparisonPage /> },
      { path: 'jobs', element: <CustomerJobsListPage /> },
      { path: 'messages', element: <CustomerMessagesPage /> },
      { path: 'reviews', element: <CustomerReviewsPage /> },
      { path: 'notifications', element: <CustomerNotificationsPage /> },
      { path: 'profile', element: <CustomerProfilePage /> },
      { path: 'settings', element: <CustomerSettingsPage /> },
    ],
  },

  // 4. Professional Portal Routes
  {
    path: '/pro',
    element: <ProfessionalLayout />,
    children: [
      { index: true, element: <Navigate to="/pro/dashboard" replace /> },
      { path: 'dashboard', element: <ProDashboardPage /> },
      { path: 'matching-problems', element: <MatchingProblemsPage /> },
      { path: 'matching-problems/:problemId', element: <ProProblemInspectPage /> },
      { path: 'proposals', element: <MyProposalsPage /> },
      { path: 'jobs', element: <ProJobsListPage /> },
      { path: 'messages', element: <ProMessagesPage /> },
      { path: 'reviews', element: <ProReviewsPage /> },
      { path: 'schedule', element: <ProSchedulePage /> },
      { path: 'earnings', element: <ProEarningsPage /> },
      { path: 'profile', element: <ProProfileEditPage /> },
      { path: 'verification', element: <ProVerificationPage /> },
      { path: 'settings', element: <ProSettingsPage /> },
    ],
  },

  // 5. Dedicated Shared Job Workspace Routes
  {
    path: '/jobs/:jobId',
    element: <JobWorkspaceLayout />,
    children: [
      { index: true, element: <JobWorkspaceOverviewPage /> },
      { path: 'chat', element: <JobWorkspaceChatPage /> },
      { path: 'quote-revision', element: <QuoteRevisionPage /> },
      { path: 'completion', element: <JobCompletionPage /> },
      { path: 'review', element: <JobReviewPage /> },
      { path: 'dispute', element: <JobDisputePage /> },
    ],
  },

  // 6. Admin Console Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'professionals', element: <AdminProfessionalsListPage /> },
      { path: 'verification', element: <AdminVerificationQueuePage /> },
      { path: 'verification/:proId', element: <AdminVerificationDetailPage /> },
      { path: 'problems', element: <AdminProblemsListPage /> },
      { path: 'jobs', element: <AdminJobsListPage /> },
      { path: 'disputes', element: <AdminDisputesListPage /> },
      { path: 'disputes/:disputeId', element: <AdminDisputeDetailPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'users', element: <AdminUsersListPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
