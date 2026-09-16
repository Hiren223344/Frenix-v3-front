import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Playground = lazy(() => import('./pages/Playground'));
const Models = lazy(() => import('./pages/Models'));
const Docs = lazy(() => import('./pages/Docs'));
const MCP = lazy(() => import('./pages/MCP'));
const Plugins = lazy(() => import('./pages/Plugins'));
const ResellerLayout = lazy(() => import('./pages/reseller/Layout'));
const ResellerDashboard = lazy(() => import('./pages/reseller/Dashboard'));
const ResellerAddon = lazy(() => import('./pages/reseller/Addon'));
const ResellerBuyers = lazy(() => import('./pages/reseller/Buyers'));
const ResellerTemplates = lazy(() => import('./pages/reseller/Templates'));
const Status = lazy(() => import('./pages/Status'));
const Changelog = lazy(() => import('./pages/Changelog'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Cookies = lazy(() => import('./pages/Cookies'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<Pricing />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="playground"
          element={
            <ProtectedRoute>
              <Playground />
            </ProtectedRoute>
          }
        />
        <Route path="models" element={<Models />} />
        <Route path="docs" element={<Docs />} />
        <Route path="mcp" element={<MCP />} />
        <Route
          path="plugins"
          element={
            <ProtectedRoute>
              <Plugins />
            </ProtectedRoute>
          }
        />
        {/* Path is "reseller", not "reselling", to avoid colliding with
            the backend's /reselling/* API prefix — a dev-proxy rule for
            that prefix would otherwise intercept this page's own
            navigation, not just its fetch() calls. */}
        <Route
          path="reseller"
          element={
            <ProtectedRoute>
              <ResellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ResellerDashboard />} />
          <Route path="addon" element={<ResellerAddon />} />
          <Route path="buyers" element={<ResellerBuyers />} />
          <Route path="templates" element={<ResellerTemplates />} />
          {/* Catches stale /reseller/plan and /templates links. */}
          <Route path="*" element={<Navigate to="/reseller/dashboard" replace />} />
        </Route>
        <Route path="status" element={<Status />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
