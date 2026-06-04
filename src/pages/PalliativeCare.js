import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';
export default function PalliativeCare() {
  return <PlaceholderPage
    title="Palliative Care"
    icon="ti-heart-handshake" color="#EEEDFE" iconColor="#534AB7"
    description="Support end-of-life care, pain management, and patient comfort planning"
    features={[
      { icon: 'ti-heart', label: 'Pain Assessment', desc: 'VAS/NRS pain scoring and tracking' },
      { icon: 'ti-pill', label: 'Symptom Management', desc: 'Palliative medication protocols' },
      { icon: 'ti-users', label: 'Family Counselling', desc: 'Family meetings and care plans' },
      { icon: 'ti-file-text', label: 'Advance Directives', desc: 'DNR, living wills and documentation' },
      { icon: 'ti-home', label: 'Home Care', desc: 'Home palliative care coordination' },
      { icon: 'ti-book', label: 'Bereavement Support', desc: 'Post-loss family support services' },
    ]}
  />;
}
