# IMS Backend - Setup and Usage Guide

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

## PostgreSQL Setup

### Option 1: Local Installation

1. Install PostgreSQL on your system
2. Create database and user:

```bash
# Create database
createdb ims_db

# Create user
createuser ims_user

# Set password and grant privileges
psql -c "ALTER USER ims_user WITH PASSWORD 'ims_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ims_db TO ims_user;"
```

### Option 2: Docker (Alternative)

```bash
docker run --name ims-postgres \
  -e POSTGRES_USER=ims_user \
  -e POSTGRES_PASSWORD=ims_password \
  -e POSTGRES_DB=ims_db \
  -p 5432:5432 \
  -d postgres:16
```

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows (PowerShell)
. .\venv\Scripts\Activate.ps1

# Windows (cmd.exe)
venv\Scripts\activate

# Windows (Git Bash)
source venv/Scripts/activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Copy environment file:
```bash
cp .env.example .env
```

6. Update `.env` with your database credentials if different from defaults

## Database Setup

Initialize database and seed demo data:

```bash
python -m app.infrastructure.database.seed
```

This will:
- Create all database tables
- Create roles (admin, teacher, student, parent, transport, driver)
- Create 8 demo users with hashed passwords

### Demo Users

**Core Roles:**
- admin@myuser.com / admin123
- teacher@myuser.com / teacher123
- parent@myuser.com / parent123
- student@myuser.com / student123
- transport@myuser.com / transport123
- driver@myuser.com / driver123

**Multi-role Users:**
- john@myuser.com / john123 (parent + teacher)
- maria@myuser.com / maria123 (parent + teacher)

## Running the Server

Start the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On Windows, you can also run it directly with the venv Python executable:

```bash
.\venv\Scripts\python.exe run.py
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

## Testing the API

### Using Swagger UI

1. Open http://localhost:8000/docs
2. Click on `/api/v1/auth/login`
3. Click "Try it out"
4. Enter credentials:
```json
{
  "email": "admin@myuser.com",
  "password": "admin123"
}
```
5. Click "Execute"

### Using curl

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myuser.com","password":"admin123"}'
```

## Project Structure

```
backend/
├── app/
│   ├── core/                 # Core utilities
│   │   ├── config.py        # Configuration management
│   │   ├── errors.py        # Custom exceptions
│   │   ├── logger.py        # Logging setup
│   │   ├── password.py      # Password hashing
│   │   └── security.py      # JWT token management
│   ├── domain/              # Domain layer (Clean Architecture)
│   │   ├── entities/        # Business entities
│   │   ├── repositories/    # Repository interfaces
│   │   └── usecases/        # Business logic
│   ├── infrastructure/      # Infrastructure layer
│   │   ├── database/        # Database models and connection
│   │   └── repositories/    # Repository implementations
│   └── api/                 # API layer
│       ├── schemas.py       # Pydantic models
│       └── v1/endpoints/    # API endpoints
├── logs/                    # Application logs
├── .env                     # Environment variables
├── .env.example            # Environment template
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Architecture

This backend follows **Clean Architecture** principles:

1. **Domain Layer**: Core business logic, independent of frameworks
   - Entities: User, Role
   - Use Cases: LoginUseCase
   - Repository Interfaces: AuthRepository

2. **Infrastructure Layer**: External dependencies
   - Database: PostgreSQL with SQLAlchemy
   - Password Hashing: bcrypt
   - Repositories: DatabaseAuthRepository

3. **API Layer**: HTTP interface
   - FastAPI endpoints
   - Pydantic schemas for validation
   - JWT authentication

## Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **CORS**: Configured for React Native app

## Logging

Logs are written to:
- Console: Colored output for development
- File: `logs/ims.log` for persistent storage

Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

## Troubleshooting

### Schema Permission Error

```
InsufficientPrivilegeError: permission denied for schema public
```

**Solution**: This is a common issue in PostgreSQL 15+ where the `public` schema has restricted permissions. To fix this, you need to ensure `ims_user` has full rights on the `public` schema of `ims_db`.

Run these commands as a superuser (e.g., `postgres`):

1. **Change database owner** (Connect to any database, e.g., `postgres`):
   ```sql
   ALTER DATABASE ims_db OWNER TO ims_user;
   ```

2. **Grant schema permissions** (Must be connected to `ims_db` specifically):
   ```sql
   GRANT ALL ON SCHEMA public TO ims_user;
   ```

3. **Optional: Grant rights on all existing objects** (If tables already partially exist):
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ims_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ims_user;
   ```

You can run these using the **SQL Shell (psql)** or **pgAdmin** that came with your PostgreSQL installation.

### Import Errors

```
ModuleNotFoundError: No module named 'app'
```

**Solution**: Run commands from the `backend` directory and ensure virtual environment is activated.

### Port Already in Use

```
ERROR: [Errno 10048] error while attempting to bind on address
```

**Solution**: Change port in `.env` or kill process using port 8000.

## Next Steps

- Implement additional endpoints (user management, etc.)
- Add unit tests
- Set up CI/CD pipeline
- Configure production environment
- Add rate limiting
- Implement refresh tokens
