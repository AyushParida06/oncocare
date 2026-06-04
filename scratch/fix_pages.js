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

  // Fix literal \n
  content = content.replace(/\\n\s*const \{ t: l \} = useLanguage\(\);/g, "");
  content = content.replace(/const \{ theme \} = useTheme\(\);/, "const { theme } = useTheme();\n  const { t: l } = useLanguage();");

  // Fix Module Active (which could have leading spaces/newlines)
  content = content.replace(/>\s*Module Active\s*</g, ">{l('ui_module_active')}<");
  content = content.replace(/Module Active\s*<\/div>/g, "{l('ui_module_active')}\n        </div>");

  // Fix Interface In Development
  content = content.replace(/>\s*Interface In Development\s*</g, ">{l('ui_interface_dev')}<");

  // Fix Description generic text
  content = content.replace(/This module is part of the core VistaOnco architecture[\s\S]*?configured\./g, "{l('ui_interface_desc')}");

  fs.writeFileSync(filePath, content);
  console.log('Fixed ' + file);
}
