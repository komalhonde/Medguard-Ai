import { DrugInteraction } from '../types/clinical';

export const DRUG_INTERACTIONS_DATABASE: DrugInteraction[] = [
  {
    drugA: 'Warfarin',
    drugB: 'Ibuprofen',
    severity: 'CONTRAINDICATED',
    mechanism: 'NSAIDs displace warfarin from albumin binding sites and inhibit COX-1 platelet aggregation, severely escalating bleeding risk and GI hemorrhage.',
    clinicalRecommendation: 'Do NOT co-prescribe. Use Acetaminophen (Paracetamol) for mild-to-moderate analgesia, limiting to <= 2g/day in anticoagulated patients.',
    managementAdvice: 'Monitor PT/INR immediately if patient has already ingested NSAIDs.'
  },
  {
    drugA: 'Nitroglycerin',
    drugB: 'Sildenafil',
    severity: 'CONTRAINDICATED',
    mechanism: 'PDE-5 inhibitors potentiate the hypotensive effects of organic nitrates via cGMP pathway accumulation, risking fatal profound cardiovascular collapse and refractory shock.',
    clinicalRecommendation: 'Absolute Contraindication within 24 hours of sildenafil (48 hours for tadalafil). Withhold all nitrates.',
    managementAdvice: 'If acute coronary syndrome occurs, manage ischemia with beta-blockers, morphine, or supplemental oxygen without nitrates.'
  },
  {
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    severity: 'MAJOR',
    mechanism: 'Dual blockade of aldosterone and ACE pathway leads to severe hyperkalemia (serum K+ > 6.0 mEq/L), precipitating ventricular arrhythmias and cardiac arrest.',
    clinicalRecommendation: 'Monitor serum potassium and renal function (creatinine) within 48-72 hours. Avoid potassium supplements.',
    managementAdvice: 'If serum K+ > 5.5 mEq/L, reduce dose or discontinue spironolactone.'
  },
  {
    drugA: 'Metformin',
    drugB: 'Iodinated Radiocontrast',
    severity: 'MAJOR',
    mechanism: 'Contrast-induced acute nephropathy can impair renal clearance of metformin, precipitating potentially fatal Metformin-Associated Lactic Acidosis (MALA).',
    clinicalRecommendation: 'Discontinue metformin at the time of or prior to iodinated contrast imaging in patients with eGFR < 60 mL/min.',
    managementAdvice: 'Re-evaluate eGFR 48 hours post-procedure; resume metformin only if renal function remains stable.'
  },
  {
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'MAJOR',
    mechanism: 'Omeprazole competitively inhibits CYP2C19, blocking the hepatic bioactivation of clopidogrel and reducing its antiplatelet efficacy by up to 45%.',
    clinicalRecommendation: 'Switch PPI to Pantoprazole or Rabeprazole, which exhibit significantly less CYP2C19 inhibition.',
    managementAdvice: 'Ensure adequate antiplatelet aggregation in post-PCI acute coronary syndrome patients.'
  },
  {
    drugA: 'Tramadol',
    drugB: 'Sertraline',
    severity: 'MAJOR',
    mechanism: 'Concurrent serotonin reuptake inhibition increases synaptic serotonin concentrations, posing a high risk of Serotonin Syndrome (hyperthermia, clonus, delirium).',
    clinicalRecommendation: 'Avoid combination where possible. Use alternative non-serotonergic analgesics (e.g. Paracetamol, topical agents).',
    managementAdvice: 'Monitor for autonomic instability, hyperreflexia, and agitation.'
  },
  {
    drugA: 'Digoxin',
    drugB: 'Amiodarone',
    severity: 'MAJOR',
    mechanism: 'Amiodarone inhibits P-glycoprotein renal and non-renal clearance of digoxin, doubling serum digoxin levels and precipitating digitalis toxicity (heart block, lethal arrhythmias).',
    clinicalRecommendation: 'Reduce digoxin maintenance dose by 50% immediately upon starting amiodarone.',
    managementAdvice: 'Check serum digoxin levels at day 3 and day 7; maintain target levels 0.5-0.9 ng/mL.'
  },
  {
    drugA: 'Ciprofloxacin',
    drugB: 'Amiodarone',
    severity: 'CONTRAINDICATED',
    mechanism: 'Additive cardiac repolarization delay causing significant QTc prolongation and elevated risk of Torsades de Pointes / polymorphic ventricular tachycardia.',
    clinicalRecommendation: 'Avoid fluoroquinolones with Class III antiarrhythmics. Switch to Ceftriaxone, Levofloxacin with telemetry, or Aztreonam.',
    managementAdvice: 'Perform baseline and continuous 12-lead ECG monitoring for QTc interval prolongation (> 500 ms).'
  },
  {
    drugA: 'Aspirin',
    drugB: 'Ketorolac',
    severity: 'MAJOR',
    mechanism: 'Dual systemic NSAID inhibition severely damages gastric mucosal barrier, causing acute gastrointestinal ulceration and massive upper GI bleed.',
    clinicalRecommendation: 'Avoid concurrent systemic NSAID administration. Ketorolac is limited to a strict 5-day maximum.',
    managementAdvice: 'Add gastroprotection (e.g. Pantoprazole) and monitor hematocrit/hemoglobin.'
  }
];

export function findDrugInteractions(patientMeds: string[], proposedMeds: string[]): DrugInteraction[] {
  const allMeds = [...patientMeds, ...proposedMeds].map(m => m.trim().toLowerCase());
  const detectedInteractions: DrugInteraction[] = [];

  for (const item of DRUG_INTERACTIONS_DATABASE) {
    const medA = item.drugA.toLowerCase();
    const medB = item.drugB.toLowerCase();

    const hasMedA = allMeds.some(m => m.includes(medA) || medA.includes(m));
    const hasMedB = allMeds.some(m => m.includes(medB) || medB.includes(m));

    if (hasMedA && hasMedB) {
      detectedInteractions.push(item);
    }
  }

  return detectedInteractions;
}
