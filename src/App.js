import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Outpatient from './pages/Outpatient';
import Chemotherapy from './pages/Chemotherapy';
import Radiology from './pages/Radiology';
import LabResults from './pages/LabResults';
import Appointments from './pages/Appointments';
import Inpatient from './pages/Inpatient';
import Emergency from './pages/Emergency';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import TumourRegistry from './pages/TumourRegistry';
import ClinicalTrials from './pages/ClinicalTrials';
import PalliativeCare from './pages/PalliativeCare';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="outpatient" element={<Outpatient />} />
          <Route path="chemotherapy" element={<Chemotherapy />} />
          <Route path="radiology" element={<Radiology />} />
          <Route path="lab-results" element={<LabResults />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="inpatient" element={<Inpatient />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="billing" element={<Billing />} />
          <Route path="tumour-registry" element={<TumourRegistry />} />
          <Route path="clinical-trials" element={<ClinicalTrials />} />
          <Route path="palliative-care" element={<PalliativeCare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
