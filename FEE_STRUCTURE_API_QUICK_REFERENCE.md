# Fee Structure API - Quick Reference Guide

## Endpoint Quick Links

### Create Fee Structure
```
POST /api/v1/finances/fee-structures/
Status: 201 Created
Response: FeeStructureResponse
```

### Retrieve Fee Structure
```
# By ID
GET /api/v1/finances/fee-structures/{fee_structure_id}

# By Class and Academic Year
GET /api/v1/finances/fee-structures/class/{class_id}/academic-year/{academic_year}

# All structures for a class
GET /api/v1/finances/fee-structures/class/{class_id}

Status: 200 OK
Response: FeeStructureResponse | FeeStructureResponse[]
```

### Update Fee Structure
```
PUT /api/v1/finances/fee-structures/{fee_structure_id}
Status: 200 OK
Response: FeeStructureResponse
```

### Delete Fee Structure
```
DELETE /api/v1/finances/fee-structures/{fee_structure_id}
Status: 204 No Content
```

## Request/Response Examples

### Request Body Example (Create/Update)
```json
{
  "class_id": 1,
  "academic_year": "2024-2025",
  "total_fee": 10000.0,
  "fee_heads": [
    {
      "name": "Tuition Fee",
      "description": "Regular tuition charges",
      "amount": 6000.0,
      "percentage": 60.0
    },
    {
      "name": "Lab Fee",
      "amount": 2000.0,
      "percentage": 20.0
    },
    {
      "name": "Transport",
      "amount": 2000.0,
      "percentage": 20.0
    }
  ],
  "installments": [
    {
      "installment_number": 1,
      "due_date": "2024-04-01T00:00:00",
      "amount": 5000.0,
      "description": "First Quarter"
    },
    {
      "installment_number": 2,
      "due_date": "2024-08-01T00:00:00",
      "amount": 5000.0,
      "description": "Second Quarter"
    }
  ]
}
```

### Response Body Example
```json
{
  "id": "1",
  "class_id": 1,
  "academic_year": "2024-2025",
  "total_fee": 10000.0,
  "fee_heads": [
    {
      "id": "1",
      "name": "Tuition Fee",
      "description": "Regular tuition charges",
      "amount": 6000.0,
      "percentage": 60.0
    },
    {
      "id": "2",
      "name": "Lab Fee",
      "description": null,
      "amount": 2000.0,
      "percentage": 20.0
    },
    {
      "id": "3",
      "name": "Transport",
      "description": null,
      "amount": 2000.0,
      "percentage": 20.0
    }
  ],
  "installments": [
    {
      "id": "1",
      "installment_number": 1,
      "due_date": "2024-04-01T00:00:00",
      "amount": 5000.0,
      "description": "First Quarter"
    },
    {
      "id": "2",
      "installment_number": 2,
      "due_date": "2024-08-01T00:00:00",
      "amount": 5000.0,
      "description": "Second Quarter"
    }
  ],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Total fee must be greater than zero"
}
```

### 404 Not Found
```json
{
  "detail": "Fee structure not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": "At least one fee head is required"
}
```

## Important Notes

### Validation Rules
- **class_id**: Must be positive integer
- **academic_year**: Required, min 1 character (e.g., "2024-2025")
- **total_fee**: Must be > 0
- **fee_heads**: At least 1 required, each with:
  - name: Required, non-empty
  - amount: Required, > 0
  - percentage: Optional, 0-100
- **installments**: At least 1 required, each with:
  - installment_number: Required, > 0
  - due_date**: Required (ISO 8601 format)
  - amount: Required, > 0

### Data Integrity
- Deleting a fee structure removes all associated fee heads and installments (cascade delete)
- Updates replace the complete list of fee heads/installments
- All timestamps are in UTC

### Performance Tips
- Use the class_id + academic_year endpoint for specific year lookups (indexed)
- Use GET /class/{class_id} to retrieve all historical structures
- Avoid fetching large numbers of structures; paginate if needed

## Common Use Cases

### 1. Create Fee Structure for New Class
```bash
POST /v1/finances/fee-structures/
Body: { class_id, academic_year, total_fee, fee_heads[], installments[] }
```

### 2. Get Current Year Fee Structure
```bash
GET /v1/finances/fee-structures/class/{class_id}/academic-year/2024-2025
```

### 3. Update Fee Amounts Mid-Year
```bash
PUT /v1/finances/fee-structures/{id}
Body: { fee_heads: [updated list] }
```

### 4. Archive Old Fee Structure
```bash
DELETE /v1/finances/fee-structures/{id}
```

### 5. View All Years for a Class
```bash
GET /v1/finances/fee-structures/class/{class_id}
Returns: Sorted by academic_year (descending)
```

## Code Integration Examples

### Using in Frontend (TypeScript/React)
```typescript
// Create
const response = await fetch('/v1/finances/fee-structures/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(feeStructure)
});
const created = await response.json();

// Retrieve
const structures = await fetch(`/v1/finances/fee-structures/class/${classId}`).then(r => r.json());

// Update
await fetch(`/v1/finances/fee-structures/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

// Delete
await fetch(`/v1/finances/fee-structures/${id}`, { method: 'DELETE' });
```

### Using in Backend (Python)
```python
# Already available via the repository and use cases
from app.infrastructure.repositories.database_fee_structure_repository import DatabaseFeeStructureRepository
from app.domain.usecases.payment_usecases import CreateFeeStructureUseCase

# In your endpoint or service
repository = DatabaseFeeStructureRepository(db_session)
use_case = CreateFeeStructureUseCase(repository)
fee_structure = await use_case.execute(
    class_id=1,
    academic_year="2024-2025",
    total_fee=10000.0,
    fee_heads=[...],
    installments=[...]
)
```

## Support & Troubleshooting

### Issue: Fee structure not found after creation
- Check class_id is correct
- Verify academic_year matches exactly (case-sensitive)

### Issue: Cannot delete fee structure
- Structure may be linked to student records (future implementation)
- Check logs for specific error message

### Issue: Update doesn't work as expected
- Remember: update replaces entire fee_heads/installments list
- Include all fee heads/installments, not just changed ones

## Related Documentation
- [Full Implementation Guide](./FEE_STRUCTURE_API_IMPLEMENTATION.md)
- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Architecture Diagrams](./BACKEND_ARCHITECTURE_DIAGRAMS.md)
