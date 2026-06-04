import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function ClinicalTrials() {
  return <PlaceholderPage
    title="Clinical Trials"
    icon="ti-activity" color="#E6F1FB" iconColor="#185FA5"
    description="Manage clinical trial enrolment, protocol compliance, and data collection"
    features={[
      { icon: 'ti-user-check', label: 'Patient Enrolment', desc: 'Screen and enrol eligible patients' },
      { icon: 'ti-clipboard-data', label: 'Protocol Management', desc: 'Trial protocols and amendments' },
      { icon: 'ti-calendar-event', label: 'Visit Schedule', desc: 'Study visit tracking and reminders' },
      { icon: 'ti-file-report', label: 'CRF Entry', desc: 'Case report form data collection' },
      { icon: 'ti-alert-circle', label: 'SAE Reporting', desc: 'Serious adverse event reporting' },
      { icon: 'ti-chart-dots', label: 'Trial Analytics', desc: 'Enrolment progress and outcomes' },
    ]}
  />;
}
