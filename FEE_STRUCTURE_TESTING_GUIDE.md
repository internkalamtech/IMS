# Fee Structure API - Testing Guide

## Overview

This guide provides comprehensive testing strategies for the Fee Structure Management API, including unit tests, integration tests, and API tests.

## Testing Framework Setup

### Dependencies
```bash
# Add to requirements-dev.txt
pytest==8.3.5
pytest-asyncio==0.25.2
httpx==0.28.1
```

### Installation
```bash
pip install -r requirements-dev.txt
```

## Unit Tests

### Test Domain Entities

**Location**: `tests/test_fee_structures_entities.py`

```python
import pytest
from datetime import datetime
from app.domain.entities.payment import FeeHead, Installment, FeeStructure

def test_fee_head_creation():
    """Test creating a FeeHead entity"""
    head = FeeHead(
        id="1",
        name="Tuition",
        description="Regular tuition",
        amount=5000.0,
        percentage=50.0
    )
    assert head.name == "Tuition"
    assert head.amount == 5000.0
    assert head.percentage == 50.0

def test_installment_creation():
    """Test creating an Installment entity"""
    inst = Installment(
        id="1",
        installment_number=1,
        due_date=datetime(2024, 4, 1),
        amount=5000.0,
        description="First Quarter"
    )
    assert inst.installment_number == 1
    assert inst.amount == 5000.0

def test_fee_structure_creation():
    """Test creating a FeeStructure entity"""
    heads = [FeeHead(id="1", name="Tuition", description=None, amount=5000.0)]
    insts = [Installment(id="1", installment_number=1, due_date=datetime(2024, 4, 1), amount=5000.0)]
    
    fs = FeeStructure(
        id="1",
        class_id=1,
        academic_year="2024-2025",
        total_fee=5000.0,
        fee_heads=heads,
        installments=insts,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    assert fs.class_id == 1
    assert fs.academic_year == "2024-2025"
    assert len(fs.fee_heads) == 1
    assert len(fs.installments) == 1
```

### Test Use Cases

**Location**: `tests/test_fee_structure_usecases.py`

```python
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from app.domain.usecases.payment_usecases import (
    CreateFeeStructureUseCase,
    UpdateFeeStructureUseCase,
    DeleteFeeStructureUseCase
)
from app.domain.entities.payment import FeeStructure

@pytest.fixture
def mock_repository():
    """Create a mock FeeStructureRepository"""
    return AsyncMock()

@pytest.mark.asyncio
async def test_create_fee_structure_valid(mock_repository):
    """Test creating fee structure with valid data"""
    use_case = CreateFeeStructureUseCase(mock_repository)
    
    fee_heads = [{"name": "Tuition", "description": None, "amount": 5000.0, "percentage": 50.0}]
    installments = [{"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 5000.0}]
    
    mock_structure = FeeStructure(
        id="1", class_id=1, academic_year="2024-2025", total_fee=5000.0,
        fee_heads=[], installments=[], created_at=datetime.now(), updated_at=datetime.now()
    )
    mock_repository.create_fee_structure.return_value = mock_structure
    
    result = await use_case.execute(
        class_id=1,
        academic_year="2024-2025",
        total_fee=5000.0,
        fee_heads=fee_heads,
        installments=installments
    )
    
    assert result.class_id == 1
    assert result.academic_year == "2024-2025"
    mock_repository.create_fee_structure.assert_called_once()

@pytest.mark.asyncio
async def test_create_fee_structure_invalid_class_id(mock_repository):
    """Test creating fee structure with invalid class_id"""
    use_case = CreateFeeStructureUseCase(mock_repository)
    
    with pytest.raises(ValueError, match="Class ID must be positive"):
        await use_case.execute(
            class_id=-1,
            academic_year="2024-2025",
            total_fee=5000.0,
            fee_heads=[{"name": "Tuition", "amount": 5000.0}],
            installments=[{"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 5000.0}]
        )

@pytest.mark.asyncio
async def test_create_fee_structure_no_fee_heads(mock_repository):
    """Test creating fee structure without fee heads"""
    use_case = CreateFeeStructureUseCase(mock_repository)
    
    with pytest.raises(ValueError, match="At least one fee head is required"):
        await use_case.execute(
            class_id=1,
            academic_year="2024-2025",
            total_fee=5000.0,
            fee_heads=[],
            installments=[{"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 5000.0}]
        )

@pytest.mark.asyncio
async def test_update_fee_structure_valid(mock_repository):
    """Test updating fee structure"""
    use_case = UpdateFeeStructureUseCase(mock_repository)
    
    updated_structure = FeeStructure(
        id="1", class_id=1, academic_year="2024-2025", total_fee=12000.0,
        fee_heads=[], installments=[], created_at=datetime.now(), updated_at=datetime.now()
    )
    mock_repository.update_fee_structure.return_value = updated_structure
    
    result = await use_case.execute(
        fee_structure_id="1",
        total_fee=12000.0
    )
    
    assert result.total_fee == 12000.0
    mock_repository.update_fee_structure.assert_called_once()

@pytest.mark.asyncio
async def test_delete_fee_structure_valid(mock_repository):
    """Test deleting fee structure"""
    use_case = DeleteFeeStructureUseCase(mock_repository)
    mock_repository.delete_fee_structure.return_value = True
    
    result = await use_case.execute(fee_structure_id="1")
    assert result is True
    mock_repository.delete_fee_structure.assert_called_once()
```

## Integration Tests

### Database Integration

**Location**: `tests/test_fee_structure_repository.py`

```python
import pytest
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.infrastructure.database.models import Base, FeeStructureModel, FeeHeadModel, InstallmentModel
from app.infrastructure.repositories.database_fee_structure_repository import DatabaseFeeStructureRepository

@pytest.fixture
async def db_session():
    """Create in-memory SQLite database for testing"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSession(engine) as session:
        yield session

@pytest.mark.asyncio
async def test_create_fee_structure_integration(db_session):
    """Test creating fee structure with database"""
    repository = DatabaseFeeStructureRepository(db_session)
    
    result = await repository.create_fee_structure(
        class_id=1,
        academic_year="2024-2025",
        total_fee=10000.0,
        fee_heads=[
            {"name": "Tuition", "description": None, "amount": 6000.0, "percentage": 60.0},
            {"name": "Lab", "description": None, "amount": 2000.0, "percentage": 20.0}
        ],
        installments=[
            {"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 5000.0, "description": "First"},
            {"installment_number": 2, "due_date": datetime(2024, 8, 1), "amount": 5000.0, "description": "Second"}
        ]
    )
    
    assert result.class_id == 1
    assert result.academic_year == "2024-2025"
    assert result.total_fee == 10000.0
    assert len(result.fee_heads) == 2
    assert len(result.installments) == 2

@pytest.mark.asyncio
async def test_get_fee_structure_by_class_and_year_integration(db_session):
    """Test retrieving fee structure by class and year"""
    repository = DatabaseFeeStructureRepository(db_session)
    
    # Create structure
    await repository.create_fee_structure(
        class_id=1,
        academic_year="2024-2025",
        total_fee=10000.0,
        fee_heads=[{"name": "Tuition", "amount": 10000.0}],
        installments=[{"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 10000.0}]
    )
    
    # Retrieve it
    result = await repository.get_fee_structure_by_class_and_year(1, "2024-2025")
    
    assert result is not None
    assert result.class_id == 1
    assert result.academic_year == "2024-2025"

@pytest.mark.asyncio
async def test_delete_fee_structure_cascade_integration(db_session):
    """Test cascading delete of fee structure"""
    repository = DatabaseFeeStructureRepository(db_session)
    
    # Create structure
    created = await repository.create_fee_structure(
        class_id=1,
        academic_year="2024-2025",
        total_fee=10000.0,
        fee_heads=[{"name": "Tuition", "amount": 10000.0}],
        installments=[{"installment_number": 1, "due_date": datetime(2024, 4, 1), "amount": 10000.0}]
    )
    
    # Delete it
    await repository.delete_fee_structure(created.id)
    
    # Verify it's gone
    result = await repository.get_fee_structure_by_id(created.id)
    assert result is None
```

## API Endpoint Tests

### Setup Test Client

**Location**: `tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Create test client for API"""
    return TestClient(app)
```

### API Tests

**Location**: `tests/test_fee_structure_endpoints.py`

```python
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_create_fee_structure_endpoint(client):
    """Test POST /v1/finances/fee-structures/"""
    payload = {
        "class_id": 1,
        "academic_year": "2024-2025",
        "total_fee": 10000.0,
        "fee_heads": [
            {
                "name": "Tuition Fee",
                "description": "Regular tuition",
                "amount": 6000.0,
                "percentage": 60.0
            }
        ],
        "installments": [
            {
                "installment_number": 1,
                "due_date": "2024-04-01T00:00:00",
                "amount": 5000.0,
                "description": "First"
            }
        ]
    }
    
    response = client.post("/v1/finances/fee-structures/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["class_id"] == 1
    assert data["academic_year"] == "2024-2025"

def test_create_fee_structure_invalid_request(client):
    """Test POST with invalid data"""
    payload = {
        "class_id": -1,  # Invalid
        "academic_year": "2024-2025",
        "total_fee": 10000.0,
        "fee_heads": [],  # Empty
        "installments": []  # Empty
    }
    
    response = client.post("/v1/finances/fee-structures/", json=payload)
    assert response.status_code == 422

def test_get_fee_structure_by_class_and_year(client):
    """Test GET /v1/finances/fee-structures/class/{class_id}/academic-year/{year}"""
    # First create
    payload = {
        "class_id": 1,
        "academic_year": "2024-2025",
        "total_fee": 10000.0,
        "fee_heads": [{"name": "Tuition", "amount": 10000.0}],
        "installments": [{"installment_number": 1, "due_date": "2024-04-01T00:00:00", "amount": 10000.0}]
    }
    client.post("/v1/finances/fee-structures/", json=payload)
    
    # Then retrieve
    response = client.get("/v1/finances/fee-structures/class/1/academic-year/2024-2025")
    assert response.status_code == 200
    data = response.json()
    assert data["class_id"] == 1

def test_get_fee_structures_by_class(client):
    """Test GET /v1/finances/fee-structures/class/{class_id}"""
    # Create multiple structures
    for year in ["2024-2025", "2023-2024", "2022-2023"]:
        payload = {
            "class_id": 1,
            "academic_year": year,
            "total_fee": 10000.0,
            "fee_heads": [{"name": "Tuition", "amount": 10000.0}],
            "installments": [{"installment_number": 1, "due_date": "2024-04-01T00:00:00", "amount": 10000.0}]
        }
        client.post("/v1/finances/fee-structures/", json=payload)
    
    # Retrieve all
    response = client.get("/v1/finances/fee-structures/class/1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Should be in descending order by year
    assert data[0]["academic_year"] == "2024-2025"

def test_update_fee_structure(client):
    """Test PUT /v1/finances/fee-structures/{id}"""
    # Create first
    payload = {
        "class_id": 1,
        "academic_year": "2024-2025",
        "total_fee": 10000.0,
        "fee_heads": [{"name": "Tuition", "amount": 10000.0}],
        "installments": [{"installment_number": 1, "due_date": "2024-04-01T00:00:00", "amount": 10000.0}]
    }
    create_response = client.post("/v1/finances/fee-structures/", json=payload)
    fs_id = create_response.json()["id"]
    
    # Update
    update_payload = {"total_fee": 12000.0}
    response = client.put(f"/v1/finances/fee-structures/{fs_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_fee"] == 12000.0

def test_delete_fee_structure(client):
    """Test DELETE /v1/finances/fee-structures/{id}"""
    # Create first
    payload = {
        "class_id": 1,
        "academic_year": "2024-2025",
        "total_fee": 10000.0,
        "fee_heads": [{"name": "Tuition", "amount": 10000.0}],
        "installments": [{"installment_number": 1, "due_date": "2024-04-01T00:00:00", "amount": 10000.0}]
    }
    create_response = client.post("/v1/finances/fee-structures/", json=payload)
    fs_id = create_response.json()["id"]
    
    # Delete
    response = client.delete(f"/v1/finances/fee-structures/{fs_id}")
    assert response.status_code == 204
    
    # Verify deleted
    response = client.get(f"/v1/finances/fee-structures/{fs_id}")
    assert response.status_code == 400 or response.json() is None

def test_error_not_found(client):
    """Test 404 error for non-existent structure"""
    response = client.get("/v1/finances/fee-structures/9999")
    assert response.status_code == 400
```

## Running Tests

### Run All Tests
```bash
pytest tests/
```

### Run Specific Test File
```bash
pytest tests/test_fee_structure_endpoints.py
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html tests/
# Open htmlcov/index.html in browser
```

### Run with Verbose Output
```bash
pytest -v tests/
```

### Run Specific Test
```bash
pytest tests/test_fee_structure_endpoints.py::test_create_fee_structure_endpoint -v
```

## Test Scenarios

### Happy Path
- ✅ Create fee structure with valid data
- ✅ Retrieve by class and year
- ✅ Update total fee
- ✅ Update fee heads list
- ✅ Update installments
- ✅ Delete fee structure

### Error Handling
- ❌ Invalid class_id (negative or zero)
- ❌ Empty academic year
- ❌ Zero or negative total fee
- ❌ Empty fee heads list
- ❌ Empty installments list
- ❌ Non-existent fee structure ID
- ❌ Duplicate class-year combination

### Edge Cases
- Large number of fee heads (100+)
- Large number of installments (12+)
- Very large amount values
- Duplicate installment numbers
- Percentages exceeding 100%
- Concurrent updates

## Performance Testing

```python
import time
import pytest

@pytest.mark.asyncio
async def test_create_performance(db_session):
    """Test creation performance"""
    repository = DatabaseFeeStructureRepository(db_session)
    
    start = time.time()
    for i in range(100):
        await repository.create_fee_structure(
            class_id=i,
            academic_year="2024-2025",
            total_fee=10000.0,
            fee_heads=[{"name": f"Head{j}", "amount": 1000.0} for j in range(10)],
            installments=[{"installment_number": k, "due_date": datetime(2024, 4, 1), "amount": 1000.0} for k in range(10)]
        )
    end = time.time()
    
    print(f"Created 100 structures in {end - start:.2f}s")
    assert end - start < 30  # Should complete in under 30 seconds
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.10
      - run: pip install -r requirements-dev.txt
      - run: pytest --cov=app tests/
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v2
```

## Coverage Goals
- Unit Tests: 85%+
- Integration Tests: 75%+
- API Tests: 90%+
- Overall: 80%+
