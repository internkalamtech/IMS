"""
Seed the database with test data for development and testing.

This script populates the IMS database with sample data for all phases.
"""

from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.infrastructure.database.models import (
    Base,
    UserModel,
    RoleModel,
    StudentModel,
    ParentModel,
    FeeStructureModel,
    PaymentModel,
    ClassModel,
    BudgetModel,
    ExpenseModel,
)

# Create engine and session
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(bind=engine)


def seed_data():
    """Seed the database with test data."""
    db = SessionLocal()

    try:
        # Check if data already exists
        existing_users = db.query(UserModel).first()
        if existing_users:
            print("Database already seeded. Skipping...")
            return

        # ================================================================
        # CREATE ROLES
        # ================================================================
        print("Creating roles...")
        admin_role = RoleModel(name="ADMIN", description="Administrator")
        teacher_role = RoleModel(name="TEACHER", description="Teacher")
        student_role = RoleModel(name="STUDENT", description="Student")
        parent_role = RoleModel(name="PARENT", description="Parent/Guardian")
        driver_role = RoleModel(name="DRIVER", description="Bus Driver")

        db.add_all([admin_role, teacher_role, student_role, parent_role, driver_role])
        db.commit()

        # ================================================================
        # CREATE USERS (Admin, Teachers)
        # ================================================================
        print("Creating users...")
        admin_user = UserModel(
            email="admin@ims.com",
            password_hash="hashed_password_123",  # In production, use bcrypt
            name="Admin User",
            is_active=True,
        )
        admin_user.roles = [admin_role]

        teacher1 = UserModel(
            email="teacher1@ims.com",
            password_hash="hashed_password_123",
            name="John Smith",
            is_active=True,
        )
        teacher1.roles = [teacher_role]

        teacher2 = UserModel(
            email="teacher2@ims.com",
            password_hash="hashed_password_123",
            name="Sarah Johnson",
            is_active=True,
        )
        teacher2.roles = [teacher_role]

        db.add_all([admin_user, teacher1, teacher2])
        db.commit()

        # ================================================================
        # CREATE CLASSES (Phase 2)
        # ================================================================
        print("Creating classes...")
        class_10a = ClassModel(
            name="Class 10",
            section="A",
            academic_year="2024-25",
            max_students=50,
            class_teacher_id=teacher1.id,
            status="ACTIVE",
        )
        class_10b = ClassModel(
            name="Class 10",
            section="B",
            academic_year="2024-25",
            max_students=50,
            class_teacher_id=teacher2.id,
            status="ACTIVE",
        )
        class_9a = ClassModel(
            name="Class 9",
            section="A",
            academic_year="2024-25",
            max_students=45,
            class_teacher_id=teacher1.id,
            status="ACTIVE",
        )

        db.add_all([class_10a, class_10b, class_9a])
        db.commit()

        # ================================================================
        # CREATE PARENTS
        # ================================================================
        print("Creating parents...")
        parent1 = ParentModel(
            user_id=None,
            name="Mr. Rajesh Kumar",
            phone="+91-9876543210",
            email="rajesh@example.com",
            relationship_type="Parent",
            is_active=True,
        )
        parent2 = ParentModel(
            user_id=None,
            name="Mrs. Priya Sharma",
            phone="+91-9876543211",
            email="priya@example.com",
            relationship_type="Parent",
            is_active=True,
        )
        parent3 = ParentModel(
            user_id=None,
            name="Mr. Arun Patel",
            phone="+91-9876543212",
            email="arun@example.com",
            relationship_type="Parent",
            is_active=True,
        )

        db.add_all([parent1, parent2, parent3])
        db.commit()

        # ================================================================
        # CREATE STUDENTS (Phase 1)
        # ================================================================
        print("Creating students...")
        student1 = StudentModel(
            name="Aarav Singh",
            roll_number="10A001",
            class_id=class_10a.id,
            class_name="10-A",
            marks=85.5,
            attendance=92.0,
            next_due_date=datetime.utcnow() + timedelta(days=30),
        )
        student1.parents = [parent1]

        student2 = StudentModel(
            name="Bhavna Reddy",
            roll_number="10A002",
            class_id=class_10a.id,
            class_name="10-A",
            marks=78.0,
            attendance=88.0,
            next_due_date=datetime.utcnow() + timedelta(days=30),
        )
        student2.parents = [parent2]

        student3 = StudentModel(
            name="Chitra Nair",
            roll_number="10B001",
            class_id=class_10b.id,
            class_name="10-B",
            marks=92.0,
            attendance=95.0,
            next_due_date=datetime.utcnow() + timedelta(days=30),
        )
        student3.parents = [parent3]

        student4 = StudentModel(
            name="Deepak Rao",
            roll_number="9A001",
            class_id=class_9a.id,
            class_name="9-A",
            marks=75.0,
            attendance=85.0,
            next_due_date=datetime.utcnow() + timedelta(days=30),
        )
        student4.parents = [parent1]

        db.add_all([student1, student2, student3, student4])
        db.commit()

        # ================================================================
        # CREATE FEE STRUCTURES (Phase 1)
        # ================================================================
        print("Creating fee structures...")
        fee_struct1 = FeeStructureModel(
            student_id=student1.id,
            total_fee=100000.00,
            amount_paid=25000.00,
            fee_type="Tuition",
            academic_year="2024-25",
        )
        fee_struct2 = FeeStructureModel(
            student_id=student2.id,
            total_fee=100000.00,
            amount_paid=50000.00,
            fee_type="Tuition",
            academic_year="2024-25",
        )
        fee_struct3 = FeeStructureModel(
            student_id=student3.id,
            total_fee=100000.00,
            amount_paid=100000.00,
            fee_type="Tuition",
            academic_year="2024-25",
        )
        fee_struct4 = FeeStructureModel(
            student_id=student4.id,
            total_fee=100000.00,
            amount_paid=0.00,
            fee_type="Tuition",
            academic_year="2024-25",
        )

        db.add_all([fee_struct1, fee_struct2, fee_struct3, fee_struct4])
        db.commit()

        # ================================================================
        # CREATE PAYMENTS (Phase 1)
        # ================================================================
        print("Creating payments...")
        payment1 = PaymentModel(
            student_id=student1.id,
            fee_structure_id=fee_struct1.id,
            receipt_number="REC_20240101_001",
            amount=25000.00,
            payment_mode="UPI",
            reference_number="UPI123456",
            status="Paid",
            payment_date=datetime.utcnow() - timedelta(days=60),
        )
        payment2 = PaymentModel(
            student_id=student2.id,
            fee_structure_id=fee_struct2.id,
            receipt_number="REC_20240115_002",
            amount=50000.00,
            payment_mode="Card",
            reference_number="CARD987654",
            status="Paid",
            payment_date=datetime.utcnow() - timedelta(days=45),
        )
        payment3 = PaymentModel(
            student_id=student3.id,
            fee_structure_id=fee_struct3.id,
            receipt_number="REC_20240201_003",
            amount=100000.00,
            payment_mode="Bank Transfer",
            reference_number="TXN789456",
            status="Paid",
            payment_date=datetime.utcnow() - timedelta(days=30),
        )

        db.add_all([payment1, payment2, payment3])
        db.commit()

        # ================================================================
        # CREATE BUDGETS (Phase 3.1)
        # ================================================================
        print("Creating budgets...")
        budget1 = BudgetModel(
            name="Academic Year 2024-25 Budget",
            academic_year="2024-25",
            total_allocated=5000000.00,
            total_spent=1250000.00,
            status="ACTIVE",
            approved_by_id=admin_user.id,
            approved_date=datetime.utcnow() - timedelta(days=90),
            created_by_id=admin_user.id,
        )
        budget2 = BudgetModel(
            name="Maintenance & Operations Budget",
            academic_year="2024-25",
            total_allocated=800000.00,
            total_spent=350000.00,
            status="ACTIVE",
            approved_by_id=admin_user.id,
            approved_date=datetime.utcnow() - timedelta(days=60),
            created_by_id=admin_user.id,
        )

        db.add_all([budget1, budget2])
        db.commit()

        # ================================================================
        # CREATE EXPENSES (Phase 3.1)
        # ================================================================
        print("Creating expenses...")
        expense1 = ExpenseModel(
            budget_id=budget1.id,
            description="Teacher Salaries - January 2024",
            amount=500000.00,
            category="SALARY",
            status="PAID",
            vendor_name="Internal",
            invoice_number="INV-2024-001",
            approved_by_id=admin_user.id,
            approved_date=datetime.utcnow() - timedelta(days=80),
            payment_date=datetime.utcnow() - timedelta(days=75),
            created_by_id=admin_user.id,
        )
        expense2 = ExpenseModel(
            budget_id=budget1.id,
            description="Student Scholarships",
            amount=250000.00,
            category="ADMIN",
            status="APPROVED",
            vendor_name="Internal",
            invoice_number="INV-2024-002",
            approved_by_id=admin_user.id,
            approved_date=datetime.utcnow() - timedelta(days=60),
            created_by_id=admin_user.id,
        )
        expense3 = ExpenseModel(
            budget_id=budget2.id,
            description="Electricity & Water Supply",
            amount=150000.00,
            category="UTILITIES",
            status="PAID",
            vendor_name="Municipal Corporation",
            invoice_number="INV-2024-003",
            approved_by_id=admin_user.id,
            approved_date=datetime.utcnow() - timedelta(days=45),
            payment_date=datetime.utcnow() - timedelta(days=40),
            created_by_id=admin_user.id,
        )
        expense4 = ExpenseModel(
            budget_id=budget2.id,
            description="Building Maintenance",
            amount=200000.00,
            category="MAINTENANCE",
            status="PENDING",
            vendor_name="ABC Maintenance Co.",
            invoice_number="INV-2024-004",
            created_by_id=admin_user.id,
        )

        db.add_all([expense1, expense2, expense3, expense4])
        db.commit()

        print("\n✅ Database seeded successfully!")
        print(f"   - Roles: 5")
        print(f"   - Users: 3 (1 admin, 2 teachers)")
        print(f"   - Classes: 3")
        print(f"   - Students: 4")
        print(f"   - Parents: 3")
        print(f"   - Fee Structures: 4")
        print(f"   - Payments: 3")
        print(f"   - Budgets: 2")
        print(f"   - Expenses: 4")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
