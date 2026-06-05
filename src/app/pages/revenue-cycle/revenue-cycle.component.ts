import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-revenue-cycle',
  standalone: true,
  imports: [],
  template: `
    <div [style.display]="'flex'" [style.flexDirection]="'column'" [style.gap]="'20px'">
      <div [style.background]="isDark ? '#1e2030' : '#fff'" [style.border]="'0.5px solid ' + (isDark ? '#2d3148' : '#e5e7eb')"
           [style.borderRadius]="'12px'" [style.padding]="'24px 28px'" [style.display]="'flex'" [style.alignItems]="'center'"
           [style.gap]="'18px'" [style.borderLeft]="'4px solid rgb(251,191,36)'">
        <div [style.width]="'56px'" [style.height]="'56px'" [style.borderRadius]="'14px'"
             [style.background]="'rgba(251,191,36,0.15)'" [style.display]="'flex'" [style.alignItems]="'center'"
             [style.justifyContent]="'center'" [style.fontSize]="'26px'" [style.color]="'rgb(251,191,36)'">
          <i class="ti ti-chart-pie"></i>
        </div>
        <div>
          <div [style.fontSize]="'20px'" [style.fontWeight]="'700'" [style.color]="isDark ? '#e2e8f0' : '#111'">{{ t('mod_revenue_cycle') }}</div>
          <div [style.fontSize]="'13px'" [style.color]="isDark ? '#64748b' : '#888'" [style.marginTop]="'3px'">Maximize Revenue Performance</div>
        </div>
        <div [style.marginLeft]="'auto'" [style.background]="'rgba(251,191,36,0.15)'" [style.border]="'1px solid rgba(251,191,36,0.3)'"
             [style.borderRadius]="'8px'" [style.padding]="'6px 14px'" [style.fontSize]="'12px'" [style.color]="'rgb(251,191,36)'" [style.fontWeight]="'500'">
          {{ t('ui_module_active') }}
        </div>
      </div>
      <div [style.display]="'grid'" [style.gridTemplateColumns]="'repeat(2,1fr)'" [style.gap]="'14px'">
        @for (f of features; track f.label) {
          <div [style.background]="isDark ? '#1e2030' : '#fff'" [style.border]="'0.5px solid ' + (isDark ? '#2d3148' : '#e5e7eb')"
               [style.borderRadius]="'12px'" [style.padding]="'18px'" [style.display]="'flex'" [style.alignItems]="'flex-start'" [style.gap]="'14px'">
            <div [style.width]="'40px'" [style.height]="'40px'" [style.borderRadius]="'10px'"
                 [style.background]="'rgba(251,191,36,0.12)'" [style.display]="'flex'" [style.alignItems]="'center'"
                 [style.justifyContent]="'center'" [style.fontSize]="'18px'" [style.color]="'rgb(251,191,36)'">
              <i [class]="'ti ' + f.icon"></i>
            </div>
            <div>
              <div [style.fontSize]="'13px'" [style.fontWeight]="'600'" [style.color]="isDark ? '#e2e8f0' : '#111'">{{ f.label }}</div>
              <div [style.fontSize]="'12px'" [style.color]="isDark ? '#64748b' : '#888'" [style.marginTop]="'4px'">{{ f.desc }}</div>
            </div>
          </div>
        }
      </div>
      <div [style.background]="isDark ? '#1e2030' : '#fff'" [style.border]="'0.5px solid ' + (isDark ? '#2d3148' : '#e5e7eb')"
           [style.borderRadius]="'12px'" [style.padding]="'32px'" [style.textAlign]="'center'">
        <i class="ti ti-chart-pie" [style.fontSize]="'36px'" [style.color]="'rgba(251,191,36,0.4)'" [style.display]="'block'" [style.marginBottom]="'12px'"></i>
        <div [style.fontSize]="'15px'" [style.fontWeight]="'600'" [style.color]="isDark ? '#e2e8f0' : '#111'" [style.marginBottom]="'8px'">Full Module Coming Soon</div>
        <div [style.fontSize]="'13px'" [style.color]="isDark ? '#64748b' : '#888'">This module is being configured. Core features will be available shortly.</div>
      </div>
    </div>
  `
})
export class RevenueCycleComponent {
  readonly themeService = inject(ThemeService);
  readonly langService  = inject(LanguageService);
  get isDark() { return this.themeService.isDark(); }
  t = (k: string) => this.langService.t(k);
  features = [
    { icon:'ti-file-invoice',   label:'Claims Processing',  desc:'Automated insurance claims' },
    { icon:'ti-alert-triangle', label:'Denial Management',  desc:'Track and resolve claim denials' },
    { icon:'ti-clock',          label:'AR Management',      desc:'Accounts receivable tracking' },
    { icon:'ti-chart-line',     label:'Revenue Analytics',  desc:'Financial performance dashboards' },
  ];
}
