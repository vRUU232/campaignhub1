import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignForm from './pages/CampaignForm';
import CampaignDetail from './pages/CampaignDetail';
import Contacts from './pages/Contacts';
import Inbox from './pages/Inbox';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Groups from './pages/Groups';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 2000,
            style: {
              background: '#fff',
              color: '#1f172f',
              borderRadius: '12px',
              padding: '14px 20px',
              boxShadow: '0 8px 30px rgba(31, 23, 47, 0.15)',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '380px',
              border: '1px solid rgba(31, 23, 47, 0.08)',
            },
            success: {
              duration: 2000,
              style: {
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 2000,
              style: {
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                background: '#fefce8',
                border: '1px solid #fde047',
                color: '#854d0e',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CampaignForm />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 - catch-all route for unmatched URLs */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
