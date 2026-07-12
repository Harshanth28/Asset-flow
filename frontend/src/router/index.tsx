import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';

// View components (scaffolded placeholders)
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import OrgSetup from '../pages/OrgSetup';
import AssetDirectory from '../pages/AssetDirectory';
import Allocations from '../pages/Allocations';
import Bookings from '../pages/Bookings';
import Maintenance from '../pages/Maintenance';
import Audits from '../pages/Audits';
import Reports from '../pages/Reports';
import Logs from '../pages/Logs';
import Forbidden from '../pages/Forbidden';

export const router = createBrowserRouter([
  // Public Access Guest Routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  
  // Protected Routes (Required Authentication)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          // Common Views Accessible by All Authenticated Users
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/assets',
            element: <AssetDirectory />,
          },
          {
            path: '/bookings',
            element: <Bookings />,
          },
          {
            path: '/maintenance',
            element: <Maintenance />,
          },
          {
            path: '/forbidden',
            element: <Forbidden />,
          },
          
          // Administrator Setup Views (Admin only)
          {
            element: <RoleRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: '/org-setup',
                element: <OrgSetup />,
              },
            ],
          },
          
          // Audits and Activity Logs (Admin & Asset Manager)
          {
            element: <RoleRoute allowedRoles={['ADMIN', 'ASSET_MANAGER']} />,
            children: [
              {
                path: '/audits',
                element: <Audits />,
              },
              {
                path: '/logs',
                element: <Logs />,
              },
            ],
          },

          // Allocations, Transfers & Analytics (Admin, Asset Manager, Dept Head)
          {
            element: <RoleRoute allowedRoles={['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD']} />,
            children: [
              {
                path: '/allocations',
                element: <Allocations />,
              },
              {
                path: '/reports',
                element: <Reports />,
              },
            ],
          },

          // Redirect fallback root
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
]);
