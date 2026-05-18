# PR Title: Automated Financial Reporting & Digest System

## Description
Implemented a comprehensive automated reporting framework that schedules and delivers personalized financial digests to stakeholders.

### Key Features
- **Report Scheduling Engine**: `ReportSchedule` model in Prisma to manage per-organization delivery preferences (Weekly/Monthly).
- **Dynamic PDF Generation**: Branded financial digests created using `@react-pdf/renderer` in `./lib/pdf/financial-digest-pdf.tsx`.
- **Automated Data Aggregation**: Unified reporting logic in `./lib/cron/weekly-report.ts` that combines:
  - Cash Flow Forecasts (via AI engine).
  - Unpaid Invoice tracking.
  - Quarterly Tax obligations.
- **Stakeholder Management UI**: New settings page at `./app/settings/reports/page.tsx` for configuring recipients and frequency.
- **Magic Link Security**: (Infrastructure ready) Supports JWT-based authentication for frictionless dashboard access from report emails.

### Technical Details
- **Architecture**: Modular background processing logic that can be triggered via Vercel Cron or standard job queues.
- **Performance**: PDF generation is handled on-the-fly using buffers to minimize storage footprint for transient reports.
- **Schema**: Added `ReportSchedule` model with `recipients` array and `frequency` enums.
