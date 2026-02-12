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

- **Node.js** (v18 or higher)
- **Python** (v3.12 or higher)
- **npm** (comes with Node.js)
- **Git**

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IMS
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Mobile (React Native)**
   ```bash
   npm run mobile:install
   ```

4. **Setup Backend (Python)**
   ```bash
   npm run backend:setup
   ```
   This creates a Python virtual environment and installs all dependencies.

### Running the Application

#### Option 1: Run Both Together (Recommended)
```bash
npm run dev
```
This starts both the mobile app and backend server concurrently.

#### Option 2: Run Separately

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
- Starts FastAPI server on http://localhost:8000
- API documentation available at http://localhost:8000/docs
- Alternative docs at http://localhost:8000/redoc

## 📱 Mobile App

The mobile app is built with:
- **React Native** with **Expo**
- **Clean Architecture** principles
- **TypeScript** for type safety
- **Expo Router** for navigation

See [mobile/README.md](mobile/README.md) for detailed mobile development guide.

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

## 🤝 Contributing

For interns and developers:
1. Follow the existing code structure and patterns
2. Use Clean Architecture principles
3. Write clear, self-documenting code
4. Add comments for complex logic
5. Test your changes before committing

## 📞 Support

If you encounter any issues:
1. Check the respective README files in `mobile/` and `backend/`
2. Review the developer guides
3. Ask your mentor or team lead

## 🔐 Sample Credentials

For development/testing:
- **Email**: Any valid email format (e.g., `admin@example.com`)
- **Note**: Currently using mock authentication. Real authentication will be implemented in backend.

---

**Happy Coding! 🎉**
