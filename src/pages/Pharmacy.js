import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function Pharmacy() {
  return <PlaceholderPage
    title="Pharmacy"
    icon="ti-pill" color="#FBEAF0" iconColor="#993556"
    description="Manage chemotherapy drugs, general medications, prescriptions, and inventory"
    features={[
      { icon: 'ti-clipboard-list', label: 'Prescriptions', desc: 'Receive and process prescriptions' },
      { icon: 'ti-package', label: 'Drug Inventory', desc: 'Stock levels and expiry tracking' },
      { icon: 'ti-refresh', label: 'Chemo Dispensing', desc: 'Cytotoxic drug preparation and issue' },
      { icon: 'ti-alert-circle', label: 'Drug Interactions', desc: 'Automated interaction checking' },
      { icon: 'ti-truck', label: 'Procurement', desc: 'PO and vendor management' },
      { icon: 'ti-chart-bar', label: 'Consumption Report', desc: 'Drug usage and wastage analytics' },
    ]}
  />;
}
