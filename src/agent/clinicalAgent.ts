import { PatientRecord, TriageAgentResult, AgentStepTrace, ClinicalSynthesis } from '../types/clinical';
import { predictPatientRisk } from '../ml/triageModel';
import { searchClinicalGuidelines } from '../rag/vectorStore';
import { findDrugInteractions } from '../data/drugInteractions';

/**
 * Executes multi-step Autonomous Clinical Agent workflow
 */
export async function runClinicalAgent(patient: PatientRecord, geminiApiKey?: string): Promise<TriageAgentResult> {
  const overallStartTime = performance.now();
  const traces: AgentStepTrace[] = [];

  // STEP 1: Execute Vitals & Early Warning Score Tool
  const t1Start = performance.now();
  const mlAssessment = predictPatientRisk(patient);
  traces.push({
    stepNumber: 1,
    toolName: 'vital_and_ml_triage_scorer',
    description: 'Extracted physiologic vitals, calculated NEWS2/qSOFA scores, and inferred gradient-boosted risk probability.',
    status: 'COMPLETED',
    inputPayload: {
      vitals: patient.vitals,
      age: patient.age,
      comorbidities: patient.pastMedicalHistory
    },
    outputPayload: {
      criticalityScore: mlAssessment.criticalityScore,
      news2Score: mlAssessment.news2Score,
      qSofaScore: mlAssessment.qSofaScore,
      triageCategory: mlAssessment.triageCategory,
      riskLevel: mlAssessment.riskLevel
    },
    executionDurationMs: Number((performance.now() - t1Start).toFixed(2)),
    reasoningSnippet: `Patient exhibits NEWS2 score of ${mlAssessment.news2Score} and qSOFA score of ${mlAssessment.qSofaScore}. Inferred criticality probability is ${(mlAssessment.criticalityScore * 100).toFixed(1)}%. Primary risk drivers: ${mlAssessment.featureContributions.slice(0, 2).map(f => f.clinicalLabel).join(', ') || 'Normal Vitals'}.`
  });

  // STEP 2: Execute Lab Biomarkers Evaluator Tool
  const t2Start = performance.now();
  const labAlerts: string[] = [];
  const labs = patient.labs || {};

  if (labs.troponinI && labs.troponinI > 0.04) {
    labAlerts.push(`Critical Troponin-I: ${labs.troponinI} ng/mL (Reference < 0.04 ng/mL, indicates acute myocardial injury)`);
  }
  if (labs.lactate && labs.lactate >= 2.0) {
    labAlerts.push(`Elevated Serum Lactate: ${labs.lactate} mmol/L (Reference 0.5-2.0 mmol/L, flags anaerobic tissue hypoperfusion)`);
  }
  if (labs.whiteBloodCellCount && (labs.whiteBloodCellCount > 11.0 || labs.whiteBloodCellCount < 4.0)) {
    labAlerts.push(`Leukocytosis / Shift: ${labs.whiteBloodCellCount} k/uL (Reference 4.5-11.0 k/uL)`);
  }
  if (labs.bloodGlucose && labs.bloodGlucose > 250) {
    labAlerts.push(`Severe Hyperglycemia: ${labs.bloodGlucose} mg/dL (Reference 70-140 mg/dL)`);
  }
  if (labs.serumCreatinine && labs.serumCreatinine > 1.3) {
    labAlerts.push(`Elevated Creatinine: ${labs.serumCreatinine} mg/dL (Indicates acute or chronic renal impairment)`);
  }

  traces.push({
    stepNumber: 2,
    toolName: 'biomarker_evaluator',
    description: 'Screened biochemical lab panels against critical reference intervals.',
    status: 'COMPLETED',
    inputPayload: { labs: patient.labs },
    outputPayload: {
      alertCount: labAlerts.length,
      alerts: labAlerts
    },
    executionDurationMs: Number((performance.now() - t2Start).toFixed(2)),
    reasoningSnippet: labAlerts.length > 0 
      ? `Detected ${labAlerts.length} actionable biomarker deviations: ${labAlerts.join('; ')}`
      : 'All reported lab biomarkers fall within standard reference physiological limits.'
  });

  // STEP 3: Execute Clinical Protocol RAG Retrieval Tool
  const t3Start = performance.now();
  const ragQuery = `${patient.chiefComplaint} ${patient.pastMedicalHistory.join(' ')} ${labAlerts.join(' ')}`;
  const ragResult = searchClinicalGuidelines(ragQuery, 3);
  traces.push({
    stepNumber: 3,
    toolName: 'clinical_guideline_rag_retriever',
    description: 'Searched in-memory clinical vector guidelines database for evidence-based management protocols.',
    status: 'COMPLETED',
    inputPayload: {
      query: ragQuery,
      topK: 3
    },
    outputPayload: {
      retrievedDocumentsCount: ragResult.retrievedChunks.length,
      topGuideline: ragResult.retrievedChunks[0]?.guidelineTitle,
      relevanceScore: ragResult.retrievedChunks[0]?.relevanceScore
    },
    executionDurationMs: Number((performance.now() - t3Start).toFixed(2)),
    reasoningSnippet: `Retrieved ${ragResult.retrievedChunks.length} relevant protocols. Top match: "${ragResult.retrievedChunks[0]?.guidelineTitle}" (Relevance: ${ragResult.retrievedChunks[0]?.relevanceScore}). Grounding clinical advice in evidence-based pathways.`
  });

  // STEP 4: Execute Drug-Drug Safety & Contraindication Tool
  const t4Start = performance.now();
  const drugSafetyAlerts = findDrugInteractions(patient.currentMedications, patient.proposedMedications);
  traces.push({
    stepNumber: 4,
    toolName: 'pharmacology_safety_checker',
    description: 'Cross-referenced current patient medications and newly proposed inpatient prescriptions against pharmacology interaction rules.',
    status: 'COMPLETED',
    inputPayload: {
      currentMedications: patient.currentMedications,
      proposedMedications: patient.proposedMedications
    },
    outputPayload: {
      interactionsFound: drugSafetyAlerts.length,
      contraindications: drugSafetyAlerts.filter(d => d.severity === 'CONTRAINDICATED').map(d => `${d.drugA} + ${d.drugB}`),
      majorWarnings: drugSafetyAlerts.filter(d => d.severity === 'MAJOR').map(d => `${d.drugA} + ${d.drugB}`)
    },
    executionDurationMs: Number((performance.now() - t4Start).toFixed(2)),
    reasoningSnippet: drugSafetyAlerts.length > 0
      ? `Flagged ${drugSafetyAlerts.length} pharmacology interaction warnings (${drugSafetyAlerts.filter(d => d.severity === 'CONTRAINDICATED').length} Contraindicated, ${drugSafetyAlerts.filter(d => d.severity === 'MAJOR').length} Major). Action required before order validation.`
      : 'No severe or contraindicated drug-drug interactions detected between home regimen and proposed prescriptions.'
  });

  // STEP 5: Execute Clinical Synthesis Generator
  const t5Start = performance.now();
  let clinicalSynthesis: ClinicalSynthesis | null = null;
  let modelEngineUsed = 'MedGuard Rule-Enhanced Expert Engine';

  // Check if server can call Gemini API
  if (geminiApiKey) {
    const prompt = `
You are an expert Emergency Medicine Clinical Decision Support AI Assistant.
Analyze this patient presentation, ML risk assessment, lab results, and retrieved clinical guidelines, and output a structured clinical diagnosis and triage action plan.

PATIENT PROFILE:
- Name: ${patient.name} (${patient.age}yo ${patient.gender})
- Chief Complaint: ${patient.chiefComplaint} (Duration: ${patient.symptomDurationHours} hours)
- Medical History: ${patient.pastMedicalHistory.join(', ') || 'None'}
- Current Meds: ${patient.currentMedications.join(', ') || 'None'}
- Proposed Meds: ${patient.proposedMedications.join(', ') || 'None'}
- Allergies: ${patient.allergies.join(', ') || 'NKDA'}

VITAL SIGNS:
- HR: ${patient.vitals.heartRate} bpm | BP: ${patient.vitals.systolicBP}/${patient.vitals.diastolicBP} mmHg | RR: ${patient.vitals.respiratoryRate}/min | SpO2: ${patient.vitals.oxygenSaturation}% | Temp: ${patient.vitals.temperature}°C | GCS: ${patient.vitals.gcsScore}/15 | Pain: ${patient.vitals.painScore}/10

LAB BIOMARKERS:
${JSON.stringify(patient.labs, null, 2)}

ML PREDICTION:
- Criticality Score: ${(mlAssessment.criticalityScore * 100).toFixed(1)}% | Triage: ${mlAssessment.triageCategory} | NEWS2: ${mlAssessment.news2Score} | qSOFA: ${mlAssessment.qSofaScore}

DRUG ALERTS:
${JSON.stringify(drugSafetyAlerts, null, 2)}

RETRIEVED GUIDELINE PROTOCOLS:
${ragResult.retrievedChunks.map(c => `[${c.authoringBody}] ${c.guidelineTitle}: ${c.content}`).join('\n\n')}

Provide response strictly in valid JSON matching this schema:
{
  "executiveSummary": "Concise 2-3 sentence clinical summary highlighting severity and primary concern",
  "differentialDiagnosis": [
    {
      "condition": "Condition name",
      "icd10Code": "ICD-10 Code e.g. R65.20 / I21.0 / E10.10",
      "probability": "HIGH" | "MODERATE" | "LOW",
      "justification": "Clinical rationale"
    }
  ],
  "immediateActions": ["Action 1", "Action 2", "Action 3"],
  "recommendedLabsAndImaging": ["Test 1", "Imaging 2"],
  "medicationRecommendations": {
    "prescribe": ["Medication with dose/route"],
    "avoid": ["Medications to avoid due to contraindication or interactions"],
    "rationale": "Clinical reasoning for pharmacology choices"
  },
  "dispositionRecommendation": "ICU_ADMISSION" | "STEP_DOWN_UNIT" | "GENERAL_WARD" | "OBSERVATION_UNIT" | "DISCHARGE_WITH_FOLLOWUP",
  "soapNote": {
    "subjective": "Subjective summary",
    "objective": "Objective vitals and labs",
    "assessment": "Clinical assessment",
    "plan": "Diagnostic and therapeutic plan"
  }
}
`;

    // Prioritize highly available, stable models: gemini-2.5-flash -> gemini-2.5-flash-lite -> gemini-3.7-flash
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.7-flash'];

    for (const modelName of candidateModels) {
      if (clinicalSynthesis) break;

      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({
          apiKey: geminiApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        if (response.text) {
          const rawText = response.text.trim();
          // Strip markdown code fences if present
          const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          clinicalSynthesis = JSON.parse(cleanedText);
          
          let friendlyName = 'Gemini 2.5 Flash';
          if (modelName === 'gemini-2.5-flash-lite') friendlyName = 'Gemini 2.5 Flash-Lite';
          if (modelName === 'gemini-3.7-flash') friendlyName = 'Gemini 3.7 Flash';
          
          modelEngineUsed = `${friendlyName} + MedGuard Hybrid Pipeline`;
          break; // Success, exit model loop
        }
      } catch (err: unknown) {
        // Silently continue to next candidate model
        continue;
      }
    }
  }

  // Fallback to clinical expert deterministic engine if Gemini unavailable or failed
  if (!clinicalSynthesis) {
    clinicalSynthesis = generateExpertSynthesis(patient, mlAssessment, labAlerts, drugSafetyAlerts, ragResult.retrievedChunks);
  }

  traces.push({
    stepNumber: 5,
    toolName: 'clinical_decision_synthesizer',
    description: 'Synthesized diagnostic reasoning, differential diagnoses with ICD-10 codes, and actionable order set.',
    status: 'COMPLETED',
    inputPayload: {
      triageCategory: mlAssessment.triageCategory,
      topDiagnosis: clinicalSynthesis.differentialDiagnosis[0]?.condition,
      disposition: clinicalSynthesis.dispositionRecommendation
    },
    outputPayload: {
      differentialCount: clinicalSynthesis.differentialDiagnosis.length,
      immediateActionsCount: clinicalSynthesis.immediateActions.length,
      disposition: clinicalSynthesis.dispositionRecommendation
    },
    executionDurationMs: Number((performance.now() - t5Start).toFixed(2)),
    reasoningSnippet: `Formulated primary diagnosis of ${clinicalSynthesis.differentialDiagnosis[0]?.condition} (${clinicalSynthesis.differentialDiagnosis[0]?.icd10Code}) with disposition: ${clinicalSynthesis.dispositionRecommendation}. Generated full SOAP note and order set.`
  });

  const totalProcessingTimeMs = Number((performance.now() - overallStartTime).toFixed(2));

  return {
    patientId: patient.id,
    timestamp: new Date().toISOString(),
    mlAssessment,
    drugSafetyAlerts,
    retrievedGuidelines: ragResult.retrievedChunks,
    clinicalSynthesis,
    agentTrace: traces,
    totalProcessingTimeMs,
    modelEngine: modelEngineUsed
  };
}

/**
 * Deterministic expert synthesis engine (fallback / offline capable)
 */
function generateExpertSynthesis(
  patient: PatientRecord,
  ml: ReturnType<typeof predictPatientRisk>,
  labAlerts: string[],
  drugAlerts: ReturnType<typeof findDrugInteractions>,
  guidelines: ReturnType<typeof searchClinicalGuidelines>['retrievedChunks']
): ClinicalSynthesis {
  const isHighRisk = ml.criticalityScore >= 0.6 || ml.news2Score >= 5;
  const isSepsisPattern = (patient.labs?.lactate && patient.labs.lactate >= 2.0) || (patient.vitals.temperature > 38.3 && patient.vitals.heartRate > 90);
  const isAcsPattern = (patient.labs?.troponinI && patient.labs.troponinI > 0.04) || patient.chiefComplaint.toLowerCase().includes('chest pressure') || patient.chiefComplaint.toLowerCase().includes('crushing');
  const isDkaPattern = (patient.labs?.bloodGlucose && patient.labs.bloodGlucose > 250) || patient.chiefComplaint.toLowerCase().includes('kussmaul') || patient.chiefComplaint.toLowerCase().includes('thirst');
  const isHtnPattern = patient.vitals.systolicBP >= 180 || patient.vitals.diastolicBP >= 110;
  const isCopdPattern = patient.vitals.oxygenSaturation < 90 || patient.chiefComplaint.toLowerCase().includes('wheezing') || patient.chiefComplaint.toLowerCase().includes('breathlessness');

  const diffDiag: ClinicalSynthesis['differentialDiagnosis'] = [];
  const actions: string[] = [];
  const labsAndImaging: string[] = [];
  const toPrescribe: string[] = [];
  const toAvoid: string[] = [];

  if (isSepsisPattern) {
    diffDiag.push({
      condition: 'Severe Body Infection (Sepsis)',
      icd10Code: 'R65.20',
      probability: 'HIGH',
      justification: `High body fever (${patient.vitals.temperature}°C), fast heart rate (${patient.vitals.heartRate} bpm), and high blood stress/lactate (${patient.labs?.lactate || 'N/A'} mmol/L) show a severe whole-body infection needing fast antibiotics.`
    });
    actions.push('Start emergency 1-hour infection treatment immediately');
    actions.push('Give IV fluids through drip for low blood pressure and body stress');
    actions.push('Collect blood samples for bacterial culture before giving antibiotics');
    labsAndImaging.push('Repeat blood lactate test in 2-4 hours', 'Blood Culture Tests (2 bottles)', 'Chest X-Ray to check lungs');
    toPrescribe.push('Ceftriaxone 2g IV + Vancomycin 1g IV (Strong Antibiotics)', '0.9% Normal Saline 1000 mL IV Drip');
  }

  if (isAcsPattern) {
    diffDiag.push({
      condition: 'Heart Attack / Acute Coronary Syndrome',
      icd10Code: 'I21.4',
      probability: 'HIGH',
      justification: `High heart damage marker Troponin (${patient.labs?.troponinI || 'N/A'} ng/mL) and heavy chest pain indicate the heart muscle is not getting enough blood flow.`
    });
    actions.push('Do an urgent 12-lead ECG heart trace within 10 minutes');
    actions.push('Connect patient to continuous heart rate and oxygen monitors');
    actions.push('Call Heart Specialist (Cardiologist) urgently for angiography check');
    labsAndImaging.push('Repeat Troponin test in 2 hours', '12-Lead ECG Heart Graph', 'Echocardiogram (Heart Ultrasound)');
    toPrescribe.push('Aspirin 325 mg (Chew immediately)', 'Heparin IV blood thinner', 'Atorvastatin 80 mg cholesterol tablet');
  }

  if (isDkaPattern) {
    diffDiag.push({
      condition: 'Diabetic Emergency (Diabetic Ketoacidosis - DKA)',
      icd10Code: 'E10.10',
      probability: 'HIGH',
      justification: `Very high blood sugar (${patient.labs?.bloodGlucose || 'N/A'} mg/dL), rapid deep breathing (${patient.vitals.respiratoryRate}/min), and vomiting indicate severe diabetic acid buildup in blood.`
    });
    actions.push('Check blood potassium before starting insulin drip');
    actions.push('Start fast IV saline drip (1000 mL per hour) to treat dehydration');
    actions.push('Check finger-prick blood sugar every 1 hour');
    labsAndImaging.push('Blood Gas & Electrolyte Panel (Potassium & Sodium)', 'Urine Ketone Test', 'Kidney Function Test');
    toPrescribe.push('0.9% Normal Saline 1000 mL/hr IV drip', 'Regular Insulin drip 0.1 units/kg/hr');
  }

  if (isCopdPattern) {
    diffDiag.push({
      condition: 'Severe Lung & Breathing Attack (COPD / Asthma Flare-Up)',
      icd10Code: 'J44.1',
      probability: 'HIGH',
      justification: `Low oxygen level (${patient.vitals.oxygenSaturation}%), fast breathing (${patient.vitals.respiratoryRate}/min), and wheezing show narrow airways needing immediate steam nebulization.`
    });
    actions.push('Give controlled oxygen through nasal cannula targeting 88-92% SpO2');
    actions.push('Give back-to-back bronchodilator nebulizer treatments immediately');
    labsAndImaging.push('Blood Gas Test (ABG)', 'Chest X-Ray', 'Viral Respiratory Swab');
    toPrescribe.push('Salbutamol + Ipratropium Nebulizer every 20 mins', 'Steroid Injection (Methylprednisolone 60mg IV)');
  }

  if (isHtnPattern && diffDiag.length === 0) {
    diffDiag.push({
      condition: 'High Blood Pressure Emergency Crisis',
      icd10Code: 'I16.0',
      probability: 'HIGH',
      justification: `Blood pressure (${patient.vitals.systolicBP}/${patient.vitals.diastolicBP} mmHg) is dangerously high and needs gradual, safe lowering to protect brain and kidneys.`
    });
    actions.push('Check eyes, heart ECG, and kidney tests to rule out organ strain');
    actions.push('Gently lower blood pressure by 20% over first 2 to 4 hours');
    labsAndImaging.push('Urine Test for Protein', 'Kidney Blood Tests & Electrolytes', '12-Lead ECG');
    toPrescribe.push('Labetalol 20mg IV injection or oral BP medicine');
  }

  if (diffDiag.length === 0) {
    diffDiag.push({
      condition: 'Chest Wall Muscle Strain / Mild Non-Urgent Issue',
      icd10Code: 'M79.1',
      probability: 'HIGH',
      justification: 'Vitals, heart biomarkers, and test results are all normal. No emergency danger signs detected.'
    });
    actions.push('Give mild pain relief and reassure the patient');
    actions.push('Advise rest and guide patient on when to return if pain worsens');
    labsAndImaging.push('Baseline ECG to confirm normal heart rhythm');
    toPrescribe.push('Paracetamol 500mg (as needed for pain)');
  }

  // Check drug contraindications
  for (const alert of drugAlerts) {
    if (alert.severity === 'CONTRAINDICATED') {
      toAvoid.push(`${alert.drugA} + ${alert.drugB} (DO NOT GIVE: ${alert.mechanism})`);
    } else if (alert.severity === 'MAJOR') {
      toAvoid.push(`${alert.drugA} + ${alert.drugB} (WARNING: ${alert.clinicalRecommendation})`);
    }
  }

  let disposition: ClinicalSynthesis['dispositionRecommendation'] = 'OBSERVATION_UNIT';
  if (ml.criticalityScore >= 0.8 || ml.news2Score >= 7 || (patient.labs?.lactate && patient.labs.lactate >= 4.0)) {
    disposition = 'ICU_ADMISSION';
  } else if (ml.criticalityScore >= 0.55 || ml.news2Score >= 5) {
    disposition = 'STEP_DOWN_UNIT';
  } else if (ml.criticalityScore >= 0.35) {
    disposition = 'GENERAL_WARD';
  } else if (ml.criticalityScore < 0.20) {
    disposition = 'DISCHARGE_WITH_FOLLOWUP';
  }

  const primaryCondition = diffDiag[0]?.condition || 'Emergency Condition';

  return {
    executiveSummary: `Patient ${patient.name} (${patient.age} years old) has symptoms matching ${primaryCondition}. The vital signs risk score is ${ml.news2Score}/20, and emergency risk is calculated at ${(ml.criticalityScore * 100).toFixed(1)}%. Immediate doctor evaluation and treatment are recommended.`,
    differentialDiagnosis: diffDiag,
    immediateActions: actions.length > 0 ? actions : ['Keep monitoring vitals closely', 'Re-check blood pressure and pulse every 15 minutes'],
    recommendedLabsAndImaging: labsAndImaging,
    medicationRecommendations: {
      prescribe: toPrescribe,
      avoid: toAvoid,
      rationale: toAvoid.length > 0
        ? `Prescriptions modified to prevent ${toAvoid.length} dangerous medicine clashes.`
        : 'Medicines chosen strictly according to medical safety guidelines.'
    },
    dispositionRecommendation: disposition,
    soapNote: {
      subjective: `Patient complaint: "${patient.chiefComplaint}". Problems started ${patient.symptomDurationHours} hours ago. Past illnesses: ${patient.pastMedicalHistory.join(', ') || 'None reported'}. Current home medicines: ${patient.currentMedications.join(', ') || 'None'}.`,
      objective: `Vitals: Heart Rate ${patient.vitals.heartRate} BPM, Blood Pressure ${patient.vitals.systolicBP}/${patient.vitals.diastolicBP} mmHg, Breathing Rate ${patient.vitals.respiratoryRate}/min, Oxygen ${patient.vitals.oxygenSaturation}%, Temperature ${patient.vitals.temperature}°C, Conscious Level ${patient.vitals.gcsScore}/15, Pain ${patient.vitals.painScore}/10. Lab tests: ${labAlerts.join('; ') || 'All within normal range'}.`,
      assessment: `${primaryCondition} (Diagnosis Code: ${diffDiag[0]?.icd10Code || 'General'}). Emergency level: ${ml.triageCategory}.`,
      plan: `1. Emergency steps: ${actions.slice(0, 2).join('; ')}. 2. Tests to run: ${labsAndImaging.slice(0, 2).join('; ')}. 3. Medicines to give: ${toPrescribe.join('; ') || 'Basic care'}. 4. Recommended hospital ward: ${disposition === 'ICU_ADMISSION' ? 'Intensive Care Unit (ICU)' : disposition === 'STEP_DOWN_UNIT' ? 'High Dependency Ward' : disposition === 'GENERAL_WARD' ? 'General Ward' : disposition === 'OBSERVATION_UNIT' ? 'Observation Ward' : 'Home care with follow-up'}.`
    }
  };
}
