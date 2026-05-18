# PR Title
feat: Dynamic Invoice Builder with Line Items

## Description
This PR implements a comprehensive invoice builder with dynamic line item management and real-time total calculations.

### Key Changes:
- **Database Schema**: Added `Invoice` and `InvoiceLineItem` models, and `InvoiceStatus` enum.
- **Invoice Number Generation**: Implemented a utility in `./lib/invoice-number.ts` that auto-increments invoice numbers (e.g., `INV-2026-0001`) per organization.
- **Dynamic Builder UI**:
    - Created a rich interface at `./app/invoices/new/page.tsx` for creating invoices.
    - Supports dynamic addition/removal of line items.
    - Real-time calculation of subtotal, tax, and total.
    - Automatic fetching of the next available invoice number.
- **API Integration**: Added POST and GET handlers in `./app/api/invoices/route.ts` to manage invoice creation and number generation.
- **Invoice Dashboard**: Added a listing page at `./app/invoices/page.tsx` with formatted currency and status badges.

### Testing Instructions:
1. Ensure the database is in sync (`npx prisma db push`).
2. Navigate to `/invoices/new`.
3. Add multiple line items with different quantities, prices, and tax rates.
4. Verify that the totals update instantly.
5. Save the invoice as a draft.
6. Verify the invoice appears in the `/invoices` list with the correct auto-generated number.
