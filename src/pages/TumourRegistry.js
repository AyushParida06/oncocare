import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function TumourRegistry() {
  return <PlaceholderPage
    title="Tumour Registry"
    icon="ti-dna" color="#E1F5EE" iconColor="#0F6E56"
    description="Cancer staging, TNM classification, registry submissions, and survival tracking"
    features={[
      { icon: 'ti-list-details', label: 'Cancer Staging', desc: 'TNM, AJCC, and clinical staging' },
      { icon: 'ti-database', label: 'Registry Entry', desc: 'Submit to national/state registries' },
      { icon: 'ti-chart-line', label: 'Survival Analysis', desc: 'Kaplan-Meier survival tracking' },
      { icon: 'ti-report-analytics', label: 'Incidence Reports', desc: 'Cancer type and stage distribution' },
      { icon: 'ti-refresh', label: 'Follow-up Tracking', desc: 'Long-term outcome monitoring' },
      { icon: 'ti-file-export', label: 'Data Export', desc: 'Export for research and reporting' },
    ]}
  />;
}
