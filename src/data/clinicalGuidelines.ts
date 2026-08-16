import { RAGDocumentChunk } from '../types/clinical';

export const CLINICAL_GUIDELINES: RAGDocumentChunk[] = [
  {
    id: 'GUIDE-SEPSIS-001',
    guidelineTitle: 'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2024',
    authoringBody: 'Surviving Sepsis Campaign & SCCM/ESICM',
    category: 'Infectious Disease / Critical Care',
    sectionTitle: 'Hour-1 Bundle: Initial Resuscitation & Diagnostic Protocols',
    content: 'For adult patients with suspected sepsis or septic shock, initiate resuscitation immediately: 1) Measure blood lactate level; remeasure if initial lactate is > 2 mmol/L. 2) Obtain blood cultures prior to administration of antimicrobials. 3) Administer broad-spectrum empiric IV antimicrobials within 1 hour of recognition. 4) Rapidly administer 30 mL/kg crystalloid for hypotension (MAP < 65 mmHg) or lactate >= 4.0 mmol/L. 5) Apply vasopressors (norepinephrine first line) if hypotensive during or after fluid resuscitation to maintain MAP >= 65 mmHg.',
    keywords: ['sepsis', 'septic shock', 'lactate', 'hypotension', 'blood cultures', 'norepinephrine', 'crystalloid', 'fever', 'tachycardia'],
    publishedYear: 2024,
    evidenceGrade: 'Strong Recommendation, High-Quality Evidence'
  },
  {
    id: 'GUIDE-SEPSIS-002',
    guidelineTitle: 'qSOFA and NEWS2 in Emergency Triage Protocol',
    authoringBody: 'Royal College of Physicians & NICE Guidelines',
    category: 'Emergency Triage',
    sectionTitle: 'Early Warning Score Interpretation & Escalation Thresholds',
    content: 'The National Early Warning Score (NEWS2) stratifies acute clinical deterioration. NEWS2 score >= 7 (or an individual parameter scoring 3) indicates high clinical risk requiring urgent medical review and consideration of ICU/HDU transfer. Quick SOFA (qSOFA) criteria: Respiratory rate >= 22/min, altered mentation (GCS < 15), systolic BP <= 100 mmHg. Presence of 2 or more qSOFA points with suspected infection indicates high risk of in-hospital mortality and prolonged ICU stay.',
    keywords: ['NEWS2', 'qSOFA', 'respiratory rate', 'GCS', 'blood pressure', 'triage', 'deterioration', 'ICU transfer'],
    publishedYear: 2023,
    evidenceGrade: 'Class I (Level B)'
  },
  {
    id: 'GUIDE-ACS-001',
    guidelineTitle: '2023 ACC/AHA Guideline for the Evaluation and Diagnosis of Chest Pain',
    authoringBody: 'American College of Cardiology / American Heart Association',
    category: 'Cardiology / Emergency',
    sectionTitle: 'High-Sensitivity Cardiac Troponin & Accelerated Diagnostic Protocols',
    content: 'In patients presenting to the emergency department with acute chest pain, an accelerated diagnostic protocol utilizing high-sensitivity cardiac troponin (hs-cTn) at 0 and 1-2 hours is recommended to rule in or rule out acute myocardial infarction. Patients with chest pain radiating to the left arm/jaw, diaphoresis, dyspnea, and elevated troponin (> 0.04 ng/mL or above 99th percentile URL) should receive immediate 12-lead ECG, dual antiplatelet therapy (Aspirin 325 mg + P2Y12 inhibitor), and emergency cardiology consult for coronary angiography.',
    keywords: ['chest pain', 'troponin', 'myocardial infarction', 'ACS', 'ECG', 'aspirin', 'heparin', 'diaphoresis', 'angina'],
    publishedYear: 2023,
    evidenceGrade: 'Class I (Level A)'
  },
  {
    id: 'GUIDE-DKA-001',
    guidelineTitle: 'Management of Hyperglycemic Emergencies and Diabetic Ketoacidosis (DKA) in Adults',
    authoringBody: 'American Diabetes Association (ADA)',
    category: 'Endocrinology / Emergency',
    sectionTitle: 'Fluid Replacement, Insulin Infusion, and Potassium Repletion Algorithm',
    content: 'Diagnostic criteria for DKA: Blood glucose > 250 mg/dL, arterial pH < 7.30, serum bicarbonate < 18 mEq/L, and elevated anion gap (> 12) with positive serum/urine ketones. Priority 1: Fluid resuscitation with isotonic 0.9% NaCl at 500-1000 mL/hr for initial 2 hours. Priority 2: Serum potassium must be evaluated before insulin; if K+ < 3.3 mEq/L, withhold insulin and administer IV potassium until K+ >= 3.3 mEq/L to prevent fatal arrhythmias. Priority 3: Regular insulin infusion at 0.1 units/kg/hr once K+ is replete.',
    keywords: ['diabetic ketoacidosis', 'DKA', 'glucose', 'insulin', 'potassium', 'acidosis', 'anion gap', 'ketones', 'dehydration'],
    publishedYear: 2024,
    evidenceGrade: 'Standard of Care (Level A)'
  },
  {
    id: 'GUIDE-RESP-001',
    guidelineTitle: 'Global Initiative for Chronic Obstructive Lung Disease (GOLD 2024)',
    authoringBody: 'GOLD & American Thoracic Society',
    category: 'Pulmonology / Emergency',
    sectionTitle: 'Acute Exacerbation of COPD & Asthma Escalation Pathway',
    content: 'Management of acute COPD/Asthma exacerbation presenting with severe dyspnea, tachypnea (> 25/min), and SpO2 < 90%: 1) Controlled oxygen therapy targeting SpO2 88-92% (to prevent hypercapnic respiratory drive suppression). 2) Inhaled short-acting beta2-agonists (SABA: Albuterol 2.5-5 mg) plus anticholinergic (Ipratropium 0.5 mg) via nebulizer every 20-30 minutes. 3) Systemic corticosteroids (Prednisone 40 mg PO or Methylprednisolone 60 mg IV). 4) Non-invasive positive pressure ventilation (BiPAP/NIV) for respiratory acidosis (pH < 7.35, PaCO2 > 45 mmHg).',
    keywords: ['COPD', 'asthma', 'dyspnea', 'albuterol', 'ipratropium', 'bipap', 'oxygen', 'wheezing', 'hypercapnia'],
    publishedYear: 2024,
    evidenceGrade: 'Class I (Level A)'
  },
  {
    id: 'GUIDE-HTN-001',
    guidelineTitle: 'AHA/ACC Hypertension Guidelines: Hypertensive Crises Protocol',
    authoringBody: 'American Heart Association',
    category: 'Cardiology / Emergency',
    sectionTitle: 'Differentiating Hypertensive Emergency vs. Hypertensive Urgency',
    content: 'Hypertensive crisis is defined as Systolic BP > 180 mmHg and/or Diastolic BP > 120 mmHg. Hypertensive Emergency requires acute target organ damage (acute pulmonary edema, acute aortic dissection, encephalopathy, intracranial hemorrhage, acute kidney injury, or ACS). In Hypertensive Emergency, admit to ICU and reduce MAP by no more than 20-25% in the first hour using titratable IV agents (e.g. Nicardipine, Labetalol, Nitroprusside). In Hypertensive Urgency (no acute target organ damage), reduce BP gradually over 24-48 hours using oral antihypertensives; do NOT rapidly lower BP as it causes cerebral hypoperfusion.',
    keywords: ['hypertension', 'hypertensive crisis', 'blood pressure', 'nicardipine', 'labetalol', 'target organ damage', 'encephalopathy'],
    publishedYear: 2023,
    evidenceGrade: 'Class I (Level B)'
  },
  {
    id: 'GUIDE-STROKE-001',
    guidelineTitle: 'AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke',
    authoringBody: 'American Heart Association / American Stroke Association',
    category: 'Neurology / Emergency',
    sectionTitle: 'Code Stroke Protocol & Thrombolysis / Thrombectomy Windows',
    content: 'Perform immediate non-contrast head CT/MRI to rule out intracranial hemorrhage in suspected stroke (FAST criteria: Facial droop, Arm drift, Speech impairment, Time). Intravenous thrombolysis (Alteplase 0.9 mg/kg or Tenecteplase) is indicated for eligible patients within 4.5 hours of symptom onset if BP is maintained < 185/110 mmHg. Mechanical thrombectomy is recommended within 6-24 hours for large vessel occlusion (LVO) in the anterior circulation confirmed by CTA.',
    keywords: ['stroke', 'ischemic stroke', 'alteplase', 'thrombolysis', 'head CT', 'FAST', 'facial droop', 'slurred speech', 'thrombectomy'],
    publishedYear: 2024,
    evidenceGrade: 'Class I (Level A)'
  },
  {
    id: 'GUIDE-TRIAGE-ESI-001',
    guidelineTitle: 'Emergency Severity Index (ESI) Version 5: A Triage Tool for Emergency Department Care',
    authoringBody: 'Agency for Healthcare Research and Quality (AHRQ)',
    category: 'Emergency Medicine',
    sectionTitle: '5-Level Triage Decision Algorithm',
    content: 'ESI Level 1 (Resuscitation): Requires immediate life-saving intervention (intubation, severe respiratory distress, pulseless, unresponsive GCS < 8). ESI Level 2 (Emergent): High-risk situation, confused/lethargic/disoriented, or severe pain/distress (pain >= 7/10), or dangerous vitals (HR > 100 or < 50, RR > 20 or < 10, SpO2 < 92%). ESI Level 3 (Urgent): Stable vitals requiring two or more healthcare resources (labs, IV meds, CT/X-ray). ESI Level 4 (Less Urgent): Requires one resource (simple X-ray or suture). ESI Level 5 (Non-Urgent): Requires no resources (prescription refill, wound check).',
    keywords: ['ESI', 'triage', 'resuscitation', 'emergent', 'urgent', 'resource utilization', 'vital signs', 'emergency department'],
    publishedYear: 2024,
    evidenceGrade: 'Class I (Gold Standard)'
  }
];
