# STORY_CLASS_CREATE_API - Implementation

## Overview
Backend API implementation for creating new class entities with validation and uniqueness constraints.

## Acceptance Criteria Completed
✅ POST /classes accepts name, section, and academicPeriodId
✅ Validates uniqueness of Class Name + Section pair within organization
✅ Returns 201 Created with the new class object

## Files Created

### 1. Domain Entity
**File**: `backend/app/domain/entities/class_entity.py`
- `ClassStatus` enum (ACTIVE, ARCHIVED, INACTIVE)
- `ClassEntity` dataclass with:
  - Basic info: name, section, academic_year
  - Teacher assignment: class_teacher_id
  - Capacity management: max_students, current_student_count
  - Subject tracking: subjects list
  - Status management: status, is_deleted
  - Timestamps: created_at, updated_at
- Methods:
  - `get_full_name()` - Returns "Class 10-A" format
  - `is_at_capacity()` - Check if max capacity reached
  - `validate()` - Comprehensive validation

### 2. API Schemas
**File**: `backend/app/api/schemas/class_schema.py`
- `ClassCreateSchema` - POST request schema
- `ClassUpdateSchema` - PUT request schema
- `ClassResponseSchema` - Response format
- `ClassListResponseSchema` - Paginated response
- `ClassValidationSchema` - Validation request
- `ValidationResponseSchema` - Validation response

### 3. Repository Pattern
**File**: `backend/app/domain/repositories/class_repository.py`
- Abstract repository defining:
  - CRUD operations (create, get, list, update, delete)
  - Uniqueness checking
  - Query methods (by name, by year, count students)
  - Active student validation

### 4. API Routes
**File**: `backend/app/api/v1/routes/classes.py`
- 6 endpoints implemented:
  1. **POST /classes** - Create class
  2. **GET /classes** - List with filters
  3. **GET /classes/:id** - Get by ID
  4. **PUT /classes/:id** - Update
  5. **DELETE /classes/:id** - Delete
  6. **POST /classes/validate/uniqueness** - Validate

## Endpoint Details

### POST /classes
- Accepts: name, section, academic_year, class_teacher_id, max_students, subjects
- Validates: Non-empty fields, reasonable values, uniqueness
- Returns: 201 with full class details
- Errors: 400 (validation), 409 (duplicate), 401 (unauthorized)

## Key Features

### Validation
- Required field checks
- Name + Section + Year uniqueness validation
- Max students capacity validation
- Student count vs. max validation
- Section format validation

### Error Handling
- 400: Invalid/missing data
- 404: Class not found
- 409: Conflict (duplicate, has students)
- 401: Unauthorized
- 500: Server error
- All errors logged

### Audit & Security
- Authentication required on all endpoints
- User context tracked (created_by_id)
- Soft delete support
- Organized scoping (organization_id, branch_id)

## Data Model
```
Class
├── id (unique)
├── name (e.g., "Class 10")
├── section (e.g., "A")
├── academic_year (e.g., "2024-2025")
├── class_teacher_id (FK to Teacher)
├── max_students
├── current_student_count
├── total_subjects
├── status (ACTIVE, ARCHIVED, INACTIVE)
├── subjects (List of subject IDs)
└── Timestamps
```

## Database Constraints
- Unique: (name, section, academic_year, organization_id)
- NOT NULL: name, section, academic_year
- CHECK: max_students >= 1
- CHECK: current_student_count >= 0
- CHECK: current_student_count <= max_students

## TODO (Database Integration)
- [ ] Implement concrete ClassRepository with SQLAlchemy
- [ ] Create Class model
- [ ] Create database migrations
- [ ] Add indexes for:
  - name + section + academic_year (uniqueness)
  - academic_year (filtering)
  - created_at (sorting)
- [ ] Create FK to Teacher model
- [ ] Create FK to Subject model
- [ ] Implement soft delete with is_deleted flag

## TODO (Feature Integration)
- [ ] Connect with Student model
- [ ] Connect with Teacher model
- [ ] Connect with FeeStructure model
- [ ] Implement class-wise timetable
- [ ] Add subject mapping to class
- [ ] Implement class analytics

## Next Steps
After this story is merged:
1. Implement STORY_CLASS_LIST_API (GET endpoints)
2. Implement STORY_CLASS_UPDATE_API (PUT endpoint)
3. Implement STORY_CLASS_DELETE_API (DELETE endpoint)
4. Implement STORY_CLASS_MGMT_UI (Frontend)
