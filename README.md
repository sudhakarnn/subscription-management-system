# subscription-management-system
Subscription Management System – Virtual Hackathon

---

# Brightloop — SaaS Subscription & Billing Platform

Brightloop is a premium subscription and billing management SaaS platform built for high-throughput, multi-tier recurring revenue operations.

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Frontend** | React + TypeScript + Vite | React 18, Strict TypeScript, Vite 6 |
| **Styling & Design** | Tailwind CSS | **Brightloop Stitch** (Dark Navy `#0F172A`, Light Canvas `#F8FAFC`, Royal Blue `#2563EB`) |
| **Routing & Client** | React Router + Axios | React Router v6, Axios with JWT interceptors |
| **Backend** | Python + FastAPI | Python 3.11/3.12/3.14 compatible, Pydantic v2 |
| **ORM & Database** | Synchronous SQLAlchemy 2.0 | PostgreSQL 16 via `psycopg2-binary`, exact `NUMERIC(14, 2)` monetary arithmetic |
| **Containerization** | Docker & Docker Compose | Isolated PostgreSQL 16 container on port 5432 |
| **Default Currency** | Indian Rupee (`INR` / `₹`) | Configurable via environment variables |

---

## 📁 Repository Structure

```text
subscription-management-system/
├── docker/
│   └── docker-compose.yml          # PostgreSQL 16 service
├── backend/
│   ├── app/
│   │   ├── core/                   # Config, Database, Security, Exceptions
│   │   ├── common/                 # Decimal utilities, Response envelopes
│   │   ├── api/                    # /api/health and /api/v1 route aggregators
│   │   └── modules/                # 11 isolated business vertical slices
│   │       ├── auth/
│   │       ├── customers/          # DEV 1
│   │       ├── products/           # DEV 2
│   │       ├── plans/              # DEV 2
│   │       ├── quotations/         # DEV 3
│   │       ├── subscriptions/      # DEV 2
│   │       ├── invoices/           # DEV 3
│   │       ├── taxes/              # DEV 3
│   │       ├── discounts/          # DEV 3
│   │       ├── payments/           # DEV 4
│   │       └── analytics/          # DEV 4
│   ├── requirements.txt            # Backend dependencies
│   ├── .env.example
│   └── main.py                     # App factory
├── frontend/
│   ├── src/
│   │   ├── api/                    # Axios HTTP client & health probes
│   │   ├── components/             # Stitch UI primitives
│   │   ├── layouts/                # DashboardLayout (navy sidebar, light workspace)
│   │   ├── routes/                 # AppRoutes & ProtectedRoute guards
│   │   └── features/               # Feature modules matching backend
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── .gitignore
├── .env.example                    # Root environment template
└── README.md
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- **Python** (3.11+ / 3.12+ / 3.14+)
- **Docker Desktop** (for local PostgreSQL database)

---

### Step 1: Start PostgreSQL Database

From the project root:
```bash
docker compose up -d
```
*This starts a local PostgreSQL 16 database at `localhost:5432` with database `brightloop_db`.*

---

### Step 2: Backend Setup (FastAPI)

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   # Windows:
   copy .env.example .env

   # Linux / macOS:
   cp .env.example .env
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
- **Service Root:** [http://localhost:8000](http://localhost:8000)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Interactive Swagger Docs:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

---

### Step 3: Frontend Setup (React + Vite)

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   # Windows:
   copy .env.example .env

   # Linux / macOS:
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)

---

## 👥 Remote Team Collaboration Protocol (Single `main` Branch)

All 4 developers collaborate on **one shared `main` branch**. To avoid code overwrites and merge friction:

### 1. Developer Module Ownership
| Developer | Backend Ownership | Frontend Ownership |
| :--- | :--- | :--- |
| **DEV 1** | `app/core/`, `app/modules/auth`, `app/modules/customers` | Auth, Password Reset, Staff Modals, Customer Management |
| **DEV 2** | `app/modules/products`, `app/modules/plans`, `app/modules/subscriptions` | Product/Variant Manager, Plan Builder, Multi-item Subscriptions |
| **DEV 3** | `app/modules/quotations`, `app/modules/invoices`, `app/modules/taxes`, `app/modules/discounts` | Quotation Templates & Builder, Invoices & PDF Print, Tax & Discount Managers |
| **DEV 4** | `app/modules/payments`, `app/modules/analytics` | Payment Settlement Modal, Payment History, Recharts Dashboard, Customer Portal |

### 2. Git Synchronization Rules
- **Always rebase before pushing:**
  ```bash
  git pull --rebase origin main
  git push origin main
  ```
- **No force pushes:** `git push --force` is strictly forbidden.
- **Never commit `.env` files or secrets:** All `.env` files are ignored by git.
- **Modular Isolation:** Do not edit files inside another developer's module without prior coordination.
