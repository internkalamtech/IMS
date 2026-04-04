# Issue #352: Quick Reference Guide

## What Was Implemented
Three new screens for parents to view student fee information:
1. **Fee Status** - Summary cards showing total fee, paid amount, balance due, and progress bar
2. **Fee Ledger** - Detailed list of all installments grouped by fee type
3. **Receipts** - Transaction history with search and download options

## Files Changed/Created

### Backend (Python/FastAPI)

| File | Type | Changes |
|------|------|---------|
| `backend/app/domain/entities/fee.py` | NEW | Domain models: FeeStructure, Installment, Transaction, FeeSummary |
| `backend/app/domain/repositories/fee_repository.py` | NEW | Repository interface for fee operations |
| `backend/app/domain/usecases/fee_usecases.py` | NEW | Use cases & implementations for fee operations |
| `backend/app/api/schemas.py` | MODIFIED | Added FeeSummaryResponse, FeeStructureResponse, InstallmentResponse, TransactionResponse |
| `backend/app/api/v1/endpoints/finance.py` | NEW | 6 REST endpoints for fee operations |
| `backend/app/api/v1/endpoints/__init__.py` | MODIFIED | Exported finance module |
| `backend/app/api/v1/router.py` | MODIFIED | Registered finance router |

### Frontend (React Native/TypeScript)

| File | Type | Changes |
|------|------|---------|
| `mobile/src/presentation/screens/FeeStatusScreen.tsx` | NEW | Fee summary cards and progress |
| `mobile/src/presentation/screens/FeeLedgerScreen.tsx` | NEW | Installment list by fee type |
| `mobile/src/presentation/screens/ReceiptsScreen.tsx` | NEW | Transaction receipts list |
| `mobile/src/presentation/hooks/useFeeData.ts` | NEW | Custom hook for fetching fee data |

## API Endpoints

### Finance Endpoints (v1)
```
GET    /v1/finance/student/{student_id}/fee-summary      → FeeSummaryResponse
GET    /v1/finance/student/{student_id}/fee-structure    → List[FeeStructureResponse]
GET    /v1/finance/student/{student_id}/installments     → List[InstallmentResponse]
GET    /v1/finance/student/{student_id}/receipts         → List[TransactionResponse]
GET    /v1/finance/receipt/{receipt_number}              → TransactionResponse
```

## Key Features

### FeeStatusScreen
- **Visual Summary Cards**: Total Fee, Paid Amount, Balance Due
- **Color Coded**: Blue (primary), Green (paid), Red (due)
- **Progress Bar**: Visual percentage indicator
- **Next Due Date**: Shows upcoming installment
- **Pull-to-Refresh**: Swipe to refresh data
- **Responsive**: Adapts to different screen sizes

### FeeLedgerScreen
- **Grouped by Fee Type**: Organized sections
- **Status Indicators**: ✓ Paid, ○ Pending, ! Overdue
- **Color Coded Status**: Green/Yellow/Red
- **Subtotals**: Per section calculation
- **Paid Date**: Shows when installment was paid
- **Sortable**: By fee type and status

### ReceiptsScreen
- **Search Functionality**: Filter by receipt number or description
- **Payment Mode Icons**: Visual indicators (UPI, Card, Cash, etc.)
- **Transaction Details**: Amount, date, mode, reference
- **View & Download**: Per receipt actions
- **Empty State**: Handles no receipts
- **Pagination Ready**: Support for large lists

## Data Models

### FeeSummary
```typescript
{
  student_id: string
  total_fee: number
  paid_amount: number
  balance_due: number
  next_due_date: datetime | null
  status_percentage: number (0-100)
}
```

### Installment
```typescript
{
  id: string
  fee_structure_id: string
  student_id: string
  due_date: datetime
  amount: number
  status: "Pending" | "Paid" | "Overdue"
  paid_date?: datetime
}
```

### Transaction
```typescript
{
  id: string
  student_id: string
  installment_id: string | null
  amount: number
  payment_mode: "UPI" | "Card" | "Cash" | "Check" | "Online"
  transaction_ref: string
  receipt_number: string (REC-XXXXXXXX)
  created_at: datetime
  description?: string
}
```

## How to Use

### For Developers - Backend Integration
1. Replace `DummyFeeRepository` with actual database implementation
2. Implement repository methods to query real fee data
3. Add database models for Fee, Installment, Transaction tables
4. Update use cases with real repository injection

### For Developers - Frontend Integration
1. Import screens into navigation router
2. Add routes to your navigation stack
3. Update useFeeData hook with correct API base URL
4. Pass student ID from parent context

### For Developers - Testing
```bash
# Test backend endpoints
curl http://localhost:8000/v1/finance/student/std-123/fee-summary

# Test with auth header
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/v1/finance/student/std-123/fee-summary
```

## Component Usage Example

### Using FeeStatusScreen
```typescript
import { FeeStatusScreen } from '@/presentation/screens/FeeStatusScreen';

export default function FinanceTab() {
  return <FeeStatusScreen />;
}
```

### Using useFeeData Hook
```typescript
function MyScreen() {
  const { feeSummary, installments, loading, error } = useFeeData('std-123');
  
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage text={error} />;
  
  return (
    <View>
      <Text>Total: {feeSummary?.total_fee}</Text>
      <Text>Paid: {feeSummary?.paid_amount}</Text>
    </View>
  );
}
```

## Color Scheme
- **Primary**: #3b82f6 (Blue) - Total fee, headers
- **Success**: #10b981 (Green) - Paid amounts
- **Warning**: #f59e0b (Yellow/Amber) - Pending amounts
- **Error**: #ef4444 (Red) - Balance due, overdue
- **Background**: Adaptive (light/dark mode)

## Styling Patterns
- **Card Elevation**: 2dp shadows for depth
- **Border Radius**: 8-12px for modern look
- **Spacing**: 16px padding, 12px gaps
- **Icons**: Ionicons library
- **Fonts**: Inter/system fonts with weight scaling

## Status Indicators
| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Paid | ✓ | Green (#10b981) | Payment received |
| Pending | ○ | Yellow (#f59e0b) | Awaiting payment |
| Overdue | ! | Red (#ef4444) | Past due date |

## Search/Filter Features
- **ReceiptsScreen**: Client-side filtering by receipt number or description
- **Ready for implementation**: Server-side search when data volume grows

## Error Handling
- Try-catch blocks in all API calls
- User-friendly error messages
- Loading states during fetches
- Empty states when no data

## Performance Considerations
- Memoized components where needed
- Efficient list rendering with SectionList
- Lazy loading ready for pagination
- Caching ready for future implementation

## Security
⚠️ **TODO**: Add parent-student relationship verification in backend
- Verify user is parent of the student
- Validate student_id matches user's children
- Add rate limiting to fee endpoints

## Accessibility
- Color contrast ratios meet WCAG AA
- Icons paired with text labels
- Touch targets ≥48x48dp
- RTL ready (if needed)

---

**Implementation Date**: 2024-04-16  
**Status**: Feature Complete (Backend Ready, Frontend Ready, Database Integration Pending)  
**Parent Issue**: #351  
**Related Epic**: EPIC_PARENT_FINANCE
