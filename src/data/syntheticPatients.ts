import { PatientRecord } from '../types/clinical';

export const BENCHMARK_PATIENTS: PatientRecord[] = [
  {
    id: 'PT-2026-SEP01',
    name: 'Eleanor Vance',
    age: 71,
    gender: 'FEMALE',
    chiefComplaint: 'Severe chills, altered mental status, productive cough with dark sputum for 2 days, marked lethargy',
    symptomDurationHours: 48,
    pastMedicalHistory: ['Type 2 Diabetes Mellitus', 'Stage 3 Chronic Kidney Disease', 'Hypertension'],
    currentMedications: ['Metformin 500mg BID', 'Lisinopril 20mg daily', 'Amlodipine 5mg daily'],
    proposedMedications: ['Ceftriaxone 2g IV', 'Vancomycin 1.5g IV', 'Ibuprofen 400mg PO'],
    allergies: ['Penicillin (Rash)'],
    vitals: {
      heartRate: 118,
      systolicBP: 88,
      diastolicBP: 54,
      respiratoryRate: 26,
      oxygenSaturation: 91,
      temperature: 39.2,
      gcsScore: 13,
      painScore: 5
    },
    labs: {
      whiteBloodCellCount: 19.4,
      lactate: 4.6,
      serumCreatinine: 2.1,
      bloodGlucose: 210,
      troponinI: 0.02,
      hemoglobin: 11.2,
      dDimer: 1150
    },
    timestamp: '2026-08-15T09:15:00Z'
  },
  {
    id: 'PT-2026-ACS02',
    name: 'Marcus Sterling',
    age: 58,
    gender: 'MALE',
    chiefComplaint: 'Acute retrosternal crushing chest pressure radiating to left jaw and shoulder, accompanied by diaphoresis and nausea',
    symptomDurationHours: 3,
    pastMedicalHistory: ['Coronary Artery Disease', 'Hyperlipidemia', 'Tobacco Use (30 pack-years)'],
    currentMedications: ['Atorvastatin 40mg daily', 'Aspirin 81mg daily', 'Sildenafil 50mg PRN'],
    proposedMedications: ['Nitroglycerin 0.4mg SL', 'Heparin IV drip', 'Clopidogrel 300mg PO'],
    allergies: ['No Known Drug Allergies (NKDA)'],
    vitals: {
      heartRate: 104,
      systolicBP: 148,
      diastolicBP: 92,
      respiratoryRate: 20,
      oxygenSaturation: 95,
      temperature: 36.8,
      gcsScore: 15,
      painScore: 9
    },
    labs: {
      whiteBloodCellCount: 9.8,
      lactate: 1.4,
      serumCreatinine: 0.9,
      bloodGlucose: 132,
      troponinI: 1.85,
      hemoglobin: 14.8,
      dDimer: 320
    },
    timestamp: '2026-08-15T09:30:00Z'
  },
  {
    id: 'PT-2026-DKA03',
    name: 'Chloe Rivera',
    age: 24,
    gender: 'FEMALE',
    chiefComplaint: 'Severe diffuse abdominal pain, persistent nausea and vomiting, polydipsia, rapid deep breathing (Kussmaul breathing)',
    symptomDurationHours: 24,
    pastMedicalHistory: ['Type 1 Diabetes Mellitus (diagnosed age 12)'],
    currentMedications: ['Insulin Glargine 22 units nightly', 'Insulin Lispro 6 units with meals'],
    proposedMedications: ['Regular Insulin IV drip', '0.9% Normal Saline IV bolus', 'Ondansetron 4mg IV'],
    allergies: ['Sulfa drugs (Hives)'],
    vitals: {
      heartRate: 124,
      systolicBP: 96,
      diastolicBP: 62,
      respiratoryRate: 28,
      oxygenSaturation: 98,
      temperature: 37.1,
      gcsScore: 14,
      painScore: 8
    },
    labs: {
      whiteBloodCellCount: 16.2,
      lactate: 2.8,
      serumCreatinine: 1.6,
      bloodGlucose: 480,
      troponinI: 0.01,
      hemoglobin: 15.1
    },
    timestamp: '2026-08-15T10:00:00Z'
  },
  {
    id: 'PT-2026-COPD04',
    name: 'Arthur Pendelton',
    age: 67,
    gender: 'MALE',
    chiefComplaint: 'Severe breathlessness, inability to speak full sentences, audible expiratory wheezing, productive cough with green phlegm',
    symptomDurationHours: 12,
    pastMedicalHistory: ['Severe COPD (GOLD Stage 3)', 'Coronary Artery Disease', 'Chronic Atrial Fibrillation'],
    currentMedications: ['Tiotropium inhaler daily', 'Warfarin 5mg daily', 'Digoxin 0.125mg daily'],
    proposedMedications: ['Albuterol/Ipratropium neb', 'Methylprednisolone 60mg IV', 'Ibuprofen 600mg PO'],
    allergies: ['Codeine (Nausea/Vomiting)'],
    vitals: {
      heartRate: 112,
      systolicBP: 135,
      diastolicBP: 85,
      respiratoryRate: 27,
      oxygenSaturation: 86,
      temperature: 37.8,
      gcsScore: 14,
      painScore: 3
    },
    labs: {
      whiteBloodCellCount: 14.1,
      lactate: 1.9,
      serumCreatinine: 1.2,
      bloodGlucose: 155,
      troponinI: 0.03,
      hemoglobin: 16.4,
      dDimer: 480
    },
    timestamp: '2026-08-15T10:15:00Z'
  },
  {
    id: 'PT-2026-HTN05',
    name: 'Siddharth Patel',
    age: 62,
    gender: 'MALE',
    chiefComplaint: 'Occipital throbbing headache, blurred vision, epistaxis (nosebleed), dizziness without focal limb weakness',
    symptomDurationHours: 6,
    pastMedicalHistory: ['Essential Hypertension (non-compliant)', 'Hyperuricemia (Gout)'],
    currentMedications: ['None currently (discontinued Hydrochlorothiazide 2 months ago)'],
    proposedMedications: ['Nicardipine IV infusion', 'Labetalol 20mg IV bolus', 'Acetaminophen 1g PO'],
    allergies: ['NKDA'],
    vitals: {
      heartRate: 88,
      systolicBP: 218,
      diastolicBP: 126,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      temperature: 36.9,
      gcsScore: 15,
      painScore: 7
    },
    labs: {
      whiteBloodCellCount: 7.4,
      lactate: 1.1,
      serumCreatinine: 1.7,
      bloodGlucose: 118,
      troponinI: 0.02,
      hemoglobin: 14.2
    },
    timestamp: '2026-08-15T10:45:00Z'
  },
  {
    id: 'PT-2026-NON06',
    name: 'Samantha Lee',
    age: 29,
    gender: 'FEMALE',
    chiefComplaint: 'Localized left-sided chest wall tenderness reproducible upon palpation after lifting heavy weights at gym yesterday; no SOB or diaphoresis',
    symptomDurationHours: 18,
    pastMedicalHistory: ['No significant medical history'],
    currentMedications: ['Multivitamin oral daily'],
    proposedMedications: ['Acetaminophen 500mg PO', 'Topical Diclofenac gel'],
    allergies: ['NKDA'],
    vitals: {
      heartRate: 72,
      systolicBP: 116,
      diastolicBP: 74,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      temperature: 36.6,
      gcsScore: 15,
      painScore: 4
    },
    labs: {
      whiteBloodCellCount: 6.2,
      lactate: 0.9,
      serumCreatinine: 0.8,
      bloodGlucose: 94,
      troponinI: 0.005,
      hemoglobin: 13.8
    },
    timestamp: '2026-08-15T11:00:00Z'
  }
];
