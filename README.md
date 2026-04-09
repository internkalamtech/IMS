# Institute Management System (IMS)

A modern Institute Management System built with a monorepo architecture, featuring a React Native mobile frontend and Python FastAPI backend.

## 🏗️ Project Structure

```
IMS/
├── mobile/          # React Native frontend (Expo)
├── backend/         # Python FastAPI backend
├── docs/            # Shared documentation and requirements
├── package.json     # Root package.json for monorepo scripts
└── README.md        # This file
```

## 🚀 Quick Start for Interns

### Prerequisites

- **Git**
- **Node.js** (v18 or higher)
- **Python** (v3.12 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (v14 or higher)

### Prerequisites Installation & Setup

#### 1. Install Git
- **Windows**: Download from https://git-scm.com/download/win
- **macOS**: Install via Homebrew: `brew install git` or download from https://git-scm.com/download/mac
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

Verify installation:
```bash
git --version
```

#### 2. Install Node.js & npm
- **Windows/macOS/Linux**: 
  - Visit https://nodejs.org/
  - Download the LTS version (v18 or higher)
  - Run the installer (npm is included automatically)

Verify installation:
```bash
node --version
npm --version
```

#### 3. Install Python
- **Windows**:
  - Visit https://www.python.org/downloads/
  - Download Python 3.12 or higher
  - During installation, **check "Add Python to PATH"**
  - Verify: `python --version` or `python3 --version`

- **macOS**:
  - Using Homebrew: `brew install python@3.12`
  - Or download from https://www.python.org/downloads/
  - Verify: `python3 --version`

- **Linux**:
  ```bash
  sudo apt-get update
  sudo apt-get install python3.12 python3.12-venv python3-pip
  ```
  - Verify: `python3 --version`

Verify pip installation:
```bash
pip --version
# or
pip3 --version
```

### Database Setup (PostgreSQL)

1. **Download and Install PostgreSQL:**
   - Visit https://www.postgresql.org/download/
   - Download installer for your OS
   - During installation, set the password ("ims_password") for `postgres` user
   - Default port: `5432`

2. **Create Database and User:**
   
   **Using pgAdmin (GUI):**
   
   a. **Open pgAdmin** and connect to PostgreSQL
      - You'll see "Servers" in the left panel
      - Expand "Servers" → "PostgreSQL 16" (or your version)
      - Enter the postgres password you set during installation
   
   b. **Create the Database:**
      - Right-click on "Databases"
      - Select "Create" → "Database..."
      - In the "General" tab:
        - Database name: `ims_db`
        - Owner: `postgres` (for now)
      - Click "Save"
   
   c. **Create the User (Login/Group Role):**
      - Right-click on "Login/Group Roles" (under PostgreSQL server)
      - Select "Create" → "Login/Group Role..."
      - In the "General" tab:
        - Name: `ims_user`
      - In the "Definition" tab:
        - Password: `ims_password`
      - In the "Privileges" tab:
        - Toggle ON: "Can login?"
      - Click "Save"
   
   d. **Grant Permissions:**
      - Right-click on the `ims_db` database
      - Select "Properties"
      - Go to the "Security" tab
      - Click the "+" button to add a privilege
      - Select `ims_user` from the "Grantee" dropdown
      - Under "Privileges", check: ALL
      - Click "Save"
   
   e. **Grant Schema Permissions (Required for PostgreSQL 15+):**
      - Right-click on the `ims_db` database
      - Select "Query Tool"
      - Copy and paste these SQL commands:
        ```sql
        GRANT ALL ON SCHEMA public TO ims_user;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO ims_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ims_user;
        ```
      - Click the Execute (▶️) button or press F5
      - You should see "Query returned successfully"

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/internkalamtech/IMS.git
   cd IMS
   ```
   
2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Files**
   ```bash
   npm run env:all
   ```
   This creates `.env` files for both `mobile/` and `backend/` from their `.env.example` templates.
   See [Environment Configuration](#environment-configuration) for more details.

4. **Setup Mobile (React Native)**
   ```bash
   npm run mobile:install
   ```

5. **Setup Backend (Python)**
   ```bash
   npm run backend:setup
   ```
   This creates a Python virtual environment and installs all dependencies.

6. **Seed Database with Demo Users**
   ```bash
   cd backend
   .venv\Scripts\python.exe -m app.infrastructure.database.seed
   ```
   This creates demo users and roles in the database for testing..

### Demo Credentials

After seeding the database, you can login with these credentials:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | `admin@myuser.com` | `admin123` | Full system access |
| **Teacher** | `teacher@myuser.com` | `teacher123` | Access to classes and students |
| **Parent** | `parent@myuser.com` | `parent123` | Access to children's information |
| **Student** | `student@myuser.com` | `student123` | Access to own information |
| **Transport** | `transport@myuser.com` | `transport123` | Transport management |
| **Driver** | `driver@myuser.com` | `driver123` | Driver access |

**Multi-role Users:**
- **John Smith**: `john@myuser.com` / `john123` (Parent + Teacher)
- **Maria Garcia**: `maria@myuser.com` / `maria123` (Parent + Teacher)

> **Note:** These credentials are for development/testing only. The mobile app will display available demo credentials on the login screen.

### Running the Application

#### Option 1: Run Separately (Recommended)
Open individual terminals for each.
**Mobile Frontend:**
```bash
npm run mobile
```
- Starts Expo dev server
- Scan QR code with Expo Go app on your phone
- Or press 'a' for Android emulator, 'i' for iOS simulator

**Backend API:**
```bash
npm run backend
```

Alternative:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Starts FastAPI server on http://localhost:8000
- API documentation available at http://localhost:8000/docs

#### Option 2: Run Both Together
```bash
npm run dev
```
This starts both the mobile app and backend server concurrently.

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

## 📱 Mobile App

The mobile app is built with:
- **React Native** with **Expo**
- **Clean Architecture** principles
- **TypeScript** for type safety
- **Expo Router** for navigation

## 🔧 Backend API

The backend is built with:
- **FastAPI** (modern, fast Python web framework)
- **Clean Architecture** with layered structure
- **SQLAlchemy** for database ORM
- **Pydantic** for data validation
- **JWT** for authentication

See [backend/README.md](backend/README.md) for detailed backend development guide.

## 📚 Documentation

- **Requirements**: See `docs/requirements/` for feature specifications
- **Developer Guide**: See `mobile/DEVELOPER_GUIDE.md` for frontend patterns
- **API Documentation**: Run backend and visit http://localhost:8000/docs

## 🧪 Testing

**Mobile:**
```bash
cd mobile
npm run lint
```

**Backend:**
```bash
cd backend
.venv\Scripts\activate  # Windows
pytest
```

## 🏛️ Architecture

Both frontend and backend follow **Clean Architecture** principles:

### Frontend Layers
- **Presentation**: UI components, hooks
- **Domain**: Business logic, entities, use cases
- **Data**: Repositories, API clients, local storage

### Backend Layers
- **API**: FastAPI routes and endpoints
- **Domain**: Business logic, entities, use cases
- **Infrastructure**: Database, external services
- **Core**: Shared utilities, configuration

## 📝 Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the existing patterns

3. **Test your changes**
   - Mobile: Run the app and test manually
   - Backend: Write and run tests with pytest

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

## Environment Configuration

The application uses environment variables for configuration. These are defined in the `.env` file.

| Variable | Description | Default (in Dev) |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_ENV` | Environment name (`development`, `staging`, `production`, `test`) | `development` |
| `EXPO_PUBLIC_API_URL` | Override for Backend API URL | Auto-detected |

### API URL Detection

In `development`, the app automatically attempts to detect your computer's IP address to connect to the backend (handy for physical devices on the same WiFi).

- **Physical Device**: Uses your computer's IP (detected via `expo-constants`).
- **Web**: Uses `localhost`.
- **Android Emulator**: Uses `10.0.2.2`.

If detection fails, or you are using a tunnel (ngrok), you should manually set `EXPO_PUBLIC_API_URL` in your `.env` file.


## 🤝 Contributing

For interns and developers:
1. Read the documents in `docs/` 
2. Read `docs/intern_onboarding_guide.md`
3. Follow the existing code structure and patterns
4. Use Clean Architecture principles
5. Write clear, self-documenting code
6. Add comments for complex logic
7. Test your changes before committing

## 📞 Support

If you encounter any issues:
1. Check the respective README files in `mobile/` and `backend/`
2. Review the developer guides in `docs/`
3. Review [Monorepo Structure Guide](docs/MONOREPO_STRUCTURE.md) for dependency management
4. Ask your mentor or team lead

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

---

**Happy Coding!!! 🎉**