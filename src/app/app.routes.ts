import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard',        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'outpatient',       loadComponent: () => import('./pages/outpatient/outpatient.component').then(m => m.OutpatientComponent) },
      { path: 'inpatient',        loadComponent: () => import('./pages/inpatient/inpatient.component').then(m => m.InpatientComponent) },
      { path: 'nursing',          loadComponent: () => import('./pages/nursing/nursing.component').then(m => m.NursingComponent) },
      { path: 'clinical-pharmacy',loadComponent: () => import('./pages/pharmacy-mgmt/pharmacy-mgmt.component').then(m => m.PharmacyMgmtComponent) },
      { path: 'tumor-board',      loadComponent: () => import('./pages/tumor-board/tumor-board.component').then(m => m.TumorBoardComponent) },
      { path: 'clinical-quality', loadComponent: () => import('./pages/clinical-quality/clinical-quality.component').then(m => m.ClinicalQualityComponent) },
      { path: 'lis',              loadComponent: () => import('./pages/lis/lis.component').then(m => m.LisComponent) },
      { path: 'ris',              loadComponent: () => import('./pages/ris/ris.component').then(m => m.RisComponent) },
      { path: 'pharmacy-mgmt',    loadComponent: () => import('./pages/pharmacy-mgmt/pharmacy-mgmt.component').then(m => m.PharmacyMgmtComponent) },
      { path: 'patient-billing',  loadComponent: () => import('./pages/patient-billing/patient-billing.component').then(m => m.PatientBillingComponent) },
      { path: 'revenue-cycle',    loadComponent: () => import('./pages/revenue-cycle/revenue-cycle.component').then(m => m.RevenueCycleComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
