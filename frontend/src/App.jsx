import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardLayout from './components/layout/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import DocumentsPage from './pages/dashboard/DocumentsPage';
import UsersPage from './pages/dashboard/UsersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AdminPage from './pages/dashboard/AdminPage';
import AdminAgenciesPage from './pages/dashboard/AdminAgenciesPage';
import SearchPage from './pages/dashboard/SearchPage';
import NotificationsHistory from './pages/dashboard/NotificationsHistory';
import AgencyProfilePage from './pages/dashboard/AgencyProfilePage';
import VisaProcessesPage from './pages/dashboard/VisaProcessesPage';
import VisaProcessDetailsPage from './pages/dashboard/VisaProcessDetailsPage';
import WalletPage from './pages/dashboard/WalletPage';
import ClientPortalPage from './pages/ClientPortalPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--black-2)',
            color: 'var(--text-1)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            borderRadius: '0px'
          },
          success: {
            iconTheme: {
              primary: 'var(--lime)',
              secondary: 'var(--black)',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/client-portal/:id" element={<ClientPortalPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="documentos" element={<VisaProcessesPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="auditoria" element={<AdminPage />} />
          <Route path="admin-agencias" element={<AdminAgenciesPage />} />
          <Route path="buscar" element={<SearchPage />} />
          <Route path="notificaciones" element={<NotificationsHistory />} />
          <Route path="agencia-perfil" element={<AgencyProfilePage />} />
          <Route path="visa-processes" element={<VisaProcessesPage />} />
          <Route path="visa-processes/:id" element={<VisaProcessDetailsPage />} />
          <Route path="billetera" element={<WalletPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
