const fs = require('fs');
const path = require('path');

const mappings = {
  'Outpatient.js': { mod: 'mod_outpatient', desc: 'desc_outpatient' },
  'Inpatient.js': { mod: 'mod_inpatient', desc: 'desc_inpatient' },
  'Nursing.js': { mod: 'mod_nursing', desc: 'desc_nursing' },
  'ClinicalPharmacy.js': { mod: 'mod_clinical_pharm', desc: 'desc_clinical_pharm' },
  'TumorBoard.js': { mod: 'mod_tumor_board', desc: 'desc_tumor_board' },
  'ClinicalQuality.js': { mod: 'mod_quality', desc: 'desc_quality' },
  'LIS.js': { mod: 'mod_lis', desc: 'desc_lis' },
  'RIS.js': { mod: 'mod_ris', desc: 'desc_ris' },
  'PharmacyMgmt.js': { mod: 'mod_pharmacy', desc: 'desc_pharmacy' },
  'PatientBilling.js': { mod: 'mod_patient_billing', desc: 'desc_patient_billing' },
  'RevenueCycle.js': { mod: 'mod_revenue_cycle', desc: 'desc_revenue_cycle' }
};

const dir = path.join(process.cwd(), 'src', 'pages');
for (const file of Object.keys(mappings)) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if missing
  if (!content.includes('useLanguage')) {
    content = content.replace("import { useTheme } from '../context/ThemeContext';", "import { useTheme } from '../context/ThemeContext';\nimport { useLanguage } from '../context/LanguageContext';");
  }

  // Add useLanguage hook
  const componentName = file.replace('.js', '');
  const funcRegex = new RegExp(`export default function ${componentName}\\(\\) \\{[\\s\\S]*?const \\{ theme \\} = useTheme\\(\\);`);
  content = content.replace(funcRegex, `$&\\n  const { t: l } = useLanguage();`);

  // Replace Module Active
  content = content.replace(/>Module Active</g, ">{l('ui_module_active')}<");
  
  // Replace Interface In Development
  content = content.replace(/>Interface In Development</g, ">{l('ui_interface_dev')}<");
  
  // Replace the long description text (we know it starts with 'This module is part')
  content = content.replace(/This module is part of the core VistaOnco architecture\\. The specific user interface components.*?configured\\./g, "{l('ui_interface_desc')}");

  const map = mappings[file];
  
  // Replace the Title div content
  content = content.replace(/(<div style={{ fontSize: 20.*?}}>)(.*?)(<\/div>)/, `$1{l('${map.mod}')}$3`);
  
  // Replace the Desc div content
  content = content.replace(/(<div style={{ fontSize: 13, color: isDark \? '#ccc' : '#555', maxWidth: 500 }}>\s*)(.*?)(\s*<\/div>)/, `$1{l('${map.desc}')}$3`);

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
}
