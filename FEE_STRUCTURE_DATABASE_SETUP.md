# Fee Structure Database Setup Guide

## Database Tables

The following tables need to be created in PostgreSQL to support the fee structure management API.

### Table: fee_structures
```sql
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_fee DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, academic_year)
);

CREATE INDEX idx_fee_structures_class_year ON fee_structures (class_id, academic_year);
```

**Purpose**: Stores the main fee structure information for each class and academic year.

**Fields**:
- `id`: Primary key, auto-increment
- `class_id`: Reference to the class (INTEGER, NOT NULL)
- `academic_year`: Academic year identifier (VARCHAR, NOT NULL) e.g., "2024-2025"
- `total_fee`: Total fee amount (DOUBLE PRECISION, NOT NULL)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

**Indexes**:
- Primary key on `id`
- Unique constraint on `(class_id, academic_year)` - ensures only one structure per class per year
- Index on `(class_id, academic_year)` - optimizes lookups


### Table: fee_heads
```sql
CREATE TABLE fee_heads (
    id SERIAL PRIMARY KEY,
    fee_structure_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    amount DOUBLE PRECISION NOT NULL,
    percentage DOUBLE PRECISION,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_heads_fee_structure ON fee_heads (fee_structure_id);
```

**Purpose**: Stores break-down items of the fee structure (tuition, lab, transport, etc.).

**Fields**:
- `id`: Primary key, auto-increment
- `fee_structure_id`: Foreign key to fee_structures table (NOT NULL, CASCADE DELETE)
- `name`: Name of the fee head (VARCHAR, NOT NULL) e.g., "Tuition Fee"
- `description`: Optional description (VARCHAR)
- `amount`: Amount for this fee head (DOUBLE PRECISION, NOT NULL)
- `percentage`: Optional percentage of total fee (DOUBLE PRECISION) e.g., 60.0 for 60%

**Indexes**:
- Primary key on `id`
- Unique composite key with fee_structure_id
- Foreign key constraint with cascade delete on fee_structures


### Table: installments
```sql
CREATE TABLE installments (
    id SERIAL PRIMARY KEY,
    fee_structure_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date TIMESTAMP NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description VARCHAR(500),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE INDEX idx_installments_fee_structure ON installments (fee_structure_id);
CREATE INDEX idx_installments_due_date ON installments (due_date);
```

**Purpose**: Stores installment payment schedules for fee structures.

**Fields**:
- `id`: Primary key, auto-increment
- `fee_structure_id`: Foreign key to fee_structures table (NOT NULL, CASCADE DELETE)
- `installment_number`: Sequential number (INTEGER, NOT NULL) e.g., 1, 2, 3
- `due_date`: Due date for this installment (TIMESTAMP, NOT NULL)
- `amount`: Amount due in this installment (DOUBLE PRECISION, NOT NULL)
- `description`: Optional description (VARCHAR) e.g., "First Semester", "April Payment"

**Indexes**:
- Primary key on `id`
- Foreign key constraint with cascade delete on fee_structures
- Index on due_date - useful for finding upcoming payments


## Data Relationships

```
FeeStructure (1) ---> (N) FeeHead
     |
     +---> (N) Installment
```

- One fee structure has multiple fee heads
- One fee structure has multiple installments
- Deleting a fee structure cascades and deletes all associated fee heads and installments
- No student-fee structure relationship yet (to be implemented in future)


## Migration Script Example (Alembic)

If using Alembic for migrations:

```python
"""Add fee structure tables

Revision ID: 001_initial_fee_structures
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Create fee_structures table
    op.create_table(
        'fee_structures',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('academic_year', sa.String(20), nullable=False),
        sa.Column('total_fee', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('class_id', 'academic_year'),
    )
    op.create_index('idx_fee_structures_class_year', 'fee_structures', ['class_id', 'academic_year'])

    # Create fee_heads table
    op.create_table(
        'fee_heads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fee_structure_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(500)),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('percentage', sa.Float()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['fee_structure_id'], ['fee_structures.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_fee_heads_fee_structure', 'fee_heads', ['fee_structure_id'])

    # Create installments table
    op.create_table(
        'installments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fee_structure_id', sa.Integer(), nullable=False),
        sa.Column('installment_number', sa.Integer(), nullable=False),
        sa.Column('due_date', sa.DateTime(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('description', sa.String(500)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['fee_structure_id'], ['fee_structures.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_installments_fee_structure', 'installments', ['fee_structure_id'])
    op.create_index('idx_installments_due_date', 'installments', ['due_date'])


def downgrade():
    op.drop_table('installments')
    op.drop_table('fee_heads')
    op.drop_table('fee_structures')
```


## Manual SQL Setup

If migrations aren't set up, run these SQL commands directly:

```sql
-- Create fee_structures table
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_fee FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, academic_year)
);

CREATE INDEX idx_fee_structures_class_year ON fee_structures(class_id, academic_year);

-- Create fee_heads table
CREATE TABLE fee_heads (
    id SERIAL PRIMARY KEY,
    fee_structure_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    amount FLOAT NOT NULL,
    percentage FLOAT,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE INDEX idx_fee_heads_fee_structure ON fee_heads(fee_structure_id);

-- Create installments table
CREATE TABLE installments (
    id SERIAL PRIMARY KEY,
    fee_structure_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date TIMESTAMP NOT NULL,
    amount FLOAT NOT NULL,
    description VARCHAR(500),
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE INDEX idx_installments_fee_structure ON installments(fee_structure_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
```


## Verification Queries

After creating the tables, verify they exist:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify fee_structures structure
\d fee_structures

-- Verify fee_heads structure
\d fee_heads

-- Verify installments structure
\d installments

-- Check foreign key relationships
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name IN ('fee_heads', 'installments');
```


## Sample Data

To test the API, you can insert sample data:

```sql
-- Insert a fee structure
INSERT INTO fee_structures (class_id, academic_year, total_fee)
VALUES (1, '2024-2025', 10000.0);

-- Insert fee heads
INSERT INTO fee_heads (fee_structure_id, name, description, amount, percentage)
VALUES 
  (1, 'Tuition Fee', 'Regular tuition charges', 6000.0, 60.0),
  (1, 'Lab Fee', 'Laboratory charges', 2000.0, 20.0),
  (1, 'Transport Fee', 'Transport charges', 2000.0, 20.0);

-- Insert installments
INSERT INTO installments (fee_structure_id, installment_number, due_date, amount, description)
VALUES 
  (1, 1, '2024-04-01', 5000.0, 'First Semester'),
  (1, 2, '2024-08-01', 5000.0, 'Second Semester');

-- Verify data
SELECT * FROM fee_structures;
SELECT * FROM fee_heads WHERE fee_structure_id = 1;
SELECT * FROM installments WHERE fee_structure_id = 1;
```


## Maintenance

### Backup Before Large Operations
```sql
-- Backup fee structure and related data
SELECT * INTO fee_structures_backup FROM fee_structures;
SELECT * INTO fee_heads_backup FROM fee_heads;
SELECT * INTO installments_backup FROM installments;
```

### Clean Up Old Data
```sql
-- Delete old academic years while preserving recent ones
DELETE FROM fee_structures WHERE academic_year < '2022-2023';
-- Note: This will cascade delete fee heads and installments
```

### Performance Optimization
```sql
-- Analyze tables for query optimization
ANALYZE fee_structures;
ANALYZE fee_heads;
ANALYZE installments;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```


## Troubleshooting

### Issue: Unique constraint violation
**Cause**: Trying to create another fee structure for the same class and year
**Solution**: Update existing structure or use different academic_year

### Issue: Foreign key constraint violation
**Cause**: Trying to insert fee head/installment with invalid fee_structure_id
**Solution**: Ensure fee_structure_id references existing fee structure

### Issue: Cascade delete has cascaded too much
**Cause**: Deleting a fee structure removes all related data
**Solution**: This is by design; make backups before deletion

## Environment Variables

No special environment variables needed for database setup. Configuration is in:
- `/backend/.env` - Database connection settings
- `/backend/app/core/config.py` - SQLAlchemy configuration
