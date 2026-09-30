# 🇮🇳 Bharat Ballot — Voter Portal

The **Bharat Ballot Voter Portal** is the voter-facing web application of the Bharat Ballot digital election management system.

It provides eligible voters with a secure interface through which they can authenticate themselves, complete identity verification, view available elections, cast their vote, and receive confirmation of successful voting.

---

## 📌 Overview

The Voter Portal is designed around a simple principle:

> **One eligible voter should be able to securely cast their vote in an authorized election while preventing unauthorized or duplicate voting.**

The portal handles the voter-facing portion of the election workflow.

---

## ✨ Features

### 🔐 Voter Authentication

The portal provides a secure login mechanism for registered voters.

The authentication process verifies the voter's credentials before granting access to protected voter functionality.

---

### 🗳️ Election Selection

After authentication, voters can view elections available to them.

The available elections depend on the election configuration and the voter's eligibility/constituency information.

Example:

```text
Voter Login
     │
     ▼
Available Elections
     │
     ├── Lok Sabha Election
     ├── Assembly Election
     └── Municipal Election
```

---

### 👤 Face Verification

Bharat Ballot incorporates facial verification as an additional identity-verification layer.

The conceptual flow is:

```text
Voter Login
     │
     ▼
Identity Verification
     │
     ▼
Face Capture
     │
     ▼
Face Embedding
     │
     ▼
Compare With Registered Face
     │
     ├── Match ─────► Continue
     │
     └── No Match ──► Reject
```

The face verification service generates a face embedding and compares it with the registered voter embedding.

---

### 🗳️ Vote Casting

Once the voter passes authentication and verification, the voter can view eligible candidates.

Typical flow:

```text
Select Election
      │
      ▼
Verify Identity
      │
      ▼
View Candidates
      │
      ▼
Select Candidate
      │
      ▼
Confirm Vote
      │
      ▼
Vote Recorded
```

---

### 🔒 Duplicate Voting Prevention

The system maintains the voting status of the voter.

Conceptually:

```text
NOT VOTED
    │
    │ Cast Vote
    ▼
  VOTED
```

A voter who has already voted for the applicable election should not be allowed to cast another vote for that election.

---

### ✅ Vote Confirmation

After successful vote submission, the portal provides confirmation to the voter.

The voter can then see that the voting operation has been successfully completed.

---

## 🏗️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* React Router
* Context API
* Axios
* CSS

### Backend

The Voter Portal communicates with the Bharat Ballot backend.

Backend technologies include:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT/session-based authentication
* Python ASGI face-verification service

---

## 📁 Project Structure

A simplified structure:

```text
voterClient/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── context/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
├── vite.config.js
└── README.md
```

> The exact structure may change as the project evolves.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Voter Portal

```bash
cd Bharat-Ballot/voterClient
```

### 3. Install dependencies

```bash
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If the face-verification service is accessed directly by the frontend, configure the corresponding service URL according to the project's implementation.

Example:

```env
VITE_FACE_API_URL=http://localhost:8000
```

Do not commit sensitive credentials to Git.

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Vite will provide a local address similar to:

```text
http://localhost:5173
```

---

## 🔑 Voter Authentication Flow

```text
                    ┌──────────────┐
                    │    Voter     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Login     │
                    └──────┬───────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Backend Validation│
                 └─────────┬─────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                  Invalid        Valid
                    │             │
                    ▼             ▼
                  Error       Dashboard
```

---

## 👤 Face Verification Architecture

The face verification component uses a separate Python service.

A simplified architecture:

```text
                 Voter Portal
                      │
                      ▼
               Capture Face
                      │
                      ▼
              Python API Service
                      │
                      ▼
             Generate Embedding
                      │
                      ▼
             Compare Embeddings
                      │
                ┌─────┴─────┐
                │           │
              Match      No Match
                │           │
                ▼           ▼
          Continue        Reject
```

The embedding generated by the face-verification service can be represented as a numerical vector.

Example response:

```json
{
  "success": true,
  "embeddingLength": 512
}
```

---

## 🗳️ Voting Workflow

The complete voter-side workflow can be represented as:

```text
┌───────────────┐
│ Voter Login   │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│ Select Election   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Face Verification │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Candidate List    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Select Candidate  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Confirm Vote      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Vote Recorded     │
└───────────────────┘
```

---

## 🔒 Voting Security

The Voter Portal is designed to work with backend controls that enforce:

* Voter authentication
* Election eligibility
* Constituency validation
* Face verification
* Duplicate-voting prevention
* Protected API endpoints
* Server-side validation

The frontend should not be treated as the final security boundary.

---

## 🌐 Backend Communication

The frontend communicates with the backend using REST APIs.

Example:

```javascript
axios.get(`${API_URL}/elections`);
```

Voting-related operations are sent to protected backend endpoints.

The backend is responsible for validating:

```text
Voter
   +
Election
   +
Eligibility
   +
Voting Status
   +
Candidate
   ↓
Valid Vote
```

---

## 🚀 Production Build

Create the production build:

```bash
npm run build
```

Preview it locally:

```bash
npm run preview
```

The production files will be generated inside:

```text
dist/
```

---

## ☁️ Deployment

The Voter Portal can be deployed using:

* Netlify
* Vercel
* Cloudflare Pages
* Other static hosting services

Configure the production API:

```env
VITE_API_BASE_URL=<production-backend-url>
```

If applicable:

```env
VITE_FACE_API_URL=<production-face-service-url>
```

---

## 🧪 Testing Checklist

Before deployment, verify:

* [ ] Voter login works
* [ ] Invalid credentials are rejected
* [ ] Available elections load correctly
* [ ] Election selection works
* [ ] Face verification works
* [ ] Invalid face verification is rejected
* [ ] Candidate list loads correctly
* [ ] Vote confirmation works
* [ ] Duplicate voting is prevented
* [ ] Logout works
* [ ] Protected routes cannot be accessed without authentication
* [ ] Production API URLs are configured correctly

---

## 📌 Important Notes

* Voter credentials must never be hard-coded into the frontend.
* Sensitive authentication information should not be stored insecurely.
* Vote validation must be performed by the backend.
* The frontend must not be trusted to enforce election rules.
* Face verification is an additional identity-verification mechanism and should be implemented with appropriate security and privacy controls.
* Environment files containing secrets should not be committed to Git.

---

## 👨‍💻 Project

**Project:** Bharat Ballot
**Module:** Voter Portal
**Type:** Full-Stack Digital Election Management System

---
