import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyChallans from './pages/citizen/MyChallans';
import MyGrievances from './pages/citizen/MyGrievances';
import FileGrievance from './pages/citizen/FileGrievance';
import GrievanceDetail from './pages/citizen/GrievanceDetail';

// Officer
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerGrievances from './pages/officer/OfficerGrievances';
import OfficerGrievanceDetail from './pages/officer/OfficerGrievanceDetail';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminViolations from './pages/admin/AdminViolations';
import AdminViolationDetail from './pages/admin/AdminViolationDetail';
import AdminChallans from './pages/admin/AdminChallans';
import AdminGrievances from './pages/admin/AdminGrievances';
import AdminUsers from './pages/admin/AdminUsers';

function PublicRoute({ children }) {
  return children;
}

function DashboardRedirect() {
  // This is a catch-all route that redirects to the appropriate dashboard
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
