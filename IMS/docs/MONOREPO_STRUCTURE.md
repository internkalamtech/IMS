# Monorepo Structure Guide

This document explains the structure and organization of the IMS monorepo.

## Overview

IMS uses a **monorepo** architecture, meaning multiple related projects (frontend mobile app and backend API) are managed in a single repository.

## Folder Structure

```
IMS/
├── node_modules/          # Root workspace dependencies
├── mobile/
│   ├── node_modules/      # Mobile app dependencies
│   └── package.json       # Mobile app packages
├── backend/
│   ├── .venv/             # Python virtual environment
│   ├── requirements.txt   # Production Python packages
│   └── requirements-dev.txt  # Development Python packages
├── docs/                  # Documentation
├── package.json           # Root workspace configuration
└── README.md
```

## Why Two `node_modules` Folders?

### 1. Root `node_modules/` (d:\Code\IMS\node_modules)
**Purpose:** Contains monorepo management tools

**Installed packages:**
- `concurrently` - Runs mobile and backend servers simultaneously

**Installed by:**
```bash
npm install  # in root directory
```

**Used for:**
- Running both apps together with `npm run dev`
- Workspace-level tooling

---

### 2. Mobile `node_modules/` (d:\Code\IMS\mobile\node_modules)
**Purpose:** Contains all mobile application dependencies

**Installed packages:**
- React Native core libraries
- Expo framework and tools
- Navigation libraries (@react-navigation)
- UI components and utilities
- HTTP client (axios)
- And many more mobile-specific packages

**Installed by:**
```bash
npm run mobile:install
# or
cd mobile && npm install
```

**Used for:**
- Running the mobile application
- Building the mobile app
- Mobile development tools

---

## Python Dependencies (Backend)

The backend uses Python and has a different dependency management system:

### `.venv/` (d:\Code\IMS\backend\.venv)
**Purpose:** Python virtual environment containing Python packages

**Contains:**
- All Python packages from `requirements.txt` (production)
- All Python packages from `requirements-dev.txt` (development)

**Created and installed by:**
```bash
npm run backend:setup
# or
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
```

---

## Requirements Files Explained

### `requirements.txt` - Production Dependencies
Packages needed to **run** the application:

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server to run the app |
| `pydantic` | Data validation |
| `sqlalchemy` | Database ORM |
| `asyncpg` | PostgreSQL async driver |
| `psycopg2-binary` | PostgreSQL sync driver |
| `python-jose` | JWT token handling |
| `passlib` | Password hashing |
| `bcrypt` | Encryption |
| `email-validator` | Email validation |
| `greenlet` | Async support for SQLAlchemy |

**When to install:** Always (production & development)

---

### `requirements-dev.txt` - Development Dependencies
Packages needed only for **development** and **testing**:

| Package | Purpose |
|---------|---------|
| `pytest` | Testing framework |
| `pytest-asyncio` | Async testing support |
| `httpx` | HTTP client for testing APIs |
| `black` | Code formatter |
| `flake8` | Code linter/style checker |
| `mypy` | Static type checker |

**When to install:** Development only (never in production)

**Usage:**
```bash
# Format code
black .

# Check code style
flake8 .

# Type checking
mypy .

# Run tests
pytest
```

---

## Why This Structure?

### ✅ Advantages

1. **Separation of Concerns**
   - Root tools are separate from app dependencies
   - Frontend and backend dependencies don't mix

2. **Independent Versioning**
   - Each app can use different package versions
   - No conflicts between mobile and workspace tools

3. **Clear Organization**
   - Easy to understand what each folder contains
   - Backend uses Python, frontend uses Node.js

4. **Standard Practice**
   - Common pattern in modern monorepo projects
   - Works well with CI/CD pipelines

5. **Scalability**
   - Easy to add more apps/services later
   - Each service maintains its own dependencies

---

## Common Commands

### Root Level
```bash
npm install              # Install workspace tools
npm run dev             # Run both mobile & backend
npm run mobile          # Run mobile app only
npm run backend         # Run backend API only
npm run mobile:install  # Install mobile dependencies
npm run backend:setup   # Setup backend environment
```

### Mobile (cd mobile/)
```bash
npm install             # Install mobile dependencies
npm start              # Start Expo dev server
npm run lint           # Check code quality
```

### Backend (cd backend/)
```bash
# Windows
.venv\Scripts\activate  # Activate virtual environment
python run.py          # Run backend server
pytest                 # Run tests
black .                # Format code
flake8 .               # Lint code

# Linux/macOS
source .venv/bin/activate
```

---

## Troubleshooting

### "Module not found" in Mobile
```bash
cd mobile
npm install
```

### "Module not found" in Backend
```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt
```

### Workspace tools not working
```bash
# In root directory
npm install
```

---

## Future Expansion: Adding a Web Application

If we add a web frontend in the future, here's how it would fit into the monorepo:

### Updated Folder Structure
```
IMS/
├── node_modules/          # Root workspace dependencies
├── mobile/
│   ├── node_modules/      # Mobile app dependencies
│   └── package.json       # Mobile packages (React Native, Expo)
├── web/                   # 🆕 NEW: Web application
│   ├── node_modules/      # 🆕 Web app dependencies
│   └── package.json       # 🆕 Web packages (React, Next.js, etc.)
├── backend/
│   ├── .venv/             # Python virtual environment
│   └── requirements.txt   # Backend packages
├── docs/
├── package.json           # Root workspace configuration
└── README.md
```

### Three `node_modules` Folders

**1. Root `node_modules/`**
- Purpose: Monorepo tools
- Contains: `concurrently`, workspace utilities

**2. Mobile `node_modules/`**
- Purpose: Mobile app dependencies
- Contains: React Native, Expo, navigation

**3. Web `node_modules/`** (Future)
- Purpose: Web app dependencies
- Contains: React, Next.js/Vite, web-specific libraries

### Web App Technologies (Possible Options)

#### Option 1: React with Vite
```json
// web/package.json
{
  "name": "@ims/web",
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "vite": "^5.x"
  }
}
```

#### Option 2: Next.js (Recommended)
```json
// web/package.json
{
  "name": "@ims/web",
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "axios": "^1.x"
  }
}
```

### Updated Root package.json
```json
{
  "name": "ims-monorepo",
  "scripts": {
    "mobile": "cd mobile && npm start",
    "mobile:install": "cd mobile && npm install",
    
    "web": "cd web && npm run dev",           // 🆕 NEW
    "web:install": "cd web && npm install",   // 🆕 NEW
    "web:build": "cd web && npm run build",   // 🆕 NEW
    
    "backend": "cd backend && .venv\\Scripts\\activate && python run.py",
    "backend:setup": "cd backend && python -m venv .venv && ...",
    
    "dev": "concurrently \"npm run mobile\" \"npm run web\" \"npm run backend\"",  // 🆕 UPDATED
    "dev:mobile": "concurrently \"npm run mobile\" \"npm run backend\"",
    "dev:web": "concurrently \"npm run web\" \"npm run backend\"",  // 🆕 NEW
    
    "install:all": "npm run mobile:install && npm run web:install && echo Backend: run 'npm run backend:setup'"  // 🆕 UPDATED
  }
}
```

### Setup Commands (With Web)

```bash
# Install all dependencies
npm install                # Root tools
npm run mobile:install     # Mobile dependencies
npm run web:install        # Web dependencies
npm run backend:setup      # Backend virtual environment

# Run all three together
npm run dev                # Mobile + Web + Backend

# Run individually
npm run mobile             # Mobile app only
npm run web                # Web app only
npm run backend            # Backend API only

# Run combinations
npm run dev:mobile         # Mobile + Backend
npm run dev:web            # Web + Backend
```

### Why Separate node_modules for Web?

1. **Different Dependencies**
   - Mobile uses React Native (no DOM)
   - Web uses React with DOM (react-dom)
   - Different build tools (Expo vs Vite/Next.js)

2. **Independent Versioning**
   - Mobile and Web can use different React versions if needed
   - No conflicts between native and web libraries

3. **Build Tools**
   - Mobile: Metro bundler (Expo)
   - Web: Vite or Next.js
   - Each needs its own toolchain

4. **Code Sharing** (Future Possibility)
   - Shared business logic can go in a `shared/` or `common/` folder
   - Import from: `import { useAuth } from '@ims/shared'`
   - Only UI components differ

### Shared Code Example (Future)
```
IMS/
├── shared/               # 🆕 Shared utilities
│   ├── node_modules/
│   ├── src/
│   │   ├── utils/
│   │   ├── types/
│   │   └── constants/
│   └── package.json
├── mobile/
├── web/
└── backend/
```

### Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Mobile (Expo) | 8081 | exp://localhost:8081 |
| Web App | 3000 | http://localhost:3000 |

### Benefits of This Structure

✅ **Each app is independent**
   - Can be deployed separately
   - Different tech stacks if needed

✅ **Shared backend**
   - One API serves both mobile and web
   - Consistent data and logic

✅ **Easy development**
   - Run all apps together or separately
   - Test full stack locally

✅ **Scalability**
   - Add more apps (admin panel, dashboard)
   - Each maintains its own dependencies

---

## Best Practices

1. **Don't commit `node_modules/` or `.venv/`**
   - These are in `.gitignore`
   - Team members install their own dependencies

2. **Update requirements files when adding packages**
   - Mobile: Update `mobile/package.json`
   - Web: Update `web/package.json` (when added)
   - Backend: Update `backend/requirements.txt` or `requirements-dev.txt`

3. **Keep dependencies up to date**
   - Regularly check for security updates
   - Test thoroughly after updates

4. **Use the monorepo scripts**
   - Run `npm run dev` from root to start all servers
   - Easier than managing each separately

5. **Share code wisely** (Future)
   - Create a `shared/` folder for common utilities
   - Keep UI components separate (mobile vs web)
   - Share types, constants, and business logic

---

**Questions?** Check the main [README.md](../README.md) or ask your team lead.
