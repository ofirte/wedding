# Wedding Plan Application - AI Coding Guidelines

## Architecture Overview

This is a React + Firebase wedding planning app with multi-tenant architecture. Each wedding is isolated in its own Firestore subcollection (`weddings/{weddingId}/*`).

**Key architectural patterns:**

- Wedding-scoped data isolation via `weddingFirebase` service
- React Query for state management with custom wedding hooks
- Migration framework for data transformations
- Dual environment setup (dev/prod Firebase projects)
- Twilio-based messaging through Firebase Functions

## Core Development Patterns

### Data Access Layer

Always use the `weddingFirebase` service from `src/api/weddingFirebaseHelpers.ts` for Firestore operations:

```typescript
// ✅ Correct - wedding-scoped operations
await weddingFirebase.addDocument("invitees", inviteeData);
await weddingFirebase.updateDocument("rsvp", rsvpId, updates);

// ❌ Avoid - direct Firestore calls lose wedding context
import { db } from "./firebaseConfig";
```

### Custom Hook Patterns

Use `useWeddingQuery` and `useWeddingMutation` wrappers that auto-inject wedding ID from route params:

```typescript
// ✅ Wedding-aware hooks pattern
import { useWeddingQuery, useWeddingMutation } from "../common";

const useInvitees = () =>
  useWeddingQuery({
    queryKey: ["invitees"],
    queryFn: (weddingId) => getInvitees(weddingId),
  });

const useUpdateInvitee = () =>
  useWeddingMutation({
    mutationFn: (variables, weddingId) => updateInvitee(variables, weddingId),
  });
```

### Firebase Environment Handling

The app uses environment-based Firebase config switching. Configuration is determined by:

1. `REACT_APP_ENV=production` env var
2. Hostname detection (`weddingplanstudio.web.app`)
3. Fallback to hardcoded configs in `firebaseConfig.ts`

## Component Organization

### Route Structure

Protected routes follow nested pattern: `/wedding/:weddingId/[module]`

- Authentication wraps all `/wedding/*` routes
- Wedding context established at `:weddingId` level
- Each module (invitees, budget, rsvp, etc.) is self-contained

### Responsive Design

Uses Material-UI breakpoints with mobile-first approach:

- Mobile: drawer navigation with `MobileAppBar`
- Desktop: persistent sidebar with `Sidebar` component
- Responsive patterns in `utils/ResponsiveUtils.ts`

## Internationalization (i18n)

Bilingual support (English/Hebrew) with RTL handling:

```typescript
// ✅ Use translation hook in components
const { t, isRtl } = useTranslation();
const title = t("invitees.title");

// Translation keys use dot notation: 'section.subsection.key'
// Files: src/localization/translations/[en|he].ts
```

## External Integrations

### Google Contacts API

OAuth 2.0 flow for contact matching:

- Requires `REACT_APP_GOOGLE_CLIENT_ID` env var
- Uses Google Identity Services + gapi client
- Pattern: request permission → fetch all contacts → match phone numbers

### Twilio Messaging (Firebase Functions)

WhatsApp/SMS messaging through Firebase Functions:

- Functions in `functions/src/` with Express API
- Template-based messaging with variable substitution
- Endpoints: `/messages/send-message`, `/messages/send-sms`

## Migration Framework

Structured data migration system in `src/migrations/`:

- Extend `BaseMigration` class for new migrations
- Dry-run capability and rollback support
- Wedding-scoped migrations with progress tracking
- Register in `MigrationManager` component

## Development Workflows

### Build Commands

```bash
npm start                    # Dev mode (development Firebase)
npm run build:dev           # Build with dev Firebase config
npm run build:prod          # Build with prod Firebase config
npm run deploy:dev          # Deploy to development environment
npm run deploy:prod         # Deploy to production environment
```

### Firebase Functions

```bash
cd functions && npm run watch    # TypeScript compilation
npm run emulate                  # Local function emulation
```

## Common Pitfalls

### Wedding ID Context

- Never hardcode wedding IDs - always use route params or hooks
- API functions should accept optional `weddingId` parameter
- Components inside `/wedding/:weddingId` routes automatically get context

### TypeScript Types

- API types are co-located with their modules (e.g., `rsvpQuestionsTypes.ts`)
- Wedding entity always includes Firebase metadata: `{ id: string, ...data }`

### State Management

- Use React Query for server state, local state for UI only
- Wedding-scoped query keys pattern: `['entity-name', weddingId]`
- Invalidation on mutations handled by wedding hooks

### Firebase Security

- All data is wedding-scoped - security rules enforce tenant isolation
- User must be wedding member to access wedding data
- No global data access patterns

### Mobile Considerations

- Touch-friendly interaction patterns
- Drawer navigation for small screens
- Image upload handling for wedding photos/invitations
