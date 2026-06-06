import { Component, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private el = inject(ElementRef);

  search = signal('');
  showUserMenu = signal(false);
  showLangMenu = signal(false);
  isSidebarHovered = signal(false);

  // Sliding Bubble State
  bubbleTop = signal(0);
  bubbleHeight = signal(0);
  bubbleOpacity = signal(0);

  moveBubble(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    this.bubbleTop.set(target.offsetTop);
    this.bubbleHeight.set(target.offsetHeight);
    this.bubbleOpacity.set(1);
  }

  hideBubble() {
    this.bubbleOpacity.set(0);
  }

  readonly isDark = this.themeService.isDark;

  readonly pageTitle = computed(() => {
    const url = this.router.url;
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard', '/outpatient': this.langService.t('mod_outpatient'),
      '/inpatient': this.langService.t('mod_inpatient'), '/nursing': this.langService.t('mod_nursing'),
      '/clinical-pharmacy': this.langService.t('mod_clinical_pharm'),
      '/tumor-board': this.langService.t('mod_tumor_board'),
      '/clinical-quality': this.langService.t('mod_quality'),
      '/lis': this.langService.t('mod_lis'), '/ris': this.langService.t('mod_ris'),
      '/pharmacy-mgmt': this.langService.t('mod_pharmacy'),
      '/patient-billing': this.langService.t('mod_patient_billing'),
      '/revenue-cycle': this.langService.t('mod_revenue_cycle'),
    };
    return map[url] ?? 'VistaOnco';
  });

  readonly navGroups = computed(() => {
    const l = (k: string) => this.langService.t(k);
    const s = this.search().toLowerCase();
    const allGroups = [
      { label: 'Navigation', items: [
        { path: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
      ]},
      { label: 'Clinical Care', items: [
        { path: '/outpatient',        icon: 'ti-stethoscope', label: l('mod_outpatient') },
        { path: '/inpatient',         icon: 'ti-bed',         label: l('mod_inpatient') },
        { path: '/nursing',           icon: 'ti-user',        label: l('mod_nursing') },
        { path: '/clinical-pharmacy', icon: 'ti-pill',        label: l('mod_clinical_pharm') },
        { path: '/tumor-board',       icon: 'ti-users',       label: l('mod_tumor_board') },
        { path: '/clinical-quality',  icon: 'ti-chart-bar',   label: l('mod_quality') },
      ]},
      { label: 'Diagnostics', items: [
        { path: '/lis',           icon: 'ti-microscope', label: l('mod_lis') },
        { path: '/ris',           icon: 'ti-camera',     label: l('mod_ris') },
        { path: '/pharmacy-mgmt', icon: 'ti-package',    label: l('mod_pharmacy') },
      ]},
      { label: 'Patient Flow', items: [
        { path: '/patient-billing', icon: 'ti-receipt',   label: l('mod_patient_billing') },
        { path: '/revenue-cycle',   icon: 'ti-chart-pie', label: l('mod_revenue_cycle') },
      ]},
    ];
    return allGroups
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(s)) }))
      .filter(g => g.items.length > 0);
  });

  // Close menus when clicking outside
  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.showUserMenu.set(false);
    }
  }

  toggleTheme() { this.themeService.toggleTheme(); }
  setLang(l: 'en' | 'hi' | 'ta') { this.langService.setLang(l); this.showLangMenu.set(false); this.showUserMenu.set(false); }

  async signOut() {
    this.showUserMenu.set(false);
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  get t() { return (k: string) => this.langService.t(k); }
}
