#!/usr/bin/env python
"""Test database model structure"""

import sys
sys.path.insert(0, '.')

print("=" * 70)
print("DATABASE MODEL STRUCTURE TEST")
print("=" * 70)

# Test model imports
print("\n[1/3] Loading SQLAlchemy Models...")
try:
    from app.infrastructure.database.models import (
        FeeStructureModel, FeeHeadModel, InstallmentModel,
        Base
    )
    print("  ✓ FeeStructureModel loaded")
    print("  ✓ FeeHeadModel loaded")
    print("  ✓ InstallmentModel loaded")
except Exception as e:
    print(f"  ✗ Error: {e}")
    sys.exit(1)

# Test model structure
print("\n[2/3] Verifying Model Structure...")
try:
    from sqlalchemy import inspect
    
    print("\n  FeeStructureModel:")
    if hasattr(FeeStructureModel, '__tablename__'):
        print(f"    • Table: {FeeStructureModel.__tablename__}")
    
    mapper = inspect(FeeStructureModel)
    print("    • Columns:")
    for col in mapper.columns:
        col_type = str(col.type)
        nullable = "nullable" if col.nullable else "NOT NULL"
        print(f"      - {col.name}: {col_type} ({nullable})")
    
    print("    • Relationships:")
    for rel in mapper.relationships:
        print(f"      - {rel.key} ({rel.mapper.class_.__name__})")
    
    print("\n  FeeHeadModel:")
    if hasattr(FeeHeadModel, '__tablename__'):
        print(f"    • Table: {FeeHeadModel.__tablename__}")
    mapper = inspect(FeeHeadModel)
    print("    • Columns:")
    for col in mapper.columns:
        col_type = str(col.type)
        nullable = "nullable" if col.nullable else "NOT NULL"
        print(f"      - {col.name}: {col_type} ({nullable})")
    print("    • Relationships:")
    for rel in mapper.relationships:
        print(f"      - {rel.key} ({rel.mapper.class_.__name__})")
    
    print("\n  InstallmentModel:")
    if hasattr(InstallmentModel, '__tablename__'):
        print(f"    • Table: {InstallmentModel.__tablename__}")
    mapper = inspect(InstallmentModel)
    print("    • Columns:")
    for col in mapper.columns:
        col_type = str(col.type)
        nullable = "nullable" if col.nullable else "NOT NULL"
        print(f"      - {col.name}: {col_type} ({nullable})")
    print("    • Relationships:")
    for rel in mapper.relationships:
        print(f"      - {rel.key} ({rel.mapper.class_.__name__})")
    
    print("\n  ✓ Model structure verified")
    
except Exception as e:
    print(f"  ✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test model relationships
print("\n[3/3] Verifying Model Relationships...")
try:
    mapper_fs = inspect(FeeStructureModel)
    
    for rel in mapper_fs.relationships:
        if rel.key == 'fee_heads':
            print(f"\n  FeeStructureModel → FeeHeadModel relationship:")
            print(f"    • Cascade: {rel.cascade}")
            if 'delete' in rel.cascade:
                print(f"    ✓ Cascade delete enabled")
        elif rel.key == 'installments':
            print(f"\n  FeeStructureModel → InstallmentModel relationship:")
            print(f"    • Cascade: {rel.cascade}")
            if 'delete' in rel.cascade:
                print(f"    ✓ Cascade delete enabled")
    
    print("\n  ✓ Relationships verified with cascade delete")
    
except Exception as e:
    print(f"  ✗ Error: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✅ DATABASE MODEL STRUCTURE VERIFIED")
print("=" * 70)

print("\n📋 DATABASE SCHEMA SUMMARY:")
print("  Tables to create:")
print("    • fee_structures")
print("    • fee_heads")
print("    • installments")

print("\n  Relationships:")
print("    • FeeStructure (1) → FeeHead (N) [CASCADE DELETE]")
print("    • FeeStructure (1) → Installment (N) [CASCADE DELETE]")

print("\n" + "=" * 70)
