import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function Radiology() {
  return <PlaceholderPage
    title="Radiology & Imaging"
    icon="ti-radioactive" color="#E6F1FB" iconColor="#185FA5"
    description="Order and manage radiology requests, imaging reports, and PACS integration"
    features={[
      { icon: 'ti-scan', label: 'Order Imaging', desc: 'CT, MRI, PET-CT, X-Ray, Ultrasound' },
      { icon: 'ti-file-report', label: 'Radiology Reports', desc: 'View and sign off on imaging reports' },
      { icon: 'ti-photo', label: 'PACS Viewer', desc: 'View DICOM images inline' },
      { icon: 'ti-calendar', label: 'Scan Scheduling', desc: 'Allocate scanner slots and prep orders' },
      { icon: 'ti-chart-dots', label: 'Staging Imaging', desc: 'Baseline and restaging comparisons' },
      { icon: 'ti-history', label: 'Imaging History', desc: 'Full scan history per patient' },
    ]}
  />;
}
