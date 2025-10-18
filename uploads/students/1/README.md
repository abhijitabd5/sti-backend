# End-to-End RAG System with Document & SQL Integration

## 📌 Project Overview

An end-to-end Retrieval-Augmented Generation (RAG) system using open-source stack.  
It can answer natural language questions using information from **documents** and **SQL databases**.  
Built with local model serving via **Ollama** and **LangChain orchestration**.

---

## 🎯 Objective

- Accept user-uploaded documents (PDF, DOCX, TXT, Images etc.)  
- Connect to a structured SQL database  
- Retrieve context from **documents** or **SQL tables**  
- Generate natural language answers with sources  
- Provide **FastAPI backend** and **Streamlit frontend**  
- Use **local, open-source models** for embeddings and generation  

---

## 🧱 Technology Stack

| Component         | Tool / Library |
|-------------------|----------------|
| Embedding Model   | all-mpnet-base-v2 (Sentence Transformers) |
| Vector Store      | Qdrant |
| Orchestration     | LangChain |
| LLM (Generator)   | Phi-3.5-mini-instruct Q4 (via Ollama) |
| Document Parsing  | Unstructured.io |
| SQL Database      | PostgreSQL |
| Frontend          | Streamlit |
| API Layer         | FastAPI |

---

## 🧩 Functional Requirements

### Document Ingestion
- Accept `.pdf`, `.docx`, `.txt`, `.png`, `.jpg`, `.jpeg` 
- Parse & chunk with **unstructured.io**  
- Store metadata + embeddings in **Qdrant**  

### SQL Database Integration
- Connect to PostgreSQL or SQLite  
- Auto-extract schema and sample rows  
- Natural language → SQL query synthesis  
- Optionally embed table rows for retrieval  

### Query Handling
- Accept NL question  
- Search in **docs** (default) or **db** (parameter-controlled)  
- Aggregate relevant context  
- Generate final answer using **Phi-3.5-mini-instruct Q4** (Ollama)  

### Answer Generation
- Context + Question → LLM prompt  
- Cite sources (doc chunks or SQL results)  
- Configurable search target (`db`, `docs`, or both)  

---

## 📦 API Design Overview

| Method | Endpoint              | Description |
|--------|----------------------|-------------|
| GET    | `/health`            | Basic API health check |
| POST   | `/upload-document`   | Upload file for ingestion |
| GET    | `/collections`       | List all Qdrant collections |
| GET    | `/documents`         | List ingested documents |
| DELETE | `/document/{doc_id}` | Delete document + embeddings |
| DELETE | `/collection/{name}` | Drop an entire Qdrant collection |
| POST   | `/connect-db`        | Connect to SQL DB |
| GET    | `/db-schema`         | Fetch current DB schema |
| GET    | `/db-tables`         | List DB tables and columns |
| POST   | `/test-db`           | Run trivial query (SELECT 1) |
| DELETE | `/disconnect-db`     | Disconnect DB |
| POST   | `/query-db`          | Natural language → SQL query |
| POST   | `/ask`               | Query system (docs default, db optional) |
| POST   | `/ask-debug`         | Query with trace (docs/db sources, SQL, chunks) |
| POST   | `/embed-text`        | Embed raw text and return vector |
| POST   | `/generate`          | Direct Ollama text generation (debug) |
| POST   | `/retrieval-only`    | Run retrieval only (no generation) |
| GET    | `/logs/{limit}`      | Fetch last N logs |

---

## 🌐 Frontend (Streamlit App)

- Document upload page  
- Database connector page  
- Ask questions (chat-like interface)  
- Show generated answer + sources  
- Debug view (retrieved docs, SQL, prompt)  

✅ All folders and empty files are pre-created.  

---

## ⚡ Instructions

- Use **4-bit quantized Phi-3.5-mini-instruct** model with Ollama  
- Stick strictly to the above API endpoints (no extras)  
- Implement `/ask` and `/query-db` so they accept a parameter defining **where to search** (`docs` default, or `db`)  
- Write code **without function comments** (only inline comments where necessary)  
- Run with `docker-compose up` after setting up Ollama locally  

---

# Folder Structure 

```plaintext
rag-system/
├── README.md                # Project documentation
├── requirements.txt         # Python dependencies
├── pyproject.toml           # Project configuration for packaging
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile               # API Docker build file

├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── documents.py   # Document upload/management endpoints
│   │   │   ├── database.py    # SQL database endpoints
│   │   │   ├── query.py       # Ask/query endpoints
│   │   │   ├── collections.py # Qdrant collection management
│   │   │   ├── monitoring.py  # Logs (GET /logs/{limit})
│   │   │   └── health.py      # Health check endpoints
│   │   └── middleware.py      # Custom middleware
│   │
│   ├── core/                     # Core RAG Implementation
│   │   ├── __init__.py
│   │   ├── rag_engine.py         # Orchestrates RAG pipeline (docs + SQL)
│   │   ├── document_processor.py # Document ingestion using unstructured.io
│   │   ├── sql_processor.py      # SQL integration (schema + queries)
│   │   ├── embedding_service.py  # Embedding generation with mpnet
│   │   ├── vector_store.py       # Qdrant operations (store/search)
│   │   ├── llm_service.py        # Phi-3.5 LLM integration via Ollama
│   │   └── retrieval.py          # Retrieval logic & strategies
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py            # Pydantic models for API validation
│   │
│   ├── services/                 # Business Logic Layer
│   │   ├── __init__.py
│   │   ├── document_service.py   # Document lifecycle mgmt
│   │   ├── database_service.py   # SQL connection & operations
│   │   ├── query_service.py      # Query handling logic
│   │   └── storage_service.py    # File system & storage ops
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logging.py            # Logging configuration
│       ├── exceptions.py         # Custom exceptions
│       ├── validators.py         # Input validation utilities
│       └── helpers.py            # General utility functions
│
├── frontend/
│   ├── __init__.py
│   ├── streamlit_app.py          # Streamlit frontend entry point
│   ├── pages/
│   │   ├── Document_Upload.py    # Upload docs UI
│   │   ├── Database_Connector.py # DB connection UI
│   │   └── Chat_Page.py          # Chat interface
│   ├── components/
│   │   ├── __init__.py
│   │   ├── sidebar.py            # Sidebar components
│   │   ├── chat_interface.py     # Chat UI components
│   │   └── file_uploader.py      # File uploader components
│   └── utils/
│       ├── __init__.py
│       ├── session_state.py      # Streamlit session management
│       └── api_client.py         # API client for backend
│
├── tests/
│   └── sample-test.py            # Example test case
│
├── scripts/
│   ├── setup_environment.py      # Setup environment
│   ├── migrate_data.py           # Data migration utilities
│   ├── benchmark.py              # Performance benchmarking
│   └── deploy.py                 # Deployment scripts
│
├── data/
│   ├── uploads/                  # Temporary uploaded files
│   ├── processed/                # Processed document storage
│   └── embeddings/               # Cached embeddings
│
├── models/                       # Local model storage
│   └── .gitkeep
│
├── logs/                         # Log storage
│   └── .gitkeep
│
├── docs/                         # Project documentation
│
└── deployment/
    ├── docker/
    │   ├── api.Dockerfile        # API Dockerfile
    │   └── frontend.Dockerfile   # Frontend Dockerfile
```

## Root-level files and folders

Top-level files and folders:
- README.md
- requirements.txt
- pyproject.toml
- .env.example
- .gitignore
- docker-compose.yml
- Dockerfile
- app/
- frontend/
- tests/
- scripts/
- data/
- models/
- logs/
- docs/
- deployment/

---

## `README.md`
- Project documentation and usage instructions.

## `requirements.txt`
- Python dependencies required to run the backend and frontend.

## `pyproject.toml`
- Project metadata and packaging configuration.

## `.env.example`
- Example environment variables to copy into a `.env` file.

## `.gitignore`
- Files and patterns excluded from git.

## `docker-compose.yml`
- Docker Compose configuration for running services (API, Qdrant, etc).

## `Dockerfile`
- Dockerfile for building the backend API image.

---

## `app/` — backend package

Files directly in `app/`:
- `__init__.py` — Package initializer for the backend.
- `main.py` — FastAPI app entry point that registers routes and middleware.
- `config.py` — Centralized configuration settings and environment loading.

### `app/api/` — API layer

Files directly in `app/api/`:
- `__init__.py` — Package initializer for API layer.
- `dependencies.py` — FastAPI dependency providers (e.g., DB sessions, auth).
- `middleware.py` — Custom FastAPI middleware (request/response hooks).

`app/api/routes/` contains endpoint modules:
- `__init__.py` — Package initializer for route modules.
- `documents.py` — Document upload and management endpoints (`/upload-document`, `/documents`, `/document/{doc_id}`, `DELETE /document/{doc_id}`).
- `database.py` — SQL database endpoints (`/connect-db`, `/db-schema`, `/db-tables`, `/disconnect-db`, `/test-db`).
- `query.py` — Ask/query endpoints (`/ask`, `/ask-debug`, `/retrieval-only`, `/generate`, `/query-db`).
- `collections.py` — Qdrant collection management endpoints (`/collections`, `DELETE /collection/{name}`).
- `monitoring.py` — Logging and operational endpoints (`GET /logs/{limit}`).
- `health.py` — Health and readiness endpoints (`/health`).

### `app/core/` — Core RAG Implementation

Files in `app/core/` with the provided descriptive guidance shortened to one-liners:

- `__init__.py` — Package initializer for core RAG components.
- `rag_engine.py` — Main orchestrator coordinating the RAG pipeline and merging document and SQL retrieval with generation.
- `document_processor.py` — Parses PDF/DOCX/TXT with unstructured.io, chunks text, and prepares content for embedding.
- `sql_processor.py` — Handles SQL integration: schema extraction, NL→SQL synthesis, and safe query execution.
- `embedding_service.py` — Produces vector embeddings using `all-mpnet-base-v2` for documents and queries.
- `vector_store.py` — Encapsulates Qdrant operations: create collection, upsert vectors, and search.
- `llm_service.py` — Calls local Ollama Phi-3.5-mini-instruct (4-bit quantized) for generation and handles prompts/responses.
- `retrieval.py` — Implements retrieval strategies including semantic search, scoring, and multi-source result merging.

### `app/models/`

- `__init__.py` — Package initializer for models.
- `schemas.py` — Pydantic schemas for request/response validation.

### `app/services/` — Business Logic Layer

- `__init__.py` — Package initializer for services.
- `document_service.py` — Manages document lifecycle: uploads, metadata, processing status, and deletion.
- `database_service.py` — Manages DB connection lifecycle, schema introspection, and connection config storage.
- `query_service.py` — Orchestrates query processing, validation, response formatting, and debug trace collection.
- `storage_service.py` — Handles file-system operations for saving uploads, organizing temp files, and cleanup.

### `app/utils/`

- `__init__.py` — Package initializer for utils.
- `logging.py` — Logging configuration and log rotation helpers.
- `exceptions.py` — Custom exception types used across the backend.
- `validators.py` — Input validation helpers (e.g., safe SQL checks).
- `helpers.py` — Miscellaneous utility functions.

---

## `frontend/` — Streamlit frontend

Files directly in `frontend/`:
- `__init__.py` — Package initializer for frontend module.
- `streamlit_app.py` — Main Streamlit application entry for the multi-page UI.

`frontend/pages/` contains page modules:
- `Document_Upload.py` — Document upload page UI.
- `Database_Connector.py` — Database connection configuration UI.
- `Chat_Page.py` — Chat-style question/answer page.

`frontend/components/` contains reusable UI components:
- `__init__.py` — Package initializer for components.
- `sidebar.py` — Reusable sidebar UI components.
- `chat_interface.py` — Chat UI components for displaying messages and controls.
- `file_uploader.py` — File uploader UI component and client-side validation.

`frontend/utils/`:
- `__init__.py` — Package initializer for frontend utils.
- `session_state.py` — Streamlit session state helpers.
- `api_client.py` — Client wrapper for calling backend API endpoints.

---

## `tests/`

- `sample-test.py` — Example unit/integration test demonstrating basic functionality.

---

## `scripts/`

- `setup_environment.py` — Script to bootstrap environment and dependencies.
- `migrate_data.py` — Utilities for data migration tasks.
- `benchmark.py` — Performance benchmarking script.
- `deploy.py` — Deployment helper script for CI/CD or staging.

---

## `data/`

- `uploads/` — Temporary storage for raw uploaded files from users.
- `processed/` — Storage for parsed/processed documents and artifacts.
- `embeddings/` — Optional cached embeddings or local vector caches.

---

## `models/`

- `.gitkeep` — Placeholder to retain `models/` directory in git; intended for local model files (e.g., Ollama artifacts or quantized models).

---

## `logs/`

- `.gitkeep` — Placeholder to retain logs directory; runtime log files should be written here.

---

## `docs/`

- Documentation folder for additional guides, API docs, and architecture diagrams.

---

## `deployment/`

`deployment/docker/`:
- `api.Dockerfile` — Dockerfile specifically for the API service.
- `frontend.Dockerfile` — Dockerfile for building the frontend container.
