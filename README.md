# Dynamic Sentence Builder — Full-Stack Application

The application allows users to interactively construct grammatical sentences by picking words categorized by their grammatical parts of speech, persist them to a PostgreSQL database, inspect saved sentences, and reload them into an interactive canvas for editing.

---

## 🌟 Highlights & Architecture

- **Frontend:** **Angular 18+** with **Standalone Components**, modern reactive state via **Angular Signals** (`signal`, `computed`), `provideHttpClient(withFetch())`, and responsive mobile-first UI with CSS animations.
- **Backend API:** **Node.js with Express.js**, modular multi-tier MVC architecture, parameterized SQL queries preventing SQL injection, CORS configuration, centralized error handling middleware, and request validation.
- **Database:** **PostgreSQL 16** with strict relational schema, cascading foreign keys, uniqueness constraints, index optimizations, and automated timestamp triggers (`updated_at`).
- **DevOps & Containerization:** Multi-stage **Dockerfiles** for both client and API, reverse proxy with **Nginx**, and full orchestration via **`docker-compose.yml`** with integrated service healthchecks.
- **Azure Cloud Ready:** Architecture and configuration tailored for Azure Container Apps / App Service and Azure Database for PostgreSQL.

---

## 📋 User Stories & Functional Mapping

| ID | User Story | Implementation Details |
|---|---|---|
| **US-01** | **Select a Word Type** | Interactive pill tabs representing all 9 grammatical types (Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, Determiner, Exclamation) with color coding. |
| **US-02** | **View Words by Type** | Responsive grid of interactive word buttons fetched from `GET /api/words/:typeId`. |
| **US-03** | **Build a Sentence** | Real-time sentence construction canvas with chips, token deletion, punctuation controls, and formatted preview. |
| **US-04** | **Save a Sentence** | Submits assembled sentence via `POST /api/sentences` and adds it to the database. |
| **US-05** | **Edit a Saved Sentence** | Loads existing sentence into the canvas, switches into Edit Mode, and updates via `PUT /api/sentences/:id`. |
| **US-06** | **View Saved Sentences** | Sidebar list fetching persisted sentences via `GET /api/sentences`, with search filter and quick edit/delete actions. |

---

## 📂 Project Structure

```
Assessment/
├── database/
│   └── init.sql                 # DDL schema & seed data (9 types + realistic vocabulary)
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # PostgreSQL connection pool with SSL & retry support
│   │   ├── controllers/
│   │   │   ├── wordTypeController.js   # GET /api/word-types
│   │   │   ├── wordController.js       # GET /api/words/:typeId
│   │   │   └── sentenceController.js   # CRUD operations for sentences
│   │   ├── middleware/
│   │   │   ├── errorHandler.js         # Centralized error & 404 handling
│   │   │   └── validateSentence.js     # Body validation & ID sanity checks
│   │   ├── routes/
│   │   │   ├── wordTypeRoutes.js
│   │   │   ├── wordRoutes.js
│   │   │   └── sentenceRoutes.js
│   │   ├── app.js               # Express application config (CORS, Morgan, JSON)
│   │   └── server.js            # HTTP server entrypoint & graceful shutdown
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile               # Node 20 Alpine production image
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/             # TypeScript interfaces (WordType, Word, Sentence)
│   │   │   │   └── services/           # SentenceService powered by Angular Signals
│   │   │   ├── components/
│   │   │   │   ├── word-selector/      # US-01 & US-02: Grammar types & vocabulary
│   │   │   │   ├── sentence-builder/   # US-03, US-04, US-05: Canvas & Save/Update
│   │   │   │   └── saved-sentences/    # US-06: Saved sentences list & edit trigger
│   │   │   ├── app.component.*         # Application shell, layout & notifications
│   │   │   └── app.config.ts           # Standalone bootstrap configuration
│   │   ├── styles.css                  # Global styling reset & font configuration
│   │   └── index.html
│   ├── nginx.conf                      # Production Nginx reverse proxy (/api/ -> backend)
│   ├── angular.json
│   ├── Dockerfile                      # Multi-stage build (Node 20 build -> Nginx Alpine)
│   └── package.json
├── docker-compose.yml           # Multi-container orchestration (DB, API, Frontend)
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Recommended: Docker Compose)

The easiest way to run the entire stack with zero external dependencies installed:

```bash
# 1. Clone repository and navigate to root
cd Assessment

# 2. Build and run database, backend, and frontend
docker compose up --build
```

Once started:
- **Frontend Application:** [http://localhost:4200](http://localhost:4200)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL Database:** `localhost:5432` (`sentence_builder` / user: `postgres` / pass: `postgres`)

---

## 🛠️ Manual Local Development (Without Docker)

### 1. Database Setup (PostgreSQL)
Ensure you have PostgreSQL installed locally:
```bash
# In psql or pgAdmin:
CREATE DATABASE sentence_builder;

# Run the initialization script:
psql -U postgres -d sentence_builder -f database/init.sql
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Angular development server
npm start
# Client runs on http://localhost:4200
```

---

## 📡 REST API Reference

### 1. Word Types
- **`GET /api/word-types`**
  - **Description:** Returns all 9 grammatical types.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "count": 9,
      "data": [
        { "id": 1, "name": "Noun", "code": "noun", "color_code": "#3b82f6" },
        { "id": 2, "name": "Verb", "code": "verb", "color_code": "#10b981" },
        ...
      ]
    }
    ```

### 2. Words
- **`GET /api/words/:typeId`**
  - **Description:** Returns all seed words for a specific grammatical type ID.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "wordType": { "id": 1, "name": "Noun", "code": "noun", "color_code": "#3b82f6" },
      "count": 15,
      "data": [
        { "id": 1, "word_type_id": 1, "text": "algorithm" },
        { "id": 2, "word_type_id": 1, "text": "cat" }
      ]
    }
    ```

### 3. Sentences
- **`GET /api/sentences`**
  - **Description:** Returns all saved sentences ordered by `updated_at DESC`.
  - **Response `200 OK`:**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "id": 1,
          "text": "The agile engineer quickly builds an innovative algorithm .",
          "created_at": "2026-09-26T13:00:00.000Z",
          "updated_at": "2026-09-26T13:00:00.000Z"
        }
      ]
    }
    ```

- **`GET /api/sentences/:id`**
  - **Description:** Retrieve details for a single saved sentence.

- **`POST /api/sentences`**
  - **Description:** Persists a newly constructed sentence.
  - **Request Body:**
    ```json
    {
      "text": "The brilliant developer creates resilient architecture ."
    }
    ```
  - **Response `201 Created`:**
    ```json
    {
      "success": true,
      "message": "Sentence created successfully.",
      "data": {
        "id": 3,
        "text": "The brilliant developer creates resilient architecture .",
        "created_at": "...",
        "updated_at": "..."
      }
    }
    ```

- **`PUT /api/sentences/:id`**
  - **Description:** Updates an existing sentence by ID.
  - **Request Body:**
    ```json
    {
      "text": "The brilliant engineer creates resilient architecture gracefully ."
    }
    ```
  - **Response `200 OK`**

- **`DELETE /api/sentences/:id`** (Bonus)
  - **Description:** Deletes a saved sentence by ID.

---

## ☁️ Microsoft Azure Deployment Guide (Bonus Requirement)

To deploy this solution to Microsoft Azure, follow this recommended production architecture:

### Architecture Options
1. **Azure Container Apps (Serverless Containers - Recommended):**
   - Push backend and frontend images to **Azure Container Registry (ACR)**.
   - Run backend and frontend as Container Apps with ingress enabled.
2. **Azure App Service (Linux Web App for Containers):**
   - Frontend and Backend deployed as containerized App Services.
3. **Database:**
   - **Azure Database for PostgreSQL Flexible Server**.

### Deployment Steps using Azure CLI:

```bash
# 1. Login to Azure
az login

# 2. Create Resource Group
az group create --name rg-sentence-builder --location westeurope

# 3. Provision Azure Database for PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group rg-sentence-builder \
  --name ps-sentence-builder-db \
  --location westeurope \
  --admin-user dbadmin \
  --admin-password "SecurePass123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# Configure firewall rule to allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group rg-sentence-builder \
  --name ps-sentence-builder-db \
  --rule-name AllowAzureIPs \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# 4. Initialize Database Schema & Seed Data
psql "host=ps-sentence-builder-db.postgres.database.azure.com port=5432 dbname=postgres user=dbadmin password=SecurePass123! sslmode=require" -f database/init.sql

# 5. Create Azure Container Registry (ACR)
az acr create --resource-group rg-sentence-builder --name acrsentencebuilder --sku Basic --admin-enabled true

# 6. Build and push container images to ACR
az acr build --registry acrsentencebuilder --image sentence-api:latest ./backend
az acr build --registry acrsentencebuilder --image sentence-web:latest ./frontend

# 7. Deploy via Azure Container Apps
az containerapp env create --name env-sentence-builder --resource-group rg-sentence-builder --location westeurope

# Deploy Backend Container App
az containerapp create \
  --name api-sentence-builder \
  --resource-group rg-sentence-builder \
  --environment env-sentence-builder \
  --image acrsentencebuilder.azurecr.io/sentence-api:latest \
  --target-port 5000 \
  --ingress external \
  --env-vars \
    DATABASE_URL="postgres://dbadmin:SecurePass123!@ps-sentence-builder-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
    NODE_ENV="production"

# Deploy Frontend Container App
az containerapp create \
  --name web-sentence-builder \
  --resource-group rg-sentence-builder \
  --environment env-sentence-builder \
  --image acrsentencebuilder.azurecr.io/sentence-web:latest \
  --target-port 80 \
  --ingress external
```

---

