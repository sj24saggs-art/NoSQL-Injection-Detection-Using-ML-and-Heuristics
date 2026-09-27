# 🛡️ NoSQL Injection Detection Using ML and Heuristics

This repository contains a dual-mode security research pipeline engineered to demonstrate **NoSQL injection vulnerabilities** alongside an intelligent defense architecture utilizing **heuristic pattern validation** and **Machine Learning classification**. 

Developed during a 2-month summer research internship within the **ISFCR (PESU Centre for Information Security, Forensics, and Cyber Resilience)** department at **PES University**, Bengaluru.

---

## 🏆 Project Credentials & Research Artifacts
This project was executed as a collaborative comparative study alongside a teammate. While the global scope evaluated both relational and document-based exploits, **this repository isolates and hosts my complete specialized contribution: the entire NoSQL Injection, Mitigation, and ML Analytics pipeline**.

* 📜 **Credential Verification:** [View my Official ISFCR Internship Certificate](./docs/Internship_Certificate.jpg)
* 📊 **Project Presentation:** [Download Project Presentation Slides](./docs/Project_Presentation.pdf)
* 📋 **Academic Thesis Documentation:** [Read the Comparative Research Report](./docs/Research_Report.pdf)
* 📄 **Working Manuscript:** [View the Draft Research Paper](./docs/Research_Paper_Draft.pdf)

---

## 📂 Repository Directory Layout

```text
NoSQL-Injection-Detection-Using-ML-and-Heuristics/
│
├── 📁 docs/                    # Institutional Verification Artifacts
│   ├── Internship_Certificate.jpg
│   ├── Project_Presentation.pdf
│   ├── Research_Report.pdf
│   └── Research_Paper_Draft.pdf
│
├── 🔴 Vulnerable-NoSQL/        # Insecure Baseline Simulator
│   ├── public/                  # Front-end injection control panels
│   ├── server/                  # Direct Mongo query mapping logic
│   └── package.json             # App manifest
│
└── 🟢 Secured-NoSQL/           # Hardened Defense Engine
    ├── public/                  # Protected transaction interfaces
    ├── server/
    │   ├── detection/           # Node API to Python ML pipeline bridge
    │   │   ├── ml.js
    │   │   └── ml_server_nosql.py
    │   ├── ml/                  # Serialized Scikit-Learn weights workspace
    │   │   ├── nosqli_model.pkl
    │   │   ├── nosqli_vectorizer.pkl
    │   │   └── nosqli_train_model.py
    │   └── server.js            # Hardened validation middleware router
    └── package.json
```

---

## ⚙️ Core Architecture & Defensive Layers

### 🔴 1. Vulnerable-NoSQL (The Baseline Simulator)
Demonstrates the raw impact of processing un-sanitized user strings directly into MongoDB queries. Attackers can easily utilize query parameter operators (`$ne`, `$or`) to trigger blind authentication bypasses, expose student rosters, or modify database models without role validation checking.

### 🟢 2. Secured-NoSQL (The Defense Engine)
Fuses multiple defensive layers to isolate and intercept structural document exploits before database execution:
* **Heuristic Filter Trap:** Regex scanners cross-check input properties against a signature array of malicious MongoDB operators (`$ne`, `$gt`, `$regex`, `$where`).
* **Machine Learning Classification:** Search variables are routed to a standalone **Flask microservice**. Inputs are tokenized via **TF-IDF Vectorization** and parsed by a **Logistic Regression** classifier to catch advanced obfuscated strings.
* **Role-Based Access Control (RBAC):** Strict data mutation filters enforce fail-closed behavior, ensuring administrative functions (Add, Update, Delete) reject unauthorized student privileges.

---

## 📈 System Execution Sequence

```text
  User Input
      ↓
  [Detection Layer]
      ├── Heuristic Signature Match
      └── TF-IDF + Logistic Regression ML Classifier
      ↓
  Safe? ─── No ───→ [Block Request & Log Incident to logs.txt]
      │
     Yes
      ↓
  Role-Based Access Evaluation (RBAC Enforcement)
      ↓
  Safe Query Construction ──→ [MongoDB Execution]
```

---

## 🚀 Local Installation & Run Guide

### 1. Database Setup
Launch an isolated MongoDB instance via Docker containerization:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:8.0
```

### 2. Launching the Vulnerable Simulator
```bash
cd Vulnerable-NoSQL
npm install && node server/seed.js
node server/server.js
# UI instances stream live on http://localhost:3000
```

### 3. Launching the Secured Defense Engine
```bash
cd Secured-NoSQL
npm install && node server/seed.js

# Initialize Python ML Classification Microservice
pip3 install flask joblib scikit-learn pandas numpy
python3 server/detection/ml_server_nosql.py   # Active on port 5001

# Start Application routing engine (In separate terminal window)
node server/server.js                         # Active on port 3000
```

---

## 🔬 Attack Test Matrix Verification

| Vector Target | Test Payload Example | 🔴 Vulnerable Reaction | 🟢 Secured Reaction |
| :--- | :--- | :--- | :--- |
| **Auth Bypass via Negation** | `{$ne: null}` | Exposes full dataset records [1] | Intercepted & Blocked [1] |
| **Logical Disjunction** | `{$or:[{}]}` | Circumvents logical parameters [1] | Intercepted & Blocked [1] |
| **Privilege Escalation** | Student Account Update | Mutates foreign rows [1] | Rejected: `403 Unauthorized` [1] |

---

## 📌 Verified Competencies
* **Application Security (AppSec):** NoSQL/Object Injection mitigation, validation parameters, data escaping.
* **Threat Classification Pipeline:** TF-IDF text preprocessing vectorization, Logistic Regression deployment, pickle model serialization.
* **Backend Security Design:** Microservice orchestration (Node.js/Flask communication loops), RBAC matrix filters.
