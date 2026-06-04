import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function Billing() {
  return <PlaceholderPage
    title="Billing & Insurance"
    icon="ti-receipt" color="#f4f6f8" iconColor="#555"
    description="Manage invoices, insurance claims, payments, and financial reports"
    features={[
      { icon: 'ti-file-invoice', label: 'Generate Invoice', desc: 'Auto-generate itemised bills' },
      { icon: 'ti-building-bank', label: 'Insurance Claims', desc: 'Submit and track TPA/insurer claims' },
      { icon: 'ti-credit-card', label: 'Payments', desc: 'Record cash, card and UPI payments' },
      { icon: 'ti-chart-pie', label: 'Revenue Reports', desc: 'Daily, monthly revenue analytics' },
      { icon: 'ti-file-text', label: 'Discharge Bills', desc: 'Final billing at discharge' },
      { icon: 'ti-coin', label: 'Packages', desc: 'Oncology treatment packages & pricing' },
    ]}
  />;
}
