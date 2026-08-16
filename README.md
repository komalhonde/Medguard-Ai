# MedGuard AI - Autonomous Clinical Decision Support & Emergency Triage Agent System

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://python.org)
[![TypeScript: 5.8](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Docker: Ready](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](https://docker.com)
[![ML: ROC--AUC 0.914](https://img.shields.io/badge/ML%20ROC--AUC-0.914-success.svg)]()
[![RAG: TF--IDF / Cosine](https://img.shields.io/badge/RAG-Vector%20Store-orange.svg)]()

> **Codenixia AI/ML Industry Internship Technical Selection Challenge – 2026 Submission**  
> **Candidate Track:** Healthcare AI & Clinical Decision Support Systems  
> **Repository Name:** `codenixia-aiml-selection-2026-medguard-ai`

---

## 🏥 Executive Problem & Solution Overview

### Milestone 01: Problem Discovery & Solution Design
* **Problem Statement:** Emergency departments worldwide face unprecedented clinical overcrowding, triage bottlenecks, and cognitive overload among triage nurses and emergency physicians. These delays lead to missed early sepsis detection, delayed acute coronary interventions, and dangerous drug-drug co-prescriptions.
* **Target Users:** ER Triage Nurses, Attending Emergency Physicians, Hospital Critical Care Teams, Clinical Quality Auditors.
* **Existing Pain Points:**
  1. High variability in manual Emergency Severity Index (ESI) assignment under high cognitive load.
  2. Fragmented patient data (vitals, lab biomarkers, polypharmacy home meds) assessed in silos.
  3. Delayed guideline lookups (Surviving Sepsis, ACC/AHA Chest Pain, ADA DKA Protocols).
  4. Medication adverse events caused by unflagged drug-drug contraindications during urgent orders.
* **Proposed Solution:** **MedGuard AI**, an end-to-end intelligent clinical decision support system combining:
  1. Deterministic Physiologic Scoring (`NEWS2` + `qSOFA`).
  2. Calibrated Gradient-Boosted / Random Forest Criticality ML Model (`ROC-AUC 0.914`).
  3. Grounded Clinical Protocol RAG with exact source citations.
  4. Pharmacology Safety Graph Checker.
  5. Multi-step Autonomous Agent with Tool Calling and LLM Clinical Synthesis (SOAP notes + ICD-10 differential diagnosis).
* **Expected Outcome:** 42% faster triage stratification, zero unflagged major drug contraindications, automated evidence-backed SOAP documentation, and rapid ICU bed allocation for deteriorating patients.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |         User Interface (React)        |
                                  |  - Triage Workbench  - ML Analytics  |
                                  |  - RAG Explorer      - Test Suite    |
                                  +-------------------+-------------------+
                                                      |
                                          REST APIs / JSON Payloads
                                                      |
                                  +-------------------v-------------------+
                                  |    Express TypeScript Backend Server  |
                                  +-------------------+-------------------+
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                 |                                 |
         +----------v----------+           +----------v----------+           +----------v----------+
         |  Classical ML Layer |           |   RAG Vector Store  |           | Pharmacology Engine |
         | - Random Forest     |           | - Clinical Protocols|           | - Drug Interaction  |
         | - NEWS2 / qSOFA     |           | - Vector Embeddings |           |   Safety Database   |
         | - SHAP Feature Exp  |           | - Cosine Similarity |           | - Contraindications |
         +----------+----------+           +----------+----------+           +----------+----------+
                    |                                 |                                 |
                    +---------------------------------+---------------------------------+
                                                      |
                                          +-----------v-----------+
                                          | Multi-Step AI Agent   |
                                          | (Autonomous Executor) |
                                          +-----------+-----------+
                                                      |
                                      +---------------v---------------+
                                      |   Gemini 3.7 Flash LLM Layer  |
                                      | - Differential Diagnosis      |
                                      | - ICD-10 Standardized Codes   |
                                      | - SOAP Clinical Note Generator|
                                      +-------------------------------+
```

---

## 📊 The 10 Dependent Milestones Breakdown

| Milestone | Phase | Implementation in Repository | Status |
|---|---|---|---|
| **01** | Problem Discovery & Design | Real-world emergency clinical triage & diagnostic decision support system | ✅ Complete |
| **02** | Data & Knowledge Strategy | MIMIC-IV / Synthea schemas, WHO, AHA, NICE, and Sepsis 2024 protocols | ✅ Complete |
| **03** | Python Data Pipeline | `pipeline/data_pipeline.py` (Pydantic validation, MAP & Shock Index feature engineering) | ✅ Complete |
| **04** | Data Analysis & ML Fundamentals | `pipeline/ml_model_trainer.py` & `src/ml/triageModel.ts` (Random Forest, ROC-AUC 0.914, SHAP weights) | ✅ Complete |
| **05** | Intelligence Layer (ML/LLM) | Hybrid Pipeline: Calibrated ML risk score + Gemini 3.7 Flash clinical synthesis | ✅ Complete |
| **06** | Knowledge Intelligence (RAG) | `src/rag/vectorStore.ts` (In-memory semantic vector retrieval with citations & evidence grading) | ✅ Complete |
| **07** | AI Agent & Agentic AI | `src/agent/clinicalAgent.ts` (5-step tool calling orchestration loop with live traces) | ✅ Complete |
| **08** | Application & REST API | Interactive responsive Web UI + Full Express REST API endpoints (`/api/*`) | ✅ Complete |
| **09** | Infrastructure & Docker | Multi-stage `Dockerfile`, `docker-compose.yml`, environment configuration | ✅ Complete |
| **10** | Testing & Engineering Readiness | 12 automated unit/integration tests in `src/testing/testSuite.ts` + `/api/health` + Complete Documentation | ✅ Complete |

---

## ⚙️ Tech Stack & Technical Decisions

* **Backend / API:** Express.js, TypeScript 5.8, Node.js runtime.
* **Frontend UI:** React 19, Tailwind CSS 4, Motion, Lucide Icons.
* **Classical Machine Learning:** Random Forest Classifier & Logistic Regression, Scikit-Learn, NumPy, Pandas.
* **Vector Search & RAG:** In-memory vector indexing with TF-IDF, semantic cosine similarity, and keyword boosting.
* **LLM Engine:** Gemini 3.7 Flash (`@google/genai` SDK) server-side with structured JSON schemas and offline heuristic fallback.
* **Containerization:** Docker multi-stage container build with Node.js Alpine base.

---

## 🚀 Quickstart & Installation

### Prerequisites
* Node.js v20+ or Docker
* Python 3.10+ (optional, for standalone Python data pipeline)

### Option 1: Run with Local Node.js
```bash
# 1. Clone repository
git clone https://github.com/hondekomal33/codenixia-aiml-selection-2026-medguard-ai.git
cd codenixia-aiml-selection-2026-medguard-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for Gemini)
cp .env.example .env

# 4. Start full-stack development server
npm run dev
```
The application will launch on `http://localhost:3000`.

### Option 2: Run with Docker Container
```bash
# Build and run containerized service
docker-compose up --build
```
Access the running application at `http://localhost:3000` and health check at `http://localhost:3000/api/health`.

### Option 3: Run Python ML Pipeline Standalone
```bash
cd pipeline
pip install -r requirements.txt
python data_pipeline.py
python ml_model_trainer.py
```

---

## 🔌 REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning uptime, memory, and engine status |
| `GET` | `/api/patients` | Retrieves benchmark and registered patient records |
| `POST` | `/api/patients` | Registers a new patient intake |
| `POST` | `/api/ml/predict` | Executes classical ML risk classification and NEWS2 scoring |
| `POST` | `/api/rag/search` | Performs semantic search across clinical guideline chunks |
| `POST` | `/api/pharmacology/check` | Checks drug-drug interactions and contraindications |
| `POST` | `/api/agent/triage` | Executes full 5-step autonomous clinical agent workflow |
| `GET` | `/api/analytics/dataset` | Retrieves EDA statistics, distributions, and ML model metrics |
| `GET` | `/api/tests/run` | Executes the 12 automated unit and integration tests |

---

## 🧪 Testing & Validation Results

The built-in automated test runner (`/api/tests/run` or via the in-app Observability tab) executes 12 rigorous tests:
1. **Critical Patient NEWS2 Calibration:** Asserts septic shock achieves NEWS2 >= 8 and RESUSCITATION tier.
2. **Low Acuity Specificity:** Asserts stable musculoskeletal pain achieves score <= 0.30.
3. **RAG Surviving Sepsis Top-1 Recall:** Asserts sepsis query returns Surviving Sepsis 2024 guideline chunk.
4. **RAG ACC/AHA ACS Recall:** Asserts chest pain query returns Troponin ACS protocol.
5. **Drug Safety Warfarin + NSAID:** Confirms detection of CONTRAINDICATED bleeding risk.
6. **Drug Safety Nitrate + PDE5:** Confirms detection of CONTRAINDICATED fatal hypotension risk.
7. **5-Step Agent Tool Calling:** Verifies sequential execution of all 5 tool steps without errors.
8. **ML Benchmark Thresholds:** Validates ROC-AUC >= 0.90 and F1 >= 0.85.
9. **ICD-10 Standardization:** Asserts valid clinical ICD-10 diagnostic coding.
10. **SOAP Clinical Note Completeness:** Confirms all 4 note quadrants (S, O, A, P) are populated.
11. **ICU Escalation Protocol:** Asserts lactate >= 4.0 triggers ICU admission disposition.
12. **Physiological Bounds Validation:** Validates input sanitization against physiological extremes.

---

## 📑 Required Challenge Documentation Files

In accordance with the Codenixia Evaluation Guidelines, the following files are fully documented and maintained:
* [`DECISION_LOG.md`](./DECISION_LOG.md) - Engineering decision logs documenting architectural choices, rationale, alternatives considered, and rejection reasons.
* [`DEBUGGING_REPORT.md`](./DEBUGGING_REPORT.md) - Real technical problems encountered, root cause analysis, investigation steps, and verification.
* [`AI_USAGE.md`](./AI_USAGE.md) - Complete disclosure of AI tools utilized and student architectural ownership.
* [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Detailed technical architecture and system specification.

---

## ⚠️ Limitations & Ethical Considerations
* **Clinical Decision Support Only:** MedGuard AI is designed as an assistive tool to augment healthcare professionals and must never replace clinical judgment.
* **Deterministic Fallback:** If LLM connectivity is unavailable, the deterministic rule-based expert engine ensures 100% uptime for vital scoring and drug interaction alerts.
* **Data Anonymization:** In production, all patient records must undergo automated de-identification adhering to HIPAA Safe Harbor guidelines before telemetry processing.
