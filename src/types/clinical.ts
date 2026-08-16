export type TriageCategory = 'RESUSCITATION' | 'EMERGENT' | 'URGENT' | 'LESS_URGENT' | 'NON_URGENT';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface VitalSigns {
  heartRate: number;         // bpm (normal: 60-100)
  systolicBP: number;        // mmHg (normal: 90-120)
  diastolicBP: number;       // mmHg (normal: 60-80)
  respiratoryRate: number;   // breaths/min (normal: 12-20)
  oxygenSaturation: number;  // % (normal: 95-100)
  temperature: number;       // °C (normal: 36.5-37.5)
  gcsScore: number;          // Glasgow Coma Scale (3-15)
  painScore: number;         // 0-10
}

export interface LabBiomarkers {
  whiteBloodCellCount?: number; // k/uL (normal: 4.5-11.0)
  lactate?: number;              // mmol/L (normal: 0.5-2.0, >4.0 is critical)
  serumCreatinine?: number;      // mg/dL (normal: 0.7-1.3)
  bloodGlucose?: number;         // mg/dL (normal: 70-140)
  troponinI?: number;            // ng/mL (normal: <0.04)
  hemoglobin?: number;           // g/dL (normal: 13.5-17.5)
  dDimer?: number;               // ng/mL (normal: <500)
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  chiefComplaint: string;
  symptomDurationHours: number;
  pastMedicalHistory: string[];
  currentMedications: string[];
  proposedMedications: string[];
  allergies: string[];
  vitals: VitalSigns;
  labs: LabBiomarkers;
  timestamp: string;
}

export interface FeatureImportance {
  featureName: string;
  clinicalLabel: string;
  importanceValue: number;
  patientValue: number | string;
  normalRange: string;
  riskDirection: 'ELEVATES_RISK' | 'PROTECTIVE' | 'NEUTRAL';
}

export interface MLPredictionResult {
  modelName: string;
  triageCategory: TriageCategory;
  riskLevel: RiskLevel;
  criticalityScore: number;        // 0.0 - 1.0 probability
  readmissionRisk30Day: number;    // 0.0 - 1.0 probability
  news2Score: number;              // 0 - 20 (National Early Warning Score)
  qSofaScore: number;              // 0 - 3 (quick SOFA score)
  confidenceInterval: [number, number];
  featureContributions: FeatureImportance[];
  inferenceTimeMs: number;
}

export interface RAGDocumentChunk {
  id: string;
  guidelineTitle: string;
  authoringBody: string; // e.g. "WHO", "AHA", "Surviving Sepsis Campaign", "NICE"
  category: string;
  sectionTitle: string;
  content: string;
  keywords: string[];
  publishedYear: number;
  evidenceGrade: string; // e.g. "Class I (Level A)"
  relevanceScore?: number;
}

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';
  mechanism: string;
  clinicalRecommendation: string;
  managementAdvice: string;
}

export interface AgentStepTrace {
  stepNumber: number;
  toolName: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  inputPayload: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  executionDurationMs: number;
  reasoningSnippet: string;
}

export interface ClinicalSynthesis {
  executiveSummary: string;
  differentialDiagnosis: Array<{
    condition: string;
    icd10Code: string;
    probability: 'HIGH' | 'MODERATE' | 'LOW';
    justification: string;
  }>;
  immediateActions: string[];
  recommendedLabsAndImaging: string[];
  medicationRecommendations: {
    prescribe: string[];
    avoid: string[];
    rationale: string;
  };
  dispositionRecommendation: 'ICU_ADMISSION' | 'STEP_DOWN_UNIT' | 'GENERAL_WARD' | 'OBSERVATION_UNIT' | 'DISCHARGE_WITH_FOLLOWUP';
  soapNote?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface TriageAgentResult {
  patientId: string;
  timestamp: string;
  mlAssessment: MLPredictionResult;
  drugSafetyAlerts: DrugInteraction[];
  retrievedGuidelines: RAGDocumentChunk[];
  clinicalSynthesis: ClinicalSynthesis;
  agentTrace: AgentStepTrace[];
  totalProcessingTimeMs: number;
  modelEngine: string;
}

export interface MLModelMetrics {
  modelName: string;
  rocAuc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  sampleSize: number;
  trainingFeatures: string[];
}

export interface DatasetStatistics {
  totalRecords: number;
  categoryDistribution: Record<TriageCategory, number>;
  ageDistribution: { min: number; max: number; mean: number; median: number };
  vitalAverages: {
    heartRate: number;
    systolicBP: number;
    oxygenSaturation: number;
    temperature: number;
    respiratoryRate: number;
  };
  topConditions: Array<{ name: string; count: number; percentage: number }>;
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'ML_VALIDATION' | 'RAG_RETRIEVAL' | 'DRUG_SAFETY' | 'AGENT_WORKFLOW' | 'SCHEMA_INTEGRITY';
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  assertion: string;
  expected: string;
  actual: string;
  error?: string;
}
