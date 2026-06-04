import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';

const navGroups = [
  {
    label: 'Navigation',
    items: [
      { path: '/home', icon: 'ti-home', label: 'Home' },
      { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { path: '/outpatient', icon: 'ti-stethoscope', label: 'Outpatient' },
      { path: '/chemotherapy', icon: 'ti-pill', label: 'Chemotherapy' },
      { path: '/radiology', icon: 'ti-radioactive', label: 'Radiology & Imaging' },
      { path: '/lab-results', icon: 'ti-microscope', label: 'Lab Results' },
      { path: '/inpatient', icon: 'ti-bed', label: 'Inpatient' },
      { path: '/emergency', icon: 'ti-urgent', label: 'Emergency' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/appointments', icon: 'ti-calendar-event', label: 'Appointments' },
      { path: '/pharmacy', icon: 'ti-pill', label: 'Pharmacy' },
      { path: '/billing', icon: 'ti-receipt', label: 'Billing & Insurance' },
    ],
  },
  {
    label: 'Oncology',
    items: [
      { path: '/tumour-registry', icon: 'ti-dna', label: 'Tumour Registry' },
      { path: '/clinical-trials', icon: 'ti-activity', label: 'Clinical Trials' },
      { path: '/palliative-care', icon: 'ti-heart-handshake', label: 'Palliative Care' },
    ],
  },
];

const pageTitles = {
  '/home': 'Home',
  '/dashboard': 'Dashboard',
  '/outpatient': 'Outpatient Consultation',
  '/chemotherapy': 'Chemotherapy',
  '/radiology': 'Radiology & Imaging',
  '/lab-results': 'Lab Results',
  '/inpatient': 'Inpatient / Admission',
  '/emergency': 'Emergency Department',
  '/appointments': 'Appointments',
  '/pharmacy': 'Pharmacy',
  '/billing': 'Billing & Insurance',
  '/tumour-registry': 'Tumour Registry',
  '/clinical-trials': 'Clinical Trials',
  '/palliative-care': 'Palliative Care',
};



const themes = {
  light: {
    appBg: '#f4f6f8',
    sidebarBg: '#fff',
    topbarBg: '#fff',
    textPrimary: '#111',
    textSecondary: '#555',
    border: '#e5e7eb',
    accentBg: '#E1F5EE',
    accentText: '#0F6E56',
    logoColor: '#0F6E56',
    logoDot: '#1D9E75',
  },
  dark: {
    appBg: '#1a1a1a',
    sidebarBg: '#252525',
    topbarBg: '#2c2c2c',
    textPrimary: '#f5f5f5',
    textSecondary: '#cccccc',
    border: '#444',
    accentBg: '#0F6E56',
    accentText: '#E1F5EE',
    logoColor: '#E1F5EE',
    logoDot: '#4caf50',
  },
};

export default function Layout() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const t = themes[theme];
  const pageTitle = pageTitles[location.pathname] || 'OncoCare';

  const filteredGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.items.length > 0);

  const styles = {
    app: { display: 'flex', height: '100vh', background: t.appBg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", transition: 'background 0.3s ease' },
    sidebar: { width: 220, minWidth: 220, background: t.sidebarBg, borderRight: `0.5px solid ${t.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', transition: 'background 0.3s ease, border-color 0.3s ease' },
    logoArea: { padding: '18px 16px 12px', borderBottom: `0.5px solid ${t.border}`, transition: 'border-color 0.3s ease' },
    logoText: { fontSize: 20, fontWeight: 600, color: t.logoColor, display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.3s ease' },
    logoDot: { width: 10, height: 10, borderRadius: '50%', background: t.logoDot, transition: 'background 0.3s ease' },
    logoSub: { fontSize: 11, color: t.textSecondary, marginTop: 2, letterSpacing: '0.04em', transition: 'color 0.3s ease' },
    sidebarSearch: { margin: '10px 10px 6px', padding: '7px 10px', borderRadius: 8, border: `0.5px solid ${t.border}`, background: theme === 'light' ? '#f9fafb' : '#333', fontSize: 13, width: 'calc(100% - 20px)', outline: 'none', color: t.textPrimary, transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease' },
    nav: { flex: 1, padding: '4px 0' },
    navSection: { padding: '10px 16px 4px', fontSize: 10, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', margin: '1px 6px', borderRadius: 8, fontSize: 13, color: t.textSecondary, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s ease, color 0.2s ease' },
    navItemActive: { background: t.accentBg, color: t.accentText, fontWeight: 500, textShadow: theme === 'dark' ? '0 0 6px rgba(255,255,255,0.8)' : 'none', transition: 'background 0.2s ease, color 0.2s ease' },
    navIcon: { fontSize: 16 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { background: t.topbarBg, borderBottom: `0.5px solid ${t.border}`, padding: '0 20px', height: 52, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.3s ease, border-color 0.3s ease' },
    breadcrumb: { fontSize: 13, color: t.textSecondary, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.3s ease' },
    breadcrumbActive: { color: t.textPrimary, fontWeight: 5, textShadow: theme === 'dark' ? '0 0 6px rgba(255,255,255,0.8)' : 'none' },
    topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
    topbarIcon: { width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', transition: 'background 0.2s ease, border-color 0.2s ease' },
    userPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 10px 4px 6px',
      border: `0.5px solid ${t.border}`,
      borderRadius: 20,
      cursor: 'pointer',
      fontSize: 12,
      background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'transparent',
      boxShadow: theme === 'dark' ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
      transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },
    userAvatar: { width: 26, height: 26, borderRadius: '50%', background: t.accentBg, color: t.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, transition: 'background 0.2s ease, color 0.2s ease' },
    userName: { fontWeight: 500, color: t.textPrimary, fontSize: 12, transition: 'color 0.3s ease' },
    userRole: { fontSize: 10, color: t.textSecondary, transition: 'color 0.3s ease' },
    content: { flex: 1, overflowY: 'auto', padding: 20, background: t.appBg, boxShadow: theme === 'dark' ? '0 0 12px rgba(255,255,255,0.4)' : 'none', transition: 'background 0.3s ease, box-shadow 0.3s ease' },
  };


  

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoText}>
            <div style={styles.logoDot} />
            OncoCare
          </div>
          <div style={styles.logoSub}>Cancer Care Management</div>
        </div>

        <input
          style={styles.sidebarSearch}
          placeholder="Search menus…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <nav style={styles.nav}>
          {filteredGroups.map(group => (
            <div key={group.label}>
              <div style={styles.navSection}>{group.label}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  })}
                >
                  <i className={`ti ${item.icon}`} style={styles.navIcon} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.breadcrumb}>
            <i className="ti ti-home" style={{ fontSize: 14 }} />
            <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#999' }} />
            <span style={styles.breadcrumbActive}>{pageTitle}</span>
          </div>
          <div style={styles.topbarRight}>
            {["ti-notes", "ti-bell", "ti-apps", "ti-settings"].map(icon => (
              <div key={icon} style={styles.topbarIcon}>
                <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
              </div>
            ))}
            {/* Theme toggle */}
            <div onClick={toggleTheme} style={styles.topbarIcon} title="Toggle theme">
              <i className={`ti ${theme === 'light' ? 'ti-moon' : 'ti-sun'}`} style={{ fontSize: 16 }} />
            </div>
            <div style={styles.userPill}>
              <div style={styles.userAvatar}>DR</div>
              <div>
                <div style={styles.userName}>Dr. Ramesh K</div>
                <div style={styles.userRole}>Oncology Dept.</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={styles.content}>
          <ThemeProvider value={{ theme }}>
            <Outlet />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}

