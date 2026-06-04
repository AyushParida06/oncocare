import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from "@convex-dev/auth/react";
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signIn } = useAuthActions();

  const friendlyError = (msg = '') => {
    if (msg.includes('Invalid password') || msg.includes('invalid password'))
      return 'Incorrect password. Please try again.';
    if (msg.includes('already exists') || msg.includes('already registered'))
      return 'An account with this email already exists. Please sign in instead.';
    if (msg.includes('not found') || msg.includes('no account'))
      return 'No account found with this email. Please sign up first.';
    if (msg.includes('Invalid email') || msg.includes('invalid email'))
      return 'Please enter a valid email address.';
    return msg || 'Authentication failed. Please try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validation
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await signIn("password", { email, password, flow: isSignUp ? "signUp" : "signIn" });
      navigate('/home');
    } catch (error) {
      setErrorMsg(friendlyError(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? '#1a1a1a' : '#f4f6f8',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s ease'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(176,35,35,0.08) 0%, rgba(26,26,26,0) 70%)' : 'radial-gradient(circle, rgba(229,62,62,0.05) 0%, rgba(244,246,248,0) 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: isDark ? 'radial-gradient(circle, rgba(1,64,143,0.08) 0%, rgba(26,26,26,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(244,246,248,0) 70%)', zIndex: 0 }} />

      {/* Theme Toggle */}
      <div onClick={toggleTheme} style={{
        position: 'absolute', top: 24, right: 24, zIndex: 10,
        width: 40, height: 40, borderRadius: '50%',
        background: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
        border: `1px solid ${isDark ? '#444' : '#e5e7eb'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: isDark ? '#f5f5f5' : '#555',
        boxShadow: isDark ? '0 0 10px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}>
        <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: 20 }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: 420,
        background: isDark ? 'rgba(42,42,42,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isDark ? '#444' : '#e5e7eb'}`,
        borderRadius: 24,
        padding: '48px 40px',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(176,35,35,0.15)' : '0 12px 40px rgba(0,0,0,0.08)',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Logo Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <img src="/vistaonco-logo.png" alt="VistaOnco" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }} />
          
          <div style={{
            fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px',
            display: 'inline-block', padding: isDark ? '4px 12px' : '0', borderRadius: 8,
            background: isDark ? 'linear-gradient(90deg, rgba(176,35,35,0.15) 0%, rgba(1,64,143,0.15) 100%)' : 'transparent',
            boxShadow: isDark ? '0 0 16px rgba(176,35,35,0.3), 0 0 32px rgba(1,64,143,0.2)' : 'none',
          }}>
            <span style={{ color: '#B02323' }}>Vista</span><span style={{ color: '#01408F' }}>Onco</span>
          </div>
          <div style={{ fontSize: 13, color: isDark ? '#aaa' : '#666', marginTop: 8, letterSpacing: '0.02em', fontWeight: 500 }}>
            Hospital Management System
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#ccc' : '#555', marginBottom: 8, marginLeft: 4 }}>Email Address</div>
            <div style={{ position: 'relative' }}>
              <i className="ti ti-mail" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#888' : '#aaa', fontSize: 18 }} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="dr.ramesh@vistaonco.com"
                style={{
                  width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12,
                  background: isDark ? '#1a1a1a' : '#f9fafb',
                  border: `1px solid ${isDark ? '#444' : '#e5e7eb'}`,
                  color: isDark ? '#f5f5f5' : '#111',
                  fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#01408F'; e.target.style.boxShadow = isDark ? '0 0 0 3px rgba(1,64,143,0.2)' : '0 0 0 3px rgba(1,64,143,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = isDark ? '#444' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#ccc' : '#555', marginBottom: 8, marginLeft: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
            </div>
            <div style={{ position: 'relative' }}>
              <i className="ti ti-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#888' : '#aaa', fontSize: 18 }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12,
                  background: isDark ? '#1a1a1a' : '#f9fafb',
                  border: `1px solid ${isDark ? '#444' : '#e5e7eb'}`,
                  color: isDark ? '#f5f5f5' : '#111',
                  fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#01408F'; e.target.style.boxShadow = isDark ? '0 0 0 3px rgba(1,64,143,0.2)' : '0 0 0 3px rgba(1,64,143,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = isDark ? '#444' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ fontSize: 11, color: isDark ? '#777' : '#999', marginTop: 5, marginLeft: 4 }}>
              Minimum 8 characters required
            </div>
          </div>

          {isSignUp && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#ccc' : '#555', marginBottom: 8, marginLeft: 4 }}>
                Confirm Password
              </div>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-lock-check" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#888' : '#aaa', fontSize: 18 }} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required={isSignUp}
                  placeholder="Re-enter your password"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12,
                    background: isDark ? '#1a1a1a' : '#f9fafb',
                    border: `1px solid ${confirmPassword && confirmPassword !== password ? '#ef4444' : (isDark ? '#444' : '#e5e7eb')}`,
                    color: isDark ? '#f5f5f5' : '#111',
                    fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#01408F'; e.target.style.boxShadow = isDark ? '0 0 0 3px rgba(1,64,143,0.2)' : '0 0 0 3px rgba(1,64,143,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#ef4444' : (isDark ? '#444' : '#e5e7eb'); e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 5, marginLeft: 4 }}>
                  Passwords do not match
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: 12, width: '100%', padding: '14px', borderRadius: 12,
              background: loading ? (isDark ? '#444' : '#ccc') : 'linear-gradient(135deg, #01408F 0%, #003689 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: isDark && !loading ? '0 4px 14px rgba(1,64,143,0.4)' : '0 4px 14px rgba(1,64,143,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <><i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} /> Authenticating...</>
            ) : (
              <>{isSignUp ? 'Create Account' : 'Sign In'} <i className="ti ti-arrow-right" /></>
            )}
          </button>
          
          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 14, color: isDark ? '#aaa' : '#666', marginTop: 10 }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span 
              onClick={() => { setIsSignUp(!isSignUp); setConfirmPassword(''); setErrorMsg(''); }}
              style={{ color: '#01408F', cursor: 'pointer', fontWeight: 600 }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </div>
        </form>

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
