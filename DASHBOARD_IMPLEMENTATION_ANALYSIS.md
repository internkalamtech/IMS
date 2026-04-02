# Parent/Student Dashboard Implementation Analysis

## Executive Summary
The IMS project has a **basic dashboard skeleton** in both backend and mobile with role-based routing, but lacks substantial backend services and data models for academic features. The dashboards currently display **mock/static data** instead of real data from the database.

---

## 1. BACKEND IMPLEMENTATION (IMS/backend/)

### ✅ What Exists

#### API Endpoints
- **`GET /v1/dashboard/stats`** - Returns role-based statistics
  - Location: [backend/app/api/v1/endpoints/dashboard.py](backend/app/api/v1/endpoints/dashboard.py)
  - Returns role-specific dashboard stats with hardcoded values
  - Supported roles: `admin`, `teacher`, `parent`, `student`, `transport`, `driver`
  
- **`POST /v1/dashboard/contacts`** - Contact submission endpoint
  - Persists contact name/email to database
  - Location: [backend/app/api/v1/endpoints/dashboard.py](backend/app/api/v1/endpoints/dashboard.py)

#### Database Models
- **User Model** - Basic user with roles
  - Location: [backend/app/infrastructure/database/models.py](backend/app/infrastructure/database/models.py)
  - Properties: id, email, password_hash, name, roles, created_at, updated_at
  
- **Role Model** - Role definitions
  - Properties: id, name (admin, teacher, student, parent, transport, driver), description
  
- **Subject Model** - Subject definitions
  
- **ClassSection Model** - Class/section definitions
  
- **Contact Model** - Contact form submissions
  - Properties: id, name, email, created_at

#### Domain Layer
- **User Entity** - Business logic user representation
  - Location: [backend/app/domain/entities/user.py](backend/app/domain/entities/user.py)
  - Fields: id, name, email, role, roles[], avatar_url
  
- **Contact Entity** - Contact data model
  - Location: [backend/app/domain/entities/contact.py](backend/app/domain/entities/contact.py)

#### Use Cases
- **Auth Use Cases** - Login/authentication
  - Location: [backend/app/domain/usecases/auth_usecases.py](backend/app/domain/usecases/auth_usecases.py)
  
- **Class Subjects Use Case** - Associate subjects with classes
  - Location: [backend/app/domain/usecases/update_class_subjects.py](backend/app/domain/usecases/update_class_subjects.py)

#### Repositories
- `DatabaseAuthRepository` - User authentication
- `DatabaseContactRepository` - Contact persistence
- `ClassRepository` - Class operations
- `SubjectRepository` - Subject operations

#### Schemas (Request/Response Models)
- `StatItem` - Dashboard stat item (label, value)
- `DashboardResponse` - Dashboard response (role, stats[])
- `UserResponse` - User profile data
- `LoginResponse` - Login response with token

### ❌ What's Missing (Backend)

#### Dashboard Data Services - **CRITICAL MISSING**
No backend services for actual dashboard data:

1. **Attendance Service** (Required by EPIC_PARENT_ATTENDANCE)
   - ❌ No attendance tracking database model
   - ❌ No attendance repository
   - ❌ No API endpoints for attendance data (GET /dashboard/attendance)
   - ❌ No attendance statistics aggregation
   - Missing acceptance criteria:
     - Get daily attendance status for specific child and month
     - Calculate aggregate stats (present/absent counts and percentage)
     - Validate parent-child authorization

2. **Academics/Homework Service** (Required by EPIC_PARENT_ACADEMICS)
   - ❌ No homework/assignment model
   - ❌ No homework repository
   - ❌ No API endpoints for homework data (GET /dashboard/homework)
   - ❌ No study material service
   - Missing features:
     - List homework for specific student with filtering
     - Validate parent-child relationship authorization

3. **Financial Service** (Required by EPIC_PARENT_FINANCE)
   - ❌ No fee structure model
   - ❌ No transaction/payment model
   - ❌ No fee repository
   - ❌ No API endpoints for fee data (GET /dashboard/fees)
   - ❌ No payment processing service
   - Missing features:
     - Fee ledger retrieval
     - Payment history
     - Receipt generation

4. **Timetable Service** (Referenced but incomplete)
   - ❌ No timetable model (despite being in requirements)
   - ❌ No timetable repository
   - ❌ No timetable API endpoints
   - Partial: Class/subject structure exists but not linked to timetable

5. **Leave Management Service** (Required by EPIC_PARENT_ATTENDANCE)
   - ❌ No leave request model
   - ❌ No leave repository
   - ❌ No leave API endpoints
   - ❌ No leave application workflow

6. **Parent-Child Relationship Mapping** - **CRITICAL MISSING**
   - ❌ No parent-child mapping model (how do we know which children belong to which parent?)
   - ❌ No authorization checks to ensure parents can only see their own children's data
   - ❌ No use case for retrieving a parent's children

#### Database Schema Gaps
- ❌ No attendance records table
- ❌ No fees/finance table  
- ❌ No homework/assignment table
- ❌ No timetable/period table
- ❌ No grades/marks table
- ❌ No leave_requests table
- ❌ No parent_child_relationship table
- ❌ No notification table

---

## 2. MOBILE APP IMPLEMENTATION (IMS/mobile/)

### ✅ What Exists

#### Dashboard Screens
All role-based dashboard screens exist but display **mock/hardcoded data**:

1. **ParentDashboard** ✅ Partially Complete
   - Location: [mobile/src/presentation/screens/dashboards/ParentDashboard.tsx](mobile/src/presentation/screens/dashboards/ParentDashboard.tsx)
   - **Implemented:**
     - Welcome message with parent/child name
     - Child info card with avatar and initials
     - Statistics display (Attendance: 88%, Avg Marks: 85%, Fee Status: Paid)
     - Logout button
     - Pull-to-refresh functionality
     - Recent updates section (hardcoded items about homework, test results, announcements)
     - Quick action grid with 7 actions:
       * Timetable (navigates to /timetable)
       * Attendance
       * Academics
       * Fees
       * Transport
       * Exams
       * Conduct
   - **Status:**
     - ❌ Stats are fetched from API `/dashboard/stats` but based on hardcoded role stats
     - ❌ Child selection not implemented (hardcoded: "Aarav Kumar")
     - ❌ Recent updates are static data
     - ❌ Quick actions are navigation stubs (not fully connected)

2. **StudentDashboard** ✅ Partially Complete
   - Location: [mobile/src/presentation/screens/dashboards/StudentDashboard.tsx](mobile/src/presentation/screens/dashboards/StudentDashboard.tsx)
   - **Implemented:**
     - Welcome message with student name
     - Statistics display (Attendance: 92%, Avg Score: 8.5, Assignments Due: 3)
     - Logout functionality
     - Pull-to-refresh
     - Recent updates (homework, test results, announcements, fee reminders)
     - Quick action grid with 6 actions:
       * Timetable (navigates to /timetable)
       * Results
       * Homework
       * Library
       * Attendance
       * Profile
   - **Status:**
     - ❌ Stats are API-based but mock data
     - ❌ Recent updates are static
     - ❌ Quick actions are stubs

3. **AdminDashboard** ✅ Exists
   - Location: [mobile/src/presentation/screens/dashboards/AdminDashboard.tsx](mobile/src/presentation/screens/dashboards/AdminDashboard.tsx)
   - Shows: Total Students, Faculty Members, Monthly Revenue (hardcoded)

4. **TeacherDashboard** ✅ Exists
   - Location: [mobile/src/presentation/screens/dashboards/TeacherDashboard.tsx](mobile/src/presentation/screens/dashboards/TeacherDashboard.tsx)
   - Shows: Active Classes, Pending Gradings, Upcoming Classes (hardcoded)

5. **DashboardSwitcher** ✅ Complete
   - Location: [mobile/src/presentation/screens/dashboards/DashboardSwitcher.tsx](mobile/src/presentation/screens/dashboards/DashboardSwitcher.tsx)
   - Routes to appropriate dashboard based on user.role
   - Implemented: admin, teacher, parent, student

#### Data Layer (Mobile)
- **useDashboard Hook** ✅
  - Location: [mobile/src/presentation/hooks/useDashboard.ts](mobile/src/presentation/hooks/useDashboard.ts)
  - Fetches data from `GET /dashboard/stats`
  - Has fallback mock data for offline mode
  - Supports pull-to-refresh

- **GetDashboardDataUseCase** ✅
  - Location: [mobile/src/domain/usecases/get-dashboard-data-usecase.ts](mobile/src/domain/usecases/get-dashboard-data-usecase.ts)
  - Simple wrapper calling userRepository.getDashboardData(role)

- **UserRepositoryImpl** ✅
  - Location: [mobile/src/data/repositories/user-repository-impl.ts](mobile/src/data/repositories/user-repository-impl.ts)
  - Calls `GET /dashboard/stats` API
  - Has fallback with mock data for each role
  - Clean error handling

#### Dashboard Components
- **QuickActionGrid** ✅
  - Location: [mobile/src/presentation/components/dashboard/QuickActionGrid.tsx](mobile/src/presentation/components/dashboard/QuickActionGrid.tsx)
  - Displays quick action buttons in a grid
  - Integrates with DASHBOARD_CONFIG for actions

#### Dashboard Configuration
- **DASHBOARD_CONFIG** ✅
  - Location: [mobile/src/core/config/dashboard.ts](mobile/src/core/config/dashboard.ts)
  - Defines quick actions for each role (admin, teacher, parent, student)
  - Parent quick actions: Timetable, Attendance, Academics, Fees, Transport, Exams, Conduct
  - Student quick actions: Timetable, Results, Homework, Library, Attendance, Profile
  - Color-coded with Material Design colors

#### Other Screens
- **ProfileScreen** ✅ - User info, theme settings
- **TimetableScreen** - Referenced but basic
- **LoginScreen** ✅ - Demo credentials, authentication

#### App Navigation
- **Tab Layout** ✅
  - Location: [mobile/src/app/(tabs)/_layout.tsx](mobile/src/app/(tabs)/_layout.tsx)
  - 3 main tabs: Home (Dashboard), Alerts, Profile
  - Home tab loads DashboardSwitcher

### ❌ What's Missing (Mobile)

#### Critical Missing Features

1. **Multi-Child Support for Parents** - **NOT IMPLEMENTED**
   - ❌ No child selector component
   - ❌ No way to switch between multiple children
   - ❌ Child name hardcoded as "Aarav Kumar"
   - ❌ No mechanism to load different child's data
   - Impact: Parent dashboard can only show data for one hardcoded child

2. **Real Data Integration** - **CRITICAL**
   - ❌ Attendance data not fetched (displays 88% hardcoded)
   - ❌ Academic scores not fetched (displays 85% hardcoded)
   - ❌ Fee status not real (displays "Paid" hardcoded)
   - ❌ No homework/assignment list integration
   - ❌ No actual test results display

3. **Recent Updates** - **STATIC DATA ONLY**
   - ❌ Recent updates are hardcoded arrays
   - ❌ No API call to fetch actual updates/notifications
   - ❌ No notification service integration

4. **Dashboard Drill-Down Screens** - **INCOMPLETE**
   - ❌ Attendance detailed view/calendar not implemented
   - ❌ Academics/homework list screen incomplete
   - ❌ Fee ledger/payment screen not implemented
   - ❌ Leave management screen not implemented
   - ❌ Exam results screen not implemented
   - ❌ Conduct records screen not implemented
   - ❌ Transport details screen not implemented

5. **Data Fetching Hooks** - **LIMITED**
   - ✅ useDashboard - Stats only
   - ❌ useAttendance - Not implemented
   - ❌ useAcademics - Not implemented
   - ❌ useFees - Not implemented
   - ❌ useHomework - Not implemented
   - ❌ useLeaves - Not implemented

6. **Real-time Updates** - **NOT IMPLEMENTED**
   - ❌ No notification socket/websocket connection
   - ❌ No real-time updates when new homework assigned
   - ❌ No live attendance updates

7. **Offline Support** - **PARTIAL**
   - ✅ Has fallback mock data in useDashboard
   - ❌ No persisted local storage of actual user data
   - ❌ No sync mechanism for offline changes

8. **Quick Actions Integration** - **STUBS ONLY**
   - ✅ Quick action grid exists
   - ❌ Most actions navigate to modules that are incomplete:
     * Attendance - no detailed view
     * Academics - no homework list
     * Fees - no fee ledger/payment
     * Transport - no transport details
     * Exams - no exam results
     * Conduct - no conduct records

---

## 3. CURRENT DATA FLOW

### Backend Dashboard Flow
```
GET /dashboard/stats (authenticated)
  → get_current_user (JWT validation)
  → Current user has role (admin/teacher/parent/student/etc)
  → Returns hardcoded stats for that role
  → Response: { role: "Parent", stats: [{ label: "Attendance", value: "88%" }] }
```

### Mobile Dashboard Flow
```
ParentDashboard rendered
  → useDashboard() hook
    → getDashboardDataUseCase.execute(user.role)
      → userRepository.getDashboardData(role)
        → api.get('/dashboard/stats')
          → Returns role-specific mock stats
        → If error: use local fallback mock data
  → Display stats in UI (hardcoded for parent: 88%, 85%, Paid)
  → Recent updates from static RECENT_UPDATES array
```

---

## 4. MISSING ARCHITECTURE

### Required Backend Architecture (NOT CURRENTLY PRESENT)

```
Backend Requirements:
├── Database Models
│   ├── Attendance (student_id, date, status, marked_by_teacher)
│   ├── Homework (title, description, due_date, subject_id, created_by)
│   ├── Assignment (similar to homework)
│   ├── Grades/Marks (student_id, subject_id, score, date)
│   ├── Fee Structure (class_id, fee_components, total, schedule)
│   ├── Transactions (student_id, amount, date, status, receipt)
│   ├── Leave Request (student_id, from_date, to_date, status, reason)
│   ├── Timetable Period (class_id, subject_id, teacher_id, day, time, room)
│   ├── Parent Child Mapping (parent_id, student_id) ⚠️ CRITICAL
│   └── Notifications (user_id, message, type, read_status)
│
├── Repositories
│   ├── AttendanceRepository (getByStudentAndMonth, getStats)
│   ├── HomeworkRepository (getByStudent, getBySubject, getByDueDate)
│   ├── GradesRepository (getByStudent, getBySubject, getAverage)
│   ├── FeeRepository (getStructure, getTransactionHistory, getBalance)
│   ├── LeaveRepository (create, getByStudent, updateStatus)
│   ├── TimetableRepository (getByClass, getByStudent, getByDate)
│   ├── ParentChildRepository (getChildrenByParent) ⚠️ CRITICAL
│   └── NotificationRepository (create, getByUser, markAsRead)
│
├── Use Cases
│   ├── GetAttendanceStats
│   ├── GetHomeworkList
│   ├── GetGradesAndScores
│   ├── GetFeeStatus
│   ├── ApplyForLeave
│   ├── GetTimetable
│   ├── GetParentChildren ⚠️ CRITICAL
│   └── GetNotifications
│
├── API Endpoints (/v1/dashboard/*)
│   ├── GET /attendance?studentId=X&month=Y
│   ├── GET /homework?studentId=X&status=pending
│   ├── GET /grades?studentId=X&month=Y
│   ├── GET /fees?studentId=X
│   ├── GET /leaves?studentId=X
│   ├── POST /leaves (apply for leave)
│   ├── GET /timetable?studentId=X&date=Y
│   ├── GET /children (parent's children list) ⚠️ CRITICAL
│   └── GET /notifications
│
└── Services
    ├── AuthorizationService (parent-child relationship check) ⚠️ CRITICAL
    └── NotificationService
```

---

## 5. SUMMARY TABLE

| Feature | Backend | Mobile | Status | Notes |
|---------|---------|--------|--------|-------|
| **Dashboard Skeleton** | ✅ | ✅ | Complete | Basic structure exists |
| **Role-based Routing** | ✅ | ✅ | Complete | All 4 roles supported |
| **Basic Stats Display** | ✅ | ✅ | Complete | But hardcoded values |
| **API Integration** | ✅ | ✅ | Partial | Only /dashboard/stats |
| **Attendance Data** | ❌ | ❌ | Missing | No models, endpoints, or components |
| **Academics/Homework** | ❌ | ❌ | Missing | No models, endpoints, or components |
| **Fee/Finance Data** | ❌ | ❌ | Missing | No models, endpoints, or components |
| **Timetable Data** | ⚠️ | ⚠️ | Partial | Models exist, but not integrated |
| **Multi-Child Support** | ❌ | ❌ | Missing | Not implemented |
| **Parent-Child Auth** | ❌ | ❌ | Missing | **CRITICAL** - No parent-child mapping |
| **Real-time Updates** | ❌ | ❌ | Missing | No websocket/notifications |
| **Offline Support** | ❌ | ⚠️ | Partial | Mobile has mock fallback only |
| **Drill-down Screens** | N/A | ❌ | Missing | No detailed view screens |

---

## 6. RECOMMENDATIONS FOR IMPLEMENTATION

### Phase 1: Critical Foundation (Weeks 1-2)
1. Create `parent_child_relationship` table in database
2. Create authorization service to validate parent-child access
3. Create attendance model and basic CRUD operations
4. Create `/dashboard/children` endpoint for parent
5. Create `/dashboard/attendance` endpoint

### Phase 2: Core Features (Weeks 3-4)
1. Homework/Assignment model and endpoints
2. Grades/Marks model and endpoints
3. Fee structure and transaction models
4. Mobile: Add child switcher component
5. Mobile: Create attendance detailed view screen

### Phase 3: Complete Features (Weeks 5-6)
1. Leave request workflow
2. Notification system
3. Complete timetable integration
4. Mobile: Implement all drill-down screens
5. Mobile: Add real-time update capability

### Phase 4: Polish (Week 7)
1. Comprehensive testing
2. Error handling and validation
3. Performance optimization
4. Documentation

---

## 7. KEY CODEBASE FILES

### Backend Key Files
- [backend/app/api/v1/endpoints/dashboard.py](backend/app/api/v1/endpoints/dashboard.py) - Current dashboard endpoint
- [backend/app/api/v1/router.py](backend/app/api/v1/router.py) - API routing
- [backend/app/infrastructure/database/models.py](backend/app/infrastructure/database/models.py) - Database models
- [backend/app/domain/entities/user.py](backend/app/domain/entities/user.py) - User entity

### Mobile Key Files
- [mobile/src/presentation/screens/dashboards/ParentDashboard.tsx](mobile/src/presentation/screens/dashboards/ParentDashboard.tsx) - Parent UI
- [mobile/src/presentation/screens/dashboards/StudentDashboard.tsx](mobile/src/presentation/screens/dashboards/StudentDashboard.tsx) - Student UI
- [mobile/src/core/config/dashboard.ts](mobile/src/core/config/dashboard.ts) - Configuration
- [mobile/src/presentation/hooks/useDashboard.ts](mobile/src/presentation/hooks/useDashboard.ts) - Data fetching hook
- [mobile/src/data/repositories/user-repository-impl.ts](mobile/src/data/repositories/user-repository-impl.ts) - API calls

### Documentation
- [docs/requirements/EPIC_PARENT_ACADEMICS.json](docs/requirements/EPIC_PARENT_ACADEMICS.json)
- [docs/requirements/EPIC_PARENT_ATTENDANCE.json](docs/requirements/EPIC_PARENT_ATTENDANCE.json)
- [docs/requirements/EPIC_PARENT_FINANCE.json](docs/requirements/EPIC_PARENT_FINANCE.json)
- [docs/requirements/EPIC_PARENT_TIMETABLE.json](docs/requirements/EPIC_PARENT_TIMETABLE.json)
- [docs/requirements/EPIC_STUDENT_PORTAL.json](docs/requirements/EPIC_STUDENT_PORTAL.json)

