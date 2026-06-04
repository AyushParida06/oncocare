import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function Inpatient() {
  return <PlaceholderPage
    title="Inpatient / Admission"
    icon="ti-bed" color="#EAF3DE" iconColor="#3B6D11"
    description="Manage patient admissions, discharges, transfers, and bed allocation"
    features={[
      { icon: 'ti-user-check', label: 'Admit Patient', desc: 'New admission with bed assignment' },
      { icon: 'ti-layout-grid', label: 'Bed Management', desc: 'Real-time bed occupancy view' },
      { icon: 'ti-transfer', label: 'Transfer', desc: 'Inter-ward and inter-facility transfers' },
      { icon: 'ti-user-minus', label: 'Discharge', desc: 'Discharge summaries and planning' },
      { icon: 'ti-clipboard-text', label: 'Daily Notes', desc: "Nursing notes and doctor's rounds" },
      { icon: 'ti-chart-infographic', label: 'Census Report', desc: 'Daily bed census and occupancy stats' },
    ]}
  />;
}
