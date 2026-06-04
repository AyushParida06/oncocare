import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuthActions } from '@convex-dev/auth/react';

const getNavGroups = (l) => [
  {
    label: l('navGroup_Navigation'),
    items: [
      { path: '/home',      icon: 'ti-home',             label: l('mod_home') },
      { path: '/dashboard', icon: 'ti-layout-dashboard', label: l('mod_dashboard') },
    ],
  },
  {
    label: l('navGroup_ClinicalCare'),
    items: [
      { path: '/outpatient',       icon: 'ti-stethoscope', label: l('mod_outpatient') },
      { path: '/inpatient',        icon: 'ti-bed',         label: l('mod_inpatient') },
      { path: '/nursing',          icon: 'ti-user',        label: l('mod_nursing') },
      { path: '/clinical-pharmacy',icon: 'ti-pill',        label: l('mod_clinical_pharm') },
      { path: '/tumor-board',      icon: 'ti-users',       label: l('mod_tumor_board') },
      { path: '/clinical-quality', icon: 'ti-chart-bar',   label: l('mod_quality') },
    ],
  },
  {
    label: l('navGroup_Diagnostics'),
    items: [
      { path: '/lis',          icon: 'ti-microscope', label: l('mod_lis') },
      { path: '/ris',          icon: 'ti-camera',     label: l('mod_ris') },
      { path: '/pharmacy-mgmt',icon: 'ti-package',    label: l('mod_pharmacy') },
    ],
  },
  {
    label: l('navGroup_PatientFlow'),
    items: [
      { path: '/patient-billing', icon: 'ti-receipt',   label: l('mod_patient_billing') },
      { path: '/revenue-cycle',   icon: 'ti-chart-pie', label: l('mod_revenue_cycle') },
    ],
  },
];

const getPageTitles = (l) => ({
  '/home': l('mod_home'),
  '/dashboard': l('mod_dashboard'),
  '/outpatient': l('mod_outpatient'),
  '/inpatient': l('mod_inpatient'),
  '/nursing': l('mod_nursing'),
  '/clinical-pharmacy': l('mod_clinical_pharm'),
  '/tumor-board': l('mod_tumor_board'),
  '/clinical-quality': l('mod_quality'),
  '/lis': l('mod_lis'),
  '/ris': l('mod_ris'),
  '/pharmacy-mgmt': l('mod_pharmacy'),
  '/patient-billing': l('mod_patient_billing'),
  '/revenue-cycle': l('mod_revenue_cycle'),
});



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
  const navigate = useNavigate();
  const { language, setLanguage, t: l } = useLanguage();
  const { signOut } = useAuthActions();
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef(null);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const themeColors = themes[theme];
  const pageTitle = getPageTitles(l)[location.pathname] || 'VistaOnco';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGroups = getNavGroups(l).map(g => ({
    ...g,
    items: g.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.items.length > 0);

  const styles = {
    app: { display: 'flex', height: '100vh', background: themeColors.appBg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", transition: 'background 0.3s ease' },
    sidebar: { width: 220, minWidth: 220, background: themeColors.sidebarBg, borderRight: `0.5px solid ${themeColors.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', transition: 'background 0.3s ease, border-color 0.3s ease' },
    logoArea: { padding: '18px 16px 12px', borderBottom: `0.5px solid ${themeColors.border}`, transition: 'border-color 0.3s ease' },
    logoText: { fontSize: 20, fontWeight: 600, color: themeColors.logoColor, display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.3s ease' },
    logoDot: { width: 10, height: 10, borderRadius: '50%', background: themeColors.logoDot, transition: 'background 0.3s ease' },
    logoSub: { fontSize: 11, color: themeColors.textSecondary, marginTop: 2, letterSpacing: '0.04em', transition: 'color 0.3s ease' },
    sidebarSearch: { margin: '10px 10px 6px', padding: '7px 10px', borderRadius: 8, border: `0.5px solid ${themeColors.border}`, background: theme === 'light' ? '#f9fafb' : '#333', fontSize: 13, width: 'calc(100% - 20px)', outline: 'none', color: themeColors.textPrimary, transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease' },
    nav: { flex: 1, padding: '4px 0' },
    navSection: { padding: '10px 16px 4px', fontSize: 10, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 },
    navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', margin: '1px 6px', borderRadius: 8, fontSize: 13, color: themeColors.textSecondary, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s ease, color 0.2s ease' },
    navItemActive: { background: themeColors.accentBg, color: themeColors.accentText, fontWeight: 500, textShadow: theme === 'dark' ? '0 0 6px rgba(255,255,255,0.8)' : 'none', transition: 'background 0.2s ease, color 0.2s ease' },
    navIcon: { fontSize: 16 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { background: themeColors.topbarBg, borderBottom: `0.5px solid ${themeColors.border}`, padding: '0 20px', height: 52, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.3s ease, border-color 0.3s ease' },
    breadcrumb: { fontSize: 13, color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.3s ease' },
    breadcrumbActive: { color: themeColors.textPrimary, fontWeight: 5, textShadow: theme === 'dark' ? '0 0 6px rgba(255,255,255,0.8)' : 'none' },
    topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
    topbarIcon: { width: 32, height: 32, borderRadius: 8, border: `0.5px solid ${themeColors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', transition: 'background 0.2s ease, border-color 0.2s ease' },
    userPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 10px 4px 6px',
      border: `0.5px solid ${themeColors.border}`,
      borderRadius: 20,
      cursor: 'pointer',
      fontSize: 12,
      background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'transparent',
      boxShadow: theme === 'dark' ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
      transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },
    userAvatar: { width: 26, height: 26, borderRadius: '50%', background: themeColors.accentBg, color: themeColors.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, transition: 'background 0.2s ease, color 0.2s ease' },
    userName: { fontWeight: 500, color: themeColors.textPrimary, fontSize: 12, transition: 'color 0.3s ease' },
    userRole: { fontSize: 10, color: themeColors.textSecondary, transition: 'color 0.3s ease' },
    content: { flex: 1, overflowY: 'auto', padding: 20, background: themeColors.appBg, boxShadow: theme === 'dark' ? '0 0 12px rgba(255,255,255,0.4)' : 'none', transition: 'background 0.3s ease, box-shadow 0.3s ease' },
  };


  

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/vistaonco-logo.png"
              alt="VistaOnco Logo"
              style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }}
            />
            <div>
              <div style={{
                fontSize: 19,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.3px',
                display: 'inline-block',
                padding: theme === 'dark' ? '3px 8px' : '0',
                borderRadius: 6,
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(176,35,35,0.18) 0%, rgba(1,64,143,0.18) 100%)'
                  : 'transparent',
                boxShadow: theme === 'dark'
                  ? '0 0 12px rgba(176,35,35,0.35), 0 0 24px rgba(1,64,143,0.25)'
                  : 'none',
                transition: 'background 0.4s ease, box-shadow 0.4s ease, padding 0.4s ease',
              }}>
                <span style={{ color: '#B02323' }}>Vista</span><span style={{ color: '#01408F' }}>Onco</span>
              </div>
              <div style={styles.logoSub}>Hospital Management System</div>
            </div>
          </div>
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
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div style={styles.userPill} onClick={() => setShowUserMenu(!showUserMenu)}>
                <div style={styles.userAvatar}>DR</div>
                <div>
                  <div style={styles.userName}>Dr. Ramesh K</div>
                  <div style={styles.userRole}>{l('ui_dept')}</div>
                </div>
                <i className="ti ti-chevron-down" style={{ fontSize: 14, color: themeColors.textSecondary, marginLeft: 4 }} />
              </div>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: 200,
                  background: theme === 'dark' ? '#2a2a2a' : '#fff',
                  border: `0.5px solid ${themeColors.border}`,
                  borderRadius: 12,
                  boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                  padding: '8px 0',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div 
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13, color: themeColors.textPrimary, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#333' : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowLangMenu(!showLangMenu)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <i className="ti ti-world" style={{ fontSize: 16, color: themeColors.textSecondary }} />
                      {language}
                    </div>
                    <i className={`ti ti-chevron-${showLangMenu ? 'up' : 'down'}`} style={{ fontSize: 14, color: themeColors.textSecondary }} />
                  </div>
                  
                  {/* Language Options Sub-menu */}
                  {showLangMenu && (
                    <div style={{ background: theme === 'dark' ? '#222' : '#f4f6f8', padding: '4px 0', borderTop: `0.5px solid ${themeColors.border}`, borderBottom: `0.5px solid ${themeColors.border}` }}>
                      {['English', 'Hindi', 'Odia', 'Marathi'].map(lang => (
                        <div 
                          key={lang}
                          style={{ 
                            padding: '8px 16px 8px 42px', 
                            cursor: 'pointer', 
                            fontSize: 12, 
                            color: language === lang ? (theme === 'dark' ? '#4ade80' : '#0F6E56') : themeColors.textSecondary,
                            fontWeight: language === lang ? 600 : 400,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#333' : '#e5e7eb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setLanguage(lang); setShowLangMenu(false); setShowUserMenu(false); }}
                        >
                          {lang}
                          {language === lang && <i className="ti ti-check" style={{ fontSize: 14 }} />}
                        </div>
                      ))}
                    </div>
                  )}
                  <div 
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: themeColors.textPrimary, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#333' : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="ti ti-user" style={{ fontSize: 16, color: themeColors.textSecondary }} />
                    {l('ui_profile')}
                  </div>
                  <div style={{ height: 1, background: themeColors.border, margin: '4px 0' }} />
                  <div 
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#ef4444', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => { setShowUserMenu(false); void signOut(); }}
                  >
                    <i className="ti ti-logout" style={{ fontSize: 16 }} />
                    {l('ui_logout')}
                  </div>
                </div>
              )}
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

