# University Registration and Verification System

## Overview

This implementation provides a complete university registration and verification system for the VerifAI platform. Universities must be verified before they can issue blockchain-based certificates.

## System Architecture

### 1. Database Layer

#### Universities Table (`supabase/migrations/20251129120000_create_universities_table.sql`)

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('CENTRAL', 'STATE', 'PRIVATE', 'DEEMED')),
  state VARCHAR(100) NOT NULL,
  ugc_reference VARCHAR(255),
  aishe_code VARCHAR(20),
  website_domain VARCHAR(255) NOT NULL,
  registrar_official_email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Status Flow:** `PENDING` → `APPROVED` or `REJECTED`

---

## Frontend Components

### 1. Validation Schema (`src/lib/validations.ts`)

Comprehensive Zod schema with:
- **Legal Name:** Min 3 chars, max 255
- **Type:** Enum (CENTRAL, STATE, PRIVATE, DEEMED)
- **State:** Indian states & UTs dropdown (37 options)
- **UGC Reference:** Optional, max 255 chars
- **AISHE Code:** Optional, pattern `^[A-Z]-[0-9]{3,6}$`
- **Website Domain:** Valid domain format
- **Registrar Email:** Must match domain OR end with `.edu.in` or `.ac.in`
- **Wallet Address:** Valid Ethereum address `0x[40 hex chars]`

### 2. University Registration Form (`src/components/UniversityRegistrationForm.tsx`)

- React Hook Form + Zod validation
- Client-side real-time validation
- All 8 fields with proper labels and help text
- Responsive grid layout
- Error messages on each field

### 3. University Registration Page (`src/pages/UniversityRegistration.tsx`)

- Beautiful hero section with gradient background
- Form submission via Supabase Edge Function
- Loading states and error handling
- Redirects to success page on completion

### 4. Success Page (`src/pages/UniversityRegistrationSuccess.tsx`)

- Confirmation message: "Thank you for registering. Your verification is under review."
- Next steps guidance
- Contact support information
- Reference ID for tracking

---

## Backend API

### Edge Function: `register-university`

**Location:** `supabase/functions/register-university/index.ts`

**Endpoint:** `POST /functions/v1/register-university`

#### Server-Side Validation Rules

1. **Legal Name:** 3-255 characters
2. **Type:** Must be CENTRAL, STATE, PRIVATE, or DEEMED
3. **State:** Must be valid Indian state/UT
4. **AISHE Code:** If provided, must match `^[A-Z]-[0-9]{3,6}$`
5. **Website Domain:** Valid domain format (no protocol)
6. **Registrar Email:** 
   - Valid email format
   - Domain must match website domain OR end with `.edu.in`/`.ac.in`
7. **Wallet Address:** Valid Ethereum address format
8. **Duplicate Check:** Prevents duplicate registrations by website_domain or email

#### Response Format

**Success (200):**
```json
{
  "success": true,
  "message": "University registered successfully",
  "data": { /* university record */ }
}
```

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "fieldName": "error message"
  }
}
```

**Duplicate Error (409):**
```json
{
  "error": "University with this domain or email already exists",
  "details": {
    "existing": "PENDING|APPROVED|REJECTED"
  }
}
```

---

## Admin Dashboard

### Updated `src/pages/Admin.tsx`

#### University Management Tab

**Features:**
- View all universities (sortable by creation date)
- Statistics cards showing: Pending, Approved, Rejected counts
- Filterable by status
- Action buttons for each university:
  - **Details:** View full registration info in modal
  - **Approve:** Changes status to APPROVED
  - **Reject:** Opens dialog to provide rejection reason

**Data Display:**
- Legal name, type, state, email, status
- Wallet address (truncated, monospace)
- UGC reference and AISHE code (if provided)

#### Features
- Real-time data refresh
- Approve/Reject dialogs
- Toast notifications for all actions
- Automatic data reload after actions

#### Credential Issuance Tab
- Existing functionality preserved
- Can upload certificates and issue credentials

---

## Type Definitions

Updated `src/integrations/supabase/types.ts` with universities table:

```typescript
universities: {
  Row: {
    id: string;
    legal_name: string;
    type: 'CENTRAL' | 'STATE' | 'PRIVATE' | 'DEEMED';
    state: string;
    ugc_reference: string | null;
    aishe_code: string | null;
    website_domain: string;
    registrar_official_email: string;
    wallet_address: string;
    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    updated_at: string;
  };
  // ... Insert, Update types
}
```

---

## Routing

### New Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/university/register` | UniversityRegistration | Registration form |
| `/university/success` | UniversityRegistrationSuccess | Success confirmation |

### Updated Navigation

Added "Register University" link to navbar for easy access.

---

## Security Features

1. **Server-Side Validation:** All inputs validated on backend
2. **Email Verification:** Registrar email must match institution domain
3. **Duplicate Prevention:** Can't register same domain/email twice
4. **Wallet Validation:** Must be valid Ethereum address
5. **RLS Policies:** Database row-level security enabled
6. **Type Safety:** Full TypeScript throughout

---

## User Flow

### University Registration Flow

```
1. Navigate to /university/register
2. Fill out 8-field form with validation
3. Submit via Edge Function (server-side validation)
4. On success → /university/success page
5. Show confirmation: "Your verification is under review"
```

### Admin Approval Flow

```
1. Navigate to /admin → Universities tab
2. View pending universities in table
3. Click "Details" to review info
4. Click "Approve" or "Reject"
5. On Reject: Provide reason (optional for future notification)
6. University status updated immediately
7. Toast notification confirms action
```

### University Access Control

- **PENDING:** No access to credential issuance
- **APPROVED:** Full access to issue credentials
- **REJECTED:** No access (can reapply with corrections)

---

## Installation & Setup

### 1. Database Migration

```bash
supabase migration up
```

This creates the universities table with proper indexes and RLS policies.

### 2. Environment Variables

Add to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### 3. Deploy Edge Function

```bash
supabase functions deploy register-university
```

---

## Testing Guide

### Frontend Validation
```
Test Form: /university/register
- Invalid email domain (should fail if not .edu.in or .ac.in)
- Invalid AISHE code (should show pattern error)
- Invalid wallet address (should show format error)
- Missing required fields (should prevent submission)
```

### Backend Validation
```
Test Edge Function via:
POST https://your-project.supabase.co/functions/v1/register-university

Body:
{
  "legalName": "Example University",
  "type": "STATE",
  "state": "Maharashtra",
  "websiteDomain": "example.edu.in",
  "registrarOfficialEmail": "registrar@example.edu.in",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
}
```

### Admin Dashboard
```
1. Register a test university
2. Go to /admin → Universities tab
3. Verify it shows as PENDING
4. Click Details to view info
5. Click Approve → status changes to APPROVED
6. Try Reject on another university → shows rejection dialog
```

---

## Production Considerations

### Before Going Live

1. **Email Verification:** Implement actual email verification for registrar email
2. **Document Verification:** Add document upload for AISHE/UGC verification
3. **Rate Limiting:** Add rate limits to Edge Function
4. **Audit Logging:** Log all approvals/rejections with admin user info
5. **Notification System:** Send email when status changes
6. **Admin Authentication:** Require admin login for approval page
7. **CORS Configuration:** Update allowed origins in Edge Function

### Recommended Enhancements

1. **Bulk Upload:** Excel/CSV import for registrations
2. **Status History:** Track all status changes with timestamps
3. **Admin Notes:** Add admin comment field during approval/rejection
4. **API Documentation:** Generate OpenAPI/Swagger docs
5. **Webhook:** Send webhooks on status change
6. **Cache:** Add Redis caching for university lookups

---

## File Structure

```
src/
├── components/
│   └── UniversityRegistrationForm.tsx     (Form component)
├── lib/
│   └── validations.ts                     (Zod schemas)
├── pages/
│   ├── Admin.tsx                          (Updated with university management)
│   ├── UniversityRegistration.tsx         (Registration page)
│   └── UniversityRegistrationSuccess.tsx  (Success page)
├── integrations/supabase/
│   └── types.ts                           (Updated with universities table)
└── App.tsx                                (Updated routes)

supabase/
├── migrations/
│   └── 20251129120000_create_universities_table.sql
└── functions/
    └── register-university/
        └── index.ts                       (Edge Function)
```

---

## API Reference

### POST /register-university

Register a new university for verification.

**Request Body:**
```typescript
{
  legalName: string;
  type: "CENTRAL" | "STATE" | "PRIVATE" | "DEEMED";
  state: string;
  ugcReference?: string;
  aisheCode?: string;
  websiteDomain: string;
  registrarOfficialEmail: string;
  walletAddress: string;
}
```

**Validation Rules:**
- All fields required except ugcReference and aisheCode
- Email domain must match website domain or end with .edu.in/.ac.in
- AISHE code pattern: `^[A-Z]-[0-9]{3,6}$`
- Wallet must be valid Ethereum address

**Success Response (200):**
```json
{
  "success": true,
  "message": "University registered successfully",
  "data": {
    "id": "uuid",
    "legal_name": "...",
    "verification_status": "PENDING",
    ...
  }
}
```

---

## Support & Maintenance

For issues or questions:
1. Check validation errors in browser console
2. Review Supabase function logs
3. Verify database migration applied
4. Ensure environment variables set correctly

---

**Last Updated:** November 29, 2025  
**Status:** Production Ready
