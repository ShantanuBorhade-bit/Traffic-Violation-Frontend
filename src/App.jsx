import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import Spinner from './components/Spinner';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));

const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const MyChallans = lazy(() => import('./pages/citizen/MyChallans'));
const MyGrievances = lazy(() => import('./pages/citizen/MyGrievances'));
const FileGrievance = lazy(() => import('./pages/citizen/FileGrievance'));
const GrievanceDetail = lazy(() => import('./pages/citizen/GrievanceDetail'));

const OfficerDashboard = lazy(() => import('./pages/officer/OfficerDashboard'));
const OfficerGrievances = lazy(() => import('./pages/officer/OfficerGrievances'));
const OfficerGrievanceDetail = lazy(() => import('./pages/officer/OfficerGrievanceDetail'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminViolations = lazy(() => import('./pages/admin/AdminViolations'));
const AdminViolationDetail = lazy(() => import('./pages/admin/AdminViolationDetail'));
const AdminChallans = lazy(() => import('./pages/admin/AdminChallans'));
const AdminGrievances = lazy(() => import('./pages/admin/AdminGrievances'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

function DashboardRedirect() {
  return <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Profile */}
              <Route path="/profile" element={<Profile />} />

              {/* Citizen routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/challans"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <MyChallans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/grievances"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <MyGrievances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/grievances/new"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <FileGrievance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/grievances/:id"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <GrievanceDetail />
                  </ProtectedRoute>
                }
              />

              {/* Officer routes */}
              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={['GRIEVANCE_OFFICER', 'TRAFFIC_OFFICER']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/grievances"
                element={
                  <ProtectedRoute allowedRoles={['GRIEVANCE_OFFICER', 'TRAFFIC_OFFICER']}>
                    <OfficerGrievances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/grievances/:id"
                element={
                  <ProtectedRoute allowedRoles={['GRIEVANCE_OFFICER', 'TRAFFIC_OFFICER']}>
                    <OfficerGrievanceDetail />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/violations"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminViolations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/violations/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminViolationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/challans"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminChallans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/grievances"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminGrievances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<DashboardRedirect />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
