# Integration Checklist for Issue #352

Use this checklist to guide the integration of fee management features into the database and navigation.

## Backend Integration Tasks

### Database Schema
- [ ] Create `fee_structures` table
  - [ ] Columns: id, student_id, fee_head, total_amount, is_mandatory, academic_year, created_at, updated_at
  - [ ] Indexes: student_id, academic_year

- [ ] Create `installments` table
  - [ ] Columns: id, fee_structure_id, student_id, due_date, amount, status, paid_date, created_at, updated_at
  - [ ] Indexes: student_id, fee_structure_id, status, due_date

- [ ] Create `transactions` table
  - [ ] Columns: id, student_id, installment_id, amount, payment_mode, transaction_ref, receipt_number, created_at, description
  - [ ] Indexes: student_id, receipt_number, transaction_ref, created_at

### Repository Implementation
- [ ] Create concrete `FeeRepositoryImpl` class
  - [ ] Implement `get_fee_structure()`
  - [ ] Implement `get_fee_summary()` with calculated aggregates
  - [ ] Implement `get_installments()` with status filtering
  - [ ] Implement `get_transactions()` with pagination
  - [ ] Implement `get_transaction_by_receipt()`
  - [ ] Implement `create_transaction()`
  - [ ] Implement `update_installment_status()`

### Database Connection
- [ ] Update database configuration in `app/infrastructure/database/database.py`
- [ ] Add SQLAlchemy ORM models for Fee, Installment, Transaction
- [ ] Create database migration scripts
- [ ] Test database operations

### Query Optimization
- [ ] Add database indexes as noted above
- [ ] Optimize `get_fee_summary()` with GROUP BY/aggregation
- [ ] Add query caching for summary data
- [ ] Test query performance with large datasets

### API Security
- [ ] Implement parent-student relationship verification
  ```python
  # In each endpoint, verify:
  # - Current user is a parent
  # - Student ID is one of user's children
  # - User has permission to view this student's fees
  ```

- [ ] Add rate limiting to fee endpoints
- [ ] Add audit logging for transactions
- [ ] Validate receipt number format

### Error Handling
- [ ] Add specific exception classes for fee operations
- [ ] Implement proper HTTP status codes (404, 403, etc.)
- [ ] Add logging for all operations

### Testing
- [ ] Write unit tests for repository methods
- [ ] Write integration tests for API endpoints
- [ ] Test with sample data (multiple students, multiple fee types)
- [ ] Test edge cases (zero balance, overdue, etc.)

---

## Frontend Integration Tasks

### Navigation Setup
- [ ] Import screens in app router
  ```typescript
  import FeeStatusScreen from '@/presentation/screens/FeeStatusScreen';
  import FeeLedgerScreen from '@/presentation/screens/FeeLedgerScreen';
  import ReceiptsScreen from '@/presentation/screens/ReceiptsScreen';
  ```

- [ ] Create navigation stack for finance features
  ```typescript
  const FinanceStack = () => (
    <Stack.Navigator screenOptions={{...}}>
      <Stack.Screen name="FeeStatus" component={FeeStatusScreen} />
      <Stack.Screen name="FeeLedger" component={FeeLedgerScreen} />
      <Stack.Screen name="Receipts" component={ReceiptsScreen} />
    </Stack.Navigator>
  );
  ```

- [ ] Add Finance tab to parent portal bottom tab navigation
- [ ] Test navigation between screens

### API Configuration
- [ ] Update API base URL in `core/api-config.ts`
- [ ] Test API calls with mock data first
- [ ] Replace DummyFeeRepository calls with real API calls in useFeeData hook
- [ ] Add error boundary for API failures

### Data Loading
- [ ] Test useFeeData hook with sample student IDs
- [ ] Implement loading skeletons
- [ ] Add retry logic for failed requests
- [ ] Implement offline detection

### UI Refinements
- [ ] Test FeeStatusScreen on different device sizes
- [ ] Test FeeLedgerScreen scroll performance
- [ ] Test ReceiptsScreen search functionality
- [ ] Verify dark mode compatibility

### Feature Enhancement
- [ ] Add real PDF download functionality for receipts
- [ ] Add payment initiation flow (if paying online)
- [ ] Add receipt sharing functionality
- [ ] Add print preview for receipts

### Testing
- [ ] Component testing with mock data
- [ ] Integration testing with API
- [ ] E2E testing of complete user flow
- [ ] Performance testing with large data sets

---

## ParentDashboard Integration

### Quick Action Navigation
- [ ] Update the DASHBOARD_CONFIG in `core/config/dashboard.ts`
  ```typescript
  {
    label: "Fee Status",
    icon: "cash",
    onPress: () => navigation.navigate('Finance', { screen: 'FeeStatus' })
  }
  ```

- [ ] Add quick action buttons to ParentDashboard
- [ ] Implement navigation from dashboard to fee screens

### Statistics Display
- [ ] Add fee-related stats to dashboard
  ```typescript
  {
    label: "Balance Due",
    value: "₹35,000"  // From API
  }
  ```

- [ ] Cache fee data for dashboard display
- [ ] Update stats on dashboard refresh

---

## Acceptance Criteria Verification

### Summary Feature
- [ ] ✅ Total Fee card displays
- [ ] ✅ Paid Amount card displays
- [ ] ✅ Balance Due card displays
- [ ] ✅ Progress bar shows percentage
- [ ] ✅ Color coding: green (paid), red (due), blue (total)
- [ ] ✅ Next due date displays
- [ ] ✅ Data refreshes on pull

### Ledger Feature
- [ ] ✅ All installments listed
- [ ] ✅ Grouped by fee type
- [ ] ✅ Due dates displayed
- [ ] ✅ Status indicators visible (Paid/Pending/Overdue)
- [ ] ✅ Subtotals per fee type
- [ ] ✅ Paid date shows when applicable
- [ ] ✅ Color coding by status
- [ ] ✅ Data refreshes on pull

### Receipts Feature
- [ ] ✅ Previous transactions listed
- [ ] ✅ Receipt numbers displayed
- [ ] ✅ Payment mode visible
- [ ] ✅ Amount and date shown
- [ ] ✅ Search functionality works
- [ ] ✅ View/Download button functional
- [ ] ✅ Receipt details modal shows
- [ ] ✅ Data refreshes on pull

---

## Deployment Checklist

### Backend Deployment
- [ ] Database migrations applied
- [ ] Environment variables configured (DB connection, etc.)
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Rate limiting configured
- [ ] Logging enabled and monitored
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Health checks working

### Frontend Deployment
- [ ] All imports resolve correctly
- [ ] No console warnings/errors
- [ ] API endpoints point to production
- [ ] Authentication tokens working
- [ ] Styling built correctly
- [ ] Assets optimized
- [ ] Performance profiling done
- [ ] Accessibility audit passed

### Post-Deployment
- [ ] Monitor error logs
- [ ] Monitor API performance
- [ ] Gather user feedback
- [ ] Monitor loading times
- [ ] Check data accuracy

---

## Known Limitations & Future Improvements

### Current Limitations
- [ ] Uses mock data (DummyFeeRepository)
- [ ] No PDF receipt generation
- [ ] No online payment processing
- [ ] No payment grace periods
- [ ] No installment reversal/refund
- [ ] No late fee calculation
- [ ] No scholarship deduction
- [ ] No bulk fee updates

### Future Enhancements
- [ ] Payment gateway integration
- [ ] SMS/Email notifications for due dates
- [ ] Automatic overdue status update
- [ ] Fee installment rescheduling
- [ ] Receipt email delivery
- [ ] Batch payment processing
- [ ] Discount code application
- [ ] Payment plan creation
- [ ] Dunning management for overdue
- [ ] Financial reports for admins

---

## Support & References

### Key Files
- Backend: `backend/app/api/v1/endpoints/finance.py`
- Frontend: `mobile/src/presentation/screens/FeeStatusScreen.tsx`
- Hook: `mobile/src/presentation/hooks/useFeeData.ts`
- Entities: `backend/app/domain/entities/fee.py`

### Documentation
- Main: `IMPLEMENTATION_SUMMARY.md`
- Quick Ref: `QUICK_REFERENCE.md`
- This file: `INTEGRATION_CHECKLIST.md`

### Related Issues
- Parent: #351 - Student Fee & Payment Tracking
- Related: EPIC_PARENT_FINANCE

---

**Last Updated**: 2024-04-16  
**Status**: Ready for Integration  
**Estimated Integration Time**: 3-5 days (depending on database complexity)

✅ All components ready for integration!
