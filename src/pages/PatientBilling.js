import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { jsPDF } from 'jspdf';

export default function PatientBilling() {
  const { theme } = useTheme();
  const { t: l } = useLanguage();
  const isDark = theme === 'dark';

  const patients = useQuery(api.patients.list) || [];
  const invoices = useQuery(api.billing.getInvoices) || [];
  
  const addInvoice = useMutation(api.billing.addInvoice);
  const updateInvoiceStatus = useMutation(api.billing.updateInvoiceStatus);
  const deleteInvoice = useMutation(api.billing.deleteInvoice);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    description: ''
  });

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const totalUnpaid = unpaidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRevenue = paidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.amount || !formData.description) return;
    
    const today = new Date().toISOString().split('T')[0];

    await addInvoice({
      patientId: formData.patientId,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: today,
      status: 'unpaid'
    });

    setShowModal(false);
    setFormData({ patientId: '', amount: '', description: '' });
  };

  const downloadPDF = (inv, statusLabel) => {
    const doc = generateInvoicePDF(inv.patientId, inv.amount, inv.description, inv.date, statusLabel);
    const prefix = statusLabel === 'Paid' ? 'Receipt' : 'Invoice';
    doc.save(`${prefix}_${getPatientMRN(inv.patientId)}_${inv.date}.pdf`);
  };

  const generateInvoicePDF = (patientId, amount, description, date, statusLabel) => {
    const doc = new jsPDF();
    const patientName = getPatientName(patientId);
    const patientMRN = getPatientMRN(patientId);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Green
    doc.text('VistaOnco Hospital', 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(statusLabel === 'Paid' ? 'Payment Receipt' : 'Patient Invoice', 20, 30);

    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    // Patient Details
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Date: ${date}`, 20, 45);
    doc.text(`Patient Name: ${patientName}`, 20, 55);
    doc.text(`MRN: ${patientMRN}`, 20, 65);
    doc.text(`Status: ${statusLabel}`, 20, 75);

    // Invoice Details Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 90, 170, 10, 'F');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Description', 25, 97);
    doc.text('Amount', 150, 97);

    // Invoice Row
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(description, 25, 110);
    doc.text(`Rs. ${parseFloat(amount).toLocaleString()}`, 150, 110);

    // Total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 120, 190, 120);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Total Amount Due:', 100, 130);
    doc.setTextColor(statusLabel === 'Paid' ? 16 : 239, statusLabel === 'Paid' ? 185 : 68, statusLabel === 'Paid' ? 129 : 68); 
    doc.text(`Rs. ${parseFloat(amount).toLocaleString()}`, 150, 130);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing VistaOnco Hospital.', 20, 280);

    return doc;
  };

  const handleMarkPaid = async (id) => {
    await updateInvoiceStatus({ id, status: 'paid' });
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      await deleteInvoice({ id });
    }
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
  };

  const getPatientMRN = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? p.mrn : 'N/A';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
        
        {/* Banner */}
        <div style={{
          background: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #fff 100%)',
          border: `0.5px solid ${isDark ? 'rgba(16,185,129,0.4)' : '#d1fae5'}`,
          borderRadius: 16,
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ background: isDark ? '#34d399' : '#10b981', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? '0 0 12px rgba(52,211,153,0.6)' : 'none' }}>
                  <i className="ti ti-receipt-2" style={{ fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#e2e8f0' : '#111' }}>{l('mod_billing')}</div>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#3a3f5c' }}>
                {l('desc_billing')}
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: isDark ? '#34d399' : '#10b981',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: isDark ? '0 0 12px rgba(52,211,153,0.4)' : '0 4px 12px rgba(16,185,129,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <i className="ti ti-plus" />
              {l('billing_new_invoice')}
            </button>
          </div>
        </div>

        {/* Stat Card 1 */}
        <div style={{
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 13, color: isDark ? '#64748b' : '#666', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
            {l('billing_total_unpaid')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>
            ₹{totalUnpaid.toLocaleString()}
          </div>
        </div>

        {/* Stat Card 2 */}
        <div style={{
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 13, color: isDark ? '#64748b' : '#666', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
            {l('billing_total_revenue')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Unpaid Invoices Grid */}
      <div style={{
        background: isDark ? '#12141f' : '#fff',
        border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-file-invoice" style={{ color: isDark ? '#f87171' : '#ef4444' }} />
          {l('billing_unpaid')} ({unpaidInvoices.length})
        </div>
        
        {unpaidInvoices.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#888' : '#64748b', fontSize: 14 }}>
            No unpaid invoices found. All caught up!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('billing_description')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('billing_amount')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.map(inv => (
                  <tr key={inv._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#ddd' : '#2d3148' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', color: isDark ? '#f87171' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                          {getPatientName(inv.patientId).charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{getPatientName(inv.patientId)}</div>
                          <div style={{ fontSize: 12, color: isDark ? '#888' : '#888', fontFamily: 'monospace' }}>{getPatientMRN(inv.patientId)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: isDark ? '#64748b' : '#666' }}>{inv.date}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{inv.description}</td>
                    <td style={{ padding: '16px', fontWeight: 700, color: isDark ? '#f87171' : '#ef4444' }}>₹{inv.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button 
                        onClick={() => handleMarkPaid(inv._id)}
                        style={{
                          background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                          color: isDark ? '#34d399' : '#059669',
                          border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0'}`,
                          padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                        }}
                      >
                        {l('billing_mark_paid')}
                      </button>
                      <button 
                        onClick={() => downloadPDF(inv, 'Unpaid')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isDark ? '#38bdf8' : '#0ea5e9',
                          cursor: 'pointer',
                          fontSize: 16,
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                          borderRadius: 4
                        }}
                        title="Download Invoice"
                      >
                        <i className="ti ti-download" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(inv._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isDark ? '#f87171' : '#ef4444',
                          cursor: 'pointer',
                          fontSize: 16,
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                          borderRadius: 4
                        }}
                        title="Delete Invoice"
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paid Invoices History */}
      {paidInvoices.length > 0 && (
        <div style={{
          background: isDark ? '#12141f' : '#fff',
          border: `0.5px solid ${isDark ? '#2d3148' : '#eee'}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#e2e8f0' : '#111', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-receipt" style={{ color: isDark ? '#34d399' : '#10b981' }} />
            {l('billing_paid')}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, color: isDark ? '#64748b' : '#666', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Patient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('billing_description')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>{l('billing_amount')}</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidInvoices.map(inv => (
                  <tr key={inv._id} style={{ borderBottom: `1px solid ${isDark ? '#16182a' : '#e2e8f0'}`, color: isDark ? '#888' : '#777' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{getPatientName(inv.patientId)}</td>
                    <td style={{ padding: '16px' }}>{inv.date}</td>
                    <td style={{ padding: '16px' }}>{inv.description}</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>₹{inv.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: isDark ? '#34d399' : '#059669', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <i className="ti ti-check" style={{ marginRight: 4 }} />
                        {l('billing_status_paid')}
                      </div>
                      <button 
                        onClick={() => downloadPDF(inv, 'Paid')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isDark ? '#34d399' : '#10b981',
                          cursor: 'pointer',
                          fontSize: 16,
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                          borderRadius: 4
                        }}
                        title="Download Receipt"
                      >
                        <i className="ti ti-download" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#12141f' : '#fff',
            border: `1px solid ${isDark ? '#2d3148' : '#eee'}`,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#2d3148' : '#eee'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{l('billing_new_invoice')}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: isDark ? '#64748b' : '#666', cursor: 'pointer', fontSize: 20 }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddInvoice} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>Select Patient</label>
                <select 
                  required
                  value={formData.patientId} 
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('billing_description')}</label>
                <input 
                  type="text" required placeholder="e.g. Cycle 1 Chemotherapy Administration"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#3a3f5c' }}>{l('billing_amount')}</label>
                <input 
                  type="number" required min="0" step="0.01" placeholder="e.g. 5000"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  style={{ 
                    padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, 
                    background: isDark ? '#16182a' : '#f9fafb', color: isDark ? '#fff' : '#111', fontSize: 14, outline: 'none' 
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#2d3148' : '#ddd'}`, background: 'transparent', color: isDark ? '#64748b' : '#3a3f5c', cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: isDark ? '#34d399' : '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Create Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
