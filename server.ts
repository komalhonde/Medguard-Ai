import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { BENCHMARK_PATIENTS } from './src/data/syntheticPatients';
import { CLINICAL_GUIDELINES } from './src/data/clinicalGuidelines';
import { DRUG_INTERACTIONS_DATABASE, findDrugInteractions } from './src/data/drugInteractions';
import { predictPatientRisk, PRETRAINED_MODEL_METRICS } from './src/ml/triageModel';
import { searchClinicalGuidelines } from './src/rag/vectorStore';
import { runClinicalAgent } from './src/agent/clinicalAgent';
import { runAllAutomatedTests } from './src/testing/testSuite';
import { PatientRecord, DatasetStatistics } from './src/types/clinical';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory patient store initialized with benchmarks
let patientStore: PatientRecord[] = [...BENCHMARK_PATIENTS];

// 1. Health & Telemetry Endpoint (Milestone 10)
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'HEALTHY',
    service: 'MedGuard AI Clinical Decision Support Engine',
    version: '2.4.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    systemMetrics: {
      heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      rssMB: Number((mem.rss / 1024 / 1024).toFixed(2))
    },
    engines: {
      classicalML: 'GradientBoost-Forest v2.4 (Active)',
      ragVectorStore: `In-Memory TF-IDF/Cosine (${CLINICAL_GUIDELINES.length} chunks indexed)`,
      pharmacologySafety: `Drug Interaction Graph (${DRUG_INTERACTIONS_DATABASE.length} rules active)`,
      geminiLLM: process.env.GEMINI_API_KEY ? 'Gemini 3.7 Flash (Configured)' : 'Offline Rule-Enhanced Fallback'
    }
  });
});

// 2. Patient Data Endpoints
app.get('/api/patients', (req, res) => {
  res.json({
    total: patientStore.length,
    patients: patientStore
  });
});

app.post('/api/patients', (req, res) => {
  const newPatient: PatientRecord = {
    ...req.body,
    id: req.body.id || `PT-CUSTOM-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString()
  };
  patientStore.unshift(newPatient);
  res.status(201).json({
    message: 'Patient registered successfully',
    patient: newPatient
  });
});

// 3. ML Risk Inference Endpoint (Milestone 04 / 05)
app.post('/api/ml/predict', (req, res) => {
  try {
    const patient: PatientRecord = req.body;
    if (!patient || !patient.vitals) {
      return res.status(400).json({ error: 'Invalid patient record or missing vital signs' });
    }
    const result = predictPatientRisk(patient);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: 'ML Inference failure', details: String(err) });
  }
});

// 4. RAG Knowledge Retrieval Endpoint (Milestone 06)
app.post('/api/rag/search', (req, res) => {
  try {
    const { query, topK, category } = req.body;
    const results = searchClinicalGuidelines(query || '', topK || 8, category);
    res.json(results);
  } catch (err: unknown) {
    res.status(500).json({ error: 'RAG search failure', details: String(err) });
  }
});

// 5. Drug Interaction Safety Endpoint
app.post('/api/pharmacology/check', (req, res) => {
  const { currentMedications, proposedMedications } = req.body;
  const interactions = findDrugInteractions(currentMedications || [], proposedMedications || []);
  res.json({
    interactionsCount: interactions.length,
    interactions
  });
});

// 6. Autonomous Clinical Agent Endpoint (Milestone 07)
app.post('/api/agent/triage', async (req, res) => {
  try {
    const patient: PatientRecord = req.body;
    if (!patient || !patient.vitals) {
      return res.status(400).json({ error: 'Valid patient record with vital signs is required' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    const result = await runClinicalAgent(patient, apiKey);
    res.json(result);
  } catch (err: unknown) {
    console.error('Agent execution error:', err);
    res.status(500).json({ error: 'Agent execution failed', details: String(err) });
  }
});

// 7. Dataset Analytics & EDA Endpoint (Milestone 02 / 04)
app.get('/api/analytics/dataset', (req, res) => {
  const stats: DatasetStatistics = {
    totalRecords: 1200,
    categoryDistribution: {
      RESUSCITATION: 144,
      EMERGENT: 384,
      URGENT: 432,
      LESS_URGENT: 180,
      NON_URGENT: 60
    },
    ageDistribution: { min: 18, max: 94, mean: 56.4, median: 58 },
    vitalAverages: {
      heartRate: 88.6,
      systolicBP: 132.4,
      oxygenSaturation: 95.8,
      temperature: 37.1,
      respiratoryRate: 19.2
    },
    topConditions: [
      { name: 'Sepsis & Severe Infection', count: 320, percentage: 26.7 },
      { name: 'Acute Coronary Syndrome / Chest Pain', count: 288, percentage: 24.0 },
      { name: 'COPD / Asthma Exacerbation', count: 216, percentage: 18.0 },
      { name: 'Diabetic Ketoacidosis & Hyperglycemia', count: 144, percentage: 12.0 },
      { name: 'Hypertensive Urgency / Crisis', count: 132, percentage: 11.0 },
      { name: 'Low Acuity / Musculoskeletal', count: 100, percentage: 8.3 }
    ]
  };

  res.json({
    metrics: PRETRAINED_MODEL_METRICS,
    datasetStats: stats,
    guidelinesCount: CLINICAL_GUIDELINES.length
  });
});

// 8. Automated Test Suite Runner (Milestone 10)
app.get('/api/tests/run', async (req, res) => {
  try {
    const results = await runAllAutomatedTests();
    const passedCount = results.filter(r => r.status === 'PASSED').length;
    res.json({
      totalTests: results.length,
      passedCount,
      failedCount: results.length - passedCount,
      passRatePercent: Number(((passedCount / results.length) * 100).toFixed(1)),
      timestamp: new Date().toISOString(),
      testResults: results
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Test execution failure', details: String(err) });
  }
});

// 9. Repository & Challenge Documentation Files Provider (for in-app GitHub export & inspector)
app.get('/api/repository/files', (req, res) => {
  const fileList = [
    { name: 'README.md', path: '/README.md', category: 'Documentation' },
    { name: 'DECISION_LOG.md', path: '/DECISION_LOG.md', category: 'Milestone 11' },
    { name: 'DEBUGGING_REPORT.md', path: '/DEBUGGING_REPORT.md', category: 'Milestone 12' },
    { name: 'AI_USAGE.md', path: '/AI_USAGE.md', category: 'Milestone 10' },
    { name: 'ARCHITECTURE.md', path: '/ARCHITECTURE.md', category: 'Milestone 01-08' },
    { name: 'Dockerfile', path: '/Dockerfile', category: 'Milestone 09' },
    { name: 'docker-compose.yml', path: '/docker-compose.yml', category: 'Milestone 09' },
    { name: 'pipeline/data_pipeline.py', path: '/pipeline/data_pipeline.py', category: 'Milestone 03' },
    { name: 'pipeline/ml_model_trainer.py', path: '/pipeline/ml_model_trainer.py', category: 'Milestone 04-05' },
    { name: 'pipeline/requirements.txt', path: '/pipeline/requirements.txt', category: 'Milestone 03' },
    { name: 'src/ml/triageModel.ts', path: '/src/ml/triageModel.ts', category: 'Milestone 04-05' },
    { name: 'src/rag/vectorStore.ts', path: '/src/rag/vectorStore.ts', category: 'Milestone 06' },
    { name: 'src/agent/clinicalAgent.ts', path: '/src/agent/clinicalAgent.ts', category: 'Milestone 07' },
    { name: 'src/testing/testSuite.ts', path: '/src/testing/testSuite.ts', category: 'Milestone 10' }
  ];

  const filesWithContent = fileList.map(f => {
    try {
      const fullPath = path.join(process.cwd(), f.path.startsWith('/') ? f.path.slice(1) : f.path);
      if (fs.existsSync(fullPath)) {
        return {
          ...f,
          content: fs.readFileSync(fullPath, 'utf-8'),
          exists: true
        };
      }
    } catch {
      // Fallback
    }
    return { ...f, content: '', exists: false };
  });

  res.json({ files: filesWithContent });
});

// Vite Middleware for Full-Stack App
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MedGuard AI] Clinical Decision Support Server running on port ${PORT}`);
  });
}

startServer();
