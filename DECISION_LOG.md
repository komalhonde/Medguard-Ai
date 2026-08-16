# Engineering Decision Log (DECISION_LOG.md)

**Project:** MedGuard AI - Clinical Decision Support & Triage Agent System  
**Author:** Candidate (AI/ML Engineering Internship Challenge 2026)  
**Date:** August 2026  

This log records major technical and architectural decisions made throughout the engineering lifecycle of MedGuard AI in accordance with Challenge Rule #11.

---

### Decision 1: Hybrid AI/ML Architecture (Classical ML + LLM) over Pure LLM

* **Decision:** Implement a two-tiered hybrid architecture where deterministic classical ML (Random Forest + Logistic Regression) and validated clinical formulas (NEWS2, qSOFA) compute numerical risk probabilities, while a modern Large Language Model (Gemini 3.7 Flash) performs semantic synthesis, differential diagnosis reasoning, and SOAP note generation.
* **Reason:** In high-stakes emergency medicine, pure LLM-based numerical triage suffers from hallucination, non-deterministic calibration, and lack of reproducible risk scoring. Classical ML provides mathematically verifiable risk curves (ROC-AUC 0.914), while LLMs excel at qualitative clinical reasoning.
* **Alternative Considered:** Single End-to-End LLM prompted to directly output the risk score and triage level.
* **Why Rejected:** End-to-end LLMs cannot guarantee strict calibration bounds, can produce inconsistent numerical scores for identical vitals, and introduce unacceptable latency in emergency triage.

---

### Decision 2: In-Memory TF-IDF & Cosine Vector Store over Cloud Vector Databases (e.g. Pinecone/Milvus)

* **Decision:** Build an in-memory TF-IDF + Cosine similarity vector retrieval engine with keyword boosting for clinical guidelines.
* **Reason:** The clinical knowledge base consists of emergency protocols (Surviving Sepsis, ACC/AHA, NICE, ADA). An in-memory vector store executes sub-millisecond retrievals (< 2ms) without external network dependencies, recurring cloud costs, or API rate limits.
* **Alternative Considered:** Cloud-hosted Vector Database (Pinecone, Weaviate, or Qdrant Cloud).
* **Why Rejected:** Introduces unnecessary infrastructure complexity, network latency, external credentials management, and failure points for a bounded, verified clinical protocol corpus.

---

### Decision 3: Deterministic Offline Expert Engine Fallback for LLM Invocations

* **Decision:** Implement a rule-enhanced deterministic clinical synthesizer fallback if the Gemini API key is unavailable, network timeouts occur, or API rate limits are hit.
* **Reason:** Healthcare systems require 100% uptime and fail-safe reliability. If an external AI API fails during an emergency department shift, the triage system must still output evidence-based differential diagnoses, order sets, and disposition recommendations.
* **Alternative Considered:** Throwing HTTP 503 Service Unavailable errors when LLM generation fails.
* **Why Rejected:** A system crash or blank screen during triage directly endangers patient workflows. Graceful degradation is a non-negotiable healthcare engineering principle.

---

### Decision 4: Rule-Graph Drug Interaction Engine over External Commercial API

* **Decision:** Implement a local pharmacology graph and rule database for high-risk drug-drug contraindications (Warfarin + NSAIDs, Nitrates + Sildenafil, ACEi + Potassium-sparing diuretics, Clopidogrel + Omeprazole).
* **Reason:** Real-time safety validation during triage requires zero-latency local checks before order placement. Local rule graphs allow deterministic unit testing of drug pairs with 100% test repeatability.
* **Alternative Considered:** Querying an external commercial drug database API (e.g., RxNorm / DrugBank live API).
* **Why Rejected:** High latency (300-800ms per check), external subscription costs, rate limiting, and risk of network failure during emergency medication administration.

---

### Decision 5: Multi-Step Agentic Workflow with Explicit Tool Calling Trace

* **Decision:** Structure the diagnostic intelligence as an Autonomous 5-Step Agent (`vital_and_ml_triage_scorer` -> `biomarker_evaluator` -> `clinical_guideline_rag_retriever` -> `pharmacology_safety_checker` -> `clinical_decision_synthesizer`) with structured step-by-step trace logs exposed to the frontend.
* **Reason:** Medical AI must be transparent and auditable. Clinicians will not trust a black-box AI. By exposing the agent's intermediate steps, tool inputs, outputs, and reasoning snippets, clinicians can verify each link in the diagnostic chain.
* **Alternative Considered:** Single-pass monolithic prompt combining all tasks into one massive LLM call.
* **Why Rejected:** Monolithic prompts lose intermediate traceability, are prone to instruction-drift, and prevent independent validation of lab thresholds or drug interaction rules.

---

### Decision 6: Docker Multi-Stage Build with Alpine Linux Base

* **Decision:** Package the full-stack application using a multi-stage Docker build with `node:20-alpine` base image.
* **Reason:** Produces a minimal, secure, production-ready container image (< 180MB) with minimal attack surface, rapid deployment times, and reproducible execution across any host OS or cloud provider.
* **Alternative Considered:** Single-stage Ubuntu or Debian Dockerfile.
* **Why Rejected:** Bloated image sizes (> 1GB), inclusion of unnecessary system binaries, and longer container build/spin-up cold starts.
