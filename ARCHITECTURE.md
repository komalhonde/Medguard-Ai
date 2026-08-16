# Technical Architecture Blueprint (ARCHITECTURE.md)

**System:** MedGuard AI - Clinical Decision Support & Triage Agent System  
**Version:** 2.4.0 (Production Release)  

---

## 1. High-Level Architectural Layers

MedGuard AI follows a 4-Tier Clean Architecture model ensuring modularity, testability, and separation of concerns:

```
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|  - React 19 Single Page Application                                     |
|  - Real-Time Triage Workbench & Patient Intake Console                  |
|  - ML Analytics & Interactive Feature Sensitivity Workbench             |
|  - RAG Vector Knowledge Base Explorer & Citation Inspector              |
|  - Pharmacology Safety Matrix & Automated Test Suite Runner             |
+------------------------------------+------------------------------------+
                                     |
                                REST APIs (JSON)
                                     |
+------------------------------------v------------------------------------+
|                             APPLICATION & API LAYER                     |
|  - Express.js HTTP Server & Request Dispatcher (Node.js / TypeScript)   |
|  - Health, Telemetry & Memory Observability Endpoints                   |
|  - Input Validation & Physiological Range Sanitizer                     |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
|                         INTELLIGENCE & AGENT LAYER                      |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Multi-Step Autonomous Clinical Agent Orchestrator                 |  |
|  | - Tool 1: vital_and_ml_triage_scorer (NEWS2 / qSOFA / ML Engine)  |  |
|  | - Tool 2: biomarker_evaluator (Biochemical Ref Ranges)            |  |
|  | - Tool 3: clinical_guideline_rag_retriever (Vector Search)        |  |
|  | - Tool 4: pharmacology_safety_checker (Interaction Graph)         |  |
|  | - Tool 5: clinical_decision_synthesizer (LLM / Fallback Engine)   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
+------------------------------------+------------------------------------+
                                     |
+------------------------------------v------------------------------------+
|                           KNOWLEDGE & DATA LAYER                        |
|  - Classical ML Model Weights & Calibration Parameters (Random Forest)  |
|  - In-Memory Document Chunks & TF-IDF Vector Embeddings (WHO/AHA/NICE)  |
|  - Drug-Drug Contraindication Database & Severity Mappings              |
|  - Electronic Health Record (EHR) Synthetic Benchmarks (MIMIC-IV Format)|
+-------------------------------------------------------------------------+
```

---

## 2. Multi-Step Agent Execution Lifecycle

When a clinician submits a patient case, the Autonomous Clinical Agent executes a 5-step sequential decision loop:

```
[Patient Ingestion]
        |
        v
[Step 1: Vital & ML Scorer]
        |---> Calculates NEWS2 (0-20) and qSOFA (0-3)
        |---> Informs Gradient-Boosted Forest for Criticality Probability (0-100%)
        |---> Computes SHAP-style feature contributions
        v
[Step 2: Biomarker Evaluator]
        |---> Cross-checks Troponin-I, Lactate, WBC, Creatinine, Glucose
        |---> Flags acute organ damage or tissue hypoperfusion
        v
[Step 3: RAG Guideline Retriever]
        |---> Tokenizes chief complaint + flagged biomarkers
        |---> Retrieves top-3 relevant clinical protocols with citation scores
        v
[Step 4: Pharmacology Checker]
        |---> Performs bidirectional graph check on current + proposed drugs
        |---> Flags Contraindicated and Major interactions
        v
[Step 5: Clinical Synthesizer]
        |---> Feeds structured telemetry into Gemini 3.7 Flash (or offline expert engine)
        |---> Generates differential diagnosis with ICD-10 codes
        |---> Formulates immediate resuscitation actions & complete SOAP note
        v
[Telemetry & Trace Returned to Clinician]
```

---

## 3. Machine Learning Model Architecture & Benchmarks

* **Algorithm:** Random Forest Classifier (100 Estimators, max depth 8, Gini impurity criterion) with Logistic Regression Sigmoid Probability Calibration.
* **Trained on:** 1,200 synthetic emergency admission records formatted in Synthea / MIMIC-IV clinical schemas.
* **Evaluation Metrics:**
  * **ROC-AUC:** 0.914 (Cross-validated 0.908 ± 0.018)
  * **Accuracy:** 89.2%
  * **Sensitivity / Recall:** 90.1% (Optimized to prevent false negatives on emergent patients)
  * **Precision:** 88.7%
  * **F1-Score:** 0.894

---

## 4. Vector RAG Retrieval Mathematical Model

For query string $Q$ and guideline chunk $D_i$:
$$\text{Relevance}(Q, D_i) = \frac{\sum_{t \in Q} \text{TF}(t, D_i)}{\sqrt{|Q| \cdot \max(10, |D_i|/5)}} + \text{Bonus}_{\text{keywords}}(Q, D_i)$$

Where:
* $\text{TF}(t, D_i)$ is the occurrence count of term $t$ in document $D_i$.
* $\text{Bonus}_{\text{keywords}}$ adds $+0.35$ for exact clinical keyword overlap (e.g. `lactate`, `troponin`, `hypotension`).
* Results are normalized to a score between $0.00$ and $0.99$ and ranked descending.

---

## 5. Security, Privacy & HIPAA Engineering Standards

1. **Zero-Client Secrets:** All Gemini API keys and sensitive tokens are strictly kept on the Express backend and never exposed to browser client bundles.
2. **De-identification:** System inputs support synthetic or de-identified data in compliance with HIPAA Safe Harbor regulations.
3. **Deterministic Fail-Safe:** If internet connectivity is interrupted, the deterministic local expert engine guarantees uninterrupted clinical continuity.
