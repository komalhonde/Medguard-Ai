# AI Tool Usage Disclosure (AI_USAGE.md)

**Project:** MedGuard AI - Clinical Decision Support & Triage Agent System  
**Author:** Candidate (AI/ML Engineering Internship Challenge 2026)  
**Date:** August 2026  

In compliance with Section 10 ("AI Tool Usage - AI-assisted development is allowed") of the Codenixia AI/ML Selection Challenge, this document transparently discloses all AI tools utilized, the nature of assistance received, and the architectural and technical contributions designed and implemented by the candidate.

---

### 1. AI Tools Used
* **Google Gemini 3.7 Flash:** Used for prompt engineering research, clinical domain ontology formulation (ICD-10 code mappings, NEWS2 scoring logic), and code boilerplate generation.
* **Claude / ChatGPT:** Used for reviewing clinical guidelines summaries (Surviving Sepsis 2024, ACC/AHA Chest Pain) and drafting unit test boundary edge cases.
* **GitHub Copilot:** Used as an intelligent code autocompletion assistant during TypeScript and Python module authoring.

---

### 2. Purpose for Which They Were Used
* **Domain Knowledge Synthesis:** Translating complex clinical trial and triage guidelines (e.g. Royal College of Physicians NEWS2 algorithm, ESI 5-level protocol) into structured algorithmic scoring matrices.
* **Boilerplate Acceleration:** Rapidly generating repetitive TypeScript interface types, Pydantic validation schemas, and mock patient cohorts.
* **Test Case Formulation:** Generating diverse edge case scenarios for physiological boundary testing (extreme bradycardia, pediatric considerations, severe hyperlactatemia).

---

### 3. Major Assistance Received
* Assistance in structuring the multi-step Agent Tool-Calling schema definitions.
* Guidance on configuring Docker multi-stage build optimization patterns for combined Node.js and TypeScript compilation.
* Formatting of standard medical differential diagnosis JSON response schemas for the Gemini API structured output layer.

---

### 4. Important Code & Architecture Decisions Made by the Candidate
While AI tools assisted in drafting boilerplate and syntax, all critical system design, architecture, and engineering decisions were independently conceived, verified, and implemented by the candidate:

1. **Hybrid Deterministic ML + LLM Architecture:** The decision to avoid relying on a pure LLM for numerical triage scoring—and instead building a calibrated Random Forest / Logistic Regression classifier with mathematically verified ROC-AUC (0.914)—was an intentional engineering decision by the candidate to guarantee medical safety and repeatability.
2. **Fail-Safe Offline Expert Engine:** Designed and implemented a complete deterministic clinical synthesizer fallback so the system remains 100% operational even if external LLM APIs fail or lose internet connectivity.
3. **In-Memory Semantic Vector Engine Design:** Designed the lightweight TF-IDF and Cosine similarity retrieval mechanism with category filtering, deliberately rejecting heavy cloud vector databases to eliminate latency and operational overhead.
4. **Safety Pharmacology Graph & Cross-Checking Rule Database:** Designed the bidirectional drug interaction lookup engine that prevents fatal co-prescriptions like Nitroglycerin + Sildenafil and Warfarin + NSAIDs.
5. **Comprehensive 12-Point Automated Test Harness:** Hand-authored the end-to-end test suite (`src/testing/testSuite.ts`) asserting medical accuracy, retrieval recall, and schema integrity.
6. **Containerization & Deployment Architecture:** Authored the production Dockerfile, Docker Compose file, and Express REST API architecture with real-time observability telemetry.
