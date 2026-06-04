import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function Emergency() {
  return <PlaceholderPage
    title="Emergency Department"
    icon="ti-urgent" color="#FCEBEB" iconColor="#A32D2D"
    description="Handle urgent oncology emergencies including febrile neutropenia, SVC syndrome and more"
    features={[
      { icon: 'ti-user-scan', label: 'Triage', desc: 'Emergency triage and priority tagging' },
      { icon: 'ti-stethoscope', label: 'Assessment', desc: 'Rapid clinical assessment forms' },
      { icon: 'ti-alert-octagon', label: 'Oncology Emergencies', desc: 'Protocols for chemo toxicities' },
      { icon: 'ti-bed', label: 'Emergency Beds', desc: 'Real-time emergency bay status' },
      { icon: 'ti-ambulance', label: 'Triage Log', desc: 'Time-stamped arrival and treatment log' },
      { icon: 'ti-transfer', label: 'Admit / Transfer', desc: 'Fast-track admission from ED' },
    ]}
  />;
}
