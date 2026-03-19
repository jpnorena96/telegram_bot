import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import AppointmentsPage from './pages/dashboard/AppointmentsPage';
import UsersPage from './pages/dashboard/UsersPage';
import SettingsPage from './pages/dashboard/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <LandingPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
