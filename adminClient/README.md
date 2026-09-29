# 🇮🇳 Bharat Ballot — Admin Portal

The **Bharat Ballot Admin Portal** is the administrative interface of the Bharat Ballot digital election management system. It allows authorized election administrators to configure and manage elections, constituencies, candidates, voters, and election-related operations through a secure web interface.

> **Bharat Ballot** is designed as a full-stack digital election management platform with separate interfaces for administrators and voters.

---

## 📌 Overview

The Admin Portal provides authorized administrators with tools to manage the election lifecycle.

Depending on the administrator's assigned role and constituency, the portal provides access to relevant election-management operations.

### Main responsibilities

* Administrator authentication
* Election management
* Constituency management
* Candidate management
* Voter management
* Election participation management
* Election monitoring
* Constituency-specific result viewing
* Election reset/management operations
* Secure administrative controls

---

## ✨ Features

### 🔐 Authentication

* Secure administrator login
* JWT/session-based authentication
* Protected routes
* Role-based access
* Automatic authentication state handling

### 🗳️ Election Management

Administrators can work with elections configured by the election authority.

Examples include:

* Lok Sabha elections
* Assembly elections
* Municipal elections
* Panchayat elections
* Other configured election types

Election configuration determines the geographical and administrative fields required for each election.

---

### 👥 Voter Management

The portal provides functionality for managing voters associated with an election/constituency.

Typical operations include:

* View voters
* Search voters
* Manage voter information
* Assign constituency information
* Monitor voting status

Voters are treated as permanent records and are not necessarily deleted when an individual election is reset.

---

### 👤 Candidate Management

Administrators can manage candidates participating in an election.

Operations include:

* Add candidates
* View candidates
* Update candidate information
* Remove candidates
* Associate candidates with the appropriate election and constituency

---

### 🏛️ Constituency Management

The system supports hierarchical constituency information such as:

* Lok Sabha constituencies
* Assembly constituencies
* Municipal constituencies
* Other election-specific constituencies

The administrator can work with the constituency assigned to their election responsibilities.

---

### 📊 Election Results

The Admin Portal provides access to election results according to the administrator's authorization.

For example:

```text
Administrator
     │
     ▼
Assigned Election
     │
     ▼
Assigned Constituency
     │
     ▼
Candidate Results
     │
     ▼
Vote Counts
```

Administrators should only have access to results permitted by their assigned scope.

---

### 🔄 Election Reset

The system supports election-specific reset functionality.

When an election is reset, election-specific records can be removed/reset while permanent voter records are retained.

Conceptually:

```text
Election Reset
      │
      ├── Reset voter voting status
      │
      ├── Remove election admins
      │
      ├── Remove candidates
      │
      ├── Remove participation records
      │
      └── Keep permanent voter records
```

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

The Admin Portal communicates with the Bharat Ballot backend through REST APIs.

Typical backend technologies:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cloudinary where applicable

---

## 📁 Project Structure

A simplified structure of the Admin Portal:

```text
adminClient/
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

> The exact structure may vary depending on the current implementation.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Admin Portal

```bash
cd Bharat-Ballot/adminClient
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace the API URL with the URL of the deployed backend when required.

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL similar to:

```text
http://localhost:5173
```

Open the URL in your browser.

---

## 🔑 Authentication Flow

The basic authentication flow is:

```text
Admin
  │
  ▼
Login Page
  │
  ▼
Credentials Submitted
  │
  ▼
Backend Authentication
  │
  ├── Invalid ──► Error
  │
  └── Valid
        │
        ▼
Authentication Token
        │
        ▼
Admin Dashboard
```

Protected routes prevent unauthorized users from accessing administrative pages.

---

## 🔄 Election Workflow

A typical administrative workflow is:

```text
Login
  │
  ▼
Select Election
  │
  ▼
Configure / Manage Election
  │
  ├── Constituencies
  ├── Candidates
  └── Voters
  │
  ▼
Monitor Election
  │
  ▼
View Authorized Results
```

---

## 🌐 API Communication

The frontend communicates with the backend using HTTP requests.

Example:

```javascript
axios.get(`${API_URL}/elections`);
```

The API base URL should be configured through the Vite environment variable.

---

## 🛡️ Security Considerations

The Admin Portal is intended for authorized personnel.

Important security considerations include:

* Protected administrative routes
* Authentication tokens
* Role-based authorization
* Backend-side authorization
* Constituency-level access restrictions
* Server-side validation
* Secure password handling
* Controlled access to election results

> Frontend restrictions alone should never be considered sufficient for authorization. Sensitive authorization decisions must be enforced by the backend.

---

## 🚀 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated production files are placed in:

```text
dist/
```

---

## ☁️ Deployment

The Admin Portal can be deployed on platforms such as:

* Netlify
* Vercel
* Cloudflare Pages
* Other static hosting platforms

When deploying, configure:

```env
VITE_API_BASE_URL=<production-backend-url>
```

---

## 🧪 Development

Recommended development workflow:

```text
Frontend
   │
   ▼
React Components
   │
   ▼
API Requests
   │
   ▼
Node.js / Express Backend
   │
   ▼
MongoDB
```

---

## 📌 Important Notes

* The Admin Portal should only be accessed by authorized users.
* Election-specific operations must be validated by the backend.
* Administrators should only access the election/constituency permitted by their role.
* Environment variables containing sensitive information should not be committed to Git.
* Never expose private backend credentials in the frontend.

---

## 👨‍💻 Project

**Project:** Bharat Ballot
**Module:** Admin Portal
**Type:** Full-Stack Digital Election Management System

---

## 📄 License

This project is developed for educational and project/research purposes.

See the repository's `LICENSE` file for licensing information.
