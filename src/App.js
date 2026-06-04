import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Outpatient from './pages/Outpatient';
import Inpatient from './pages/Inpatient';
import Nursing from './pages/Nursing';
import ClinicalPharmacy from './pages/ClinicalPharmacy';
import TumorBoard from './pages/TumorBoard';
import ClinicalQuality from './pages/ClinicalQuality';
import LIS from './pages/LIS';
import RIS from './pages/RIS';
import PharmacyMgmt from './pages/PharmacyMgmt';
import PatientBilling from './pages/PatientBilling';
import RevenueCycle from './pages/RevenueCycle';

export default function App() {
  return (
    <BrowserRouter>
      <AuthLoading>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#fff' }}>
          Loading VistaOnco...
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Routes>
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Unauthenticated>
      <Authenticated>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route element={<Layout />}>
            <Route path="home" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="outpatient" element={<Outpatient />} />
            <Route path="inpatient" element={<Inpatient />} />
            <Route path="nursing" element={<Nursing />} />
            <Route path="clinical-pharmacy" element={<ClinicalPharmacy />} />
            <Route path="tumor-board" element={<TumorBoard />} />
            <Route path="clinical-quality" element={<ClinicalQuality />} />
            <Route path="lis" element={<LIS />} />
            <Route path="ris" element={<RIS />} />
            <Route path="pharmacy-mgmt" element={<PharmacyMgmt />} />
            <Route path="patient-billing" element={<PatientBilling />} />
            <Route path="revenue-cycle" element={<RevenueCycle />} />
          </Route>
        </Routes>
      </Authenticated>
    </BrowserRouter>
  );
}
