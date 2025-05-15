# Wedding Data Migration Script

This script migrates data from top-level Firestore collections to a specific wedding subcollection.

## What the Script Does

1. Copies all documents from the top-level collections:
   - `budget`
   - `settings`
   - `invitees`
   - `tasks`

2. Places them under the specified wedding ID: `vuzRQji2SieDGatQNz0N`
   - Target location: `/weddings/vuzRQji2SieDGatQNz0N/{collection}`

3. Preserves all document IDs and data

## Prerequisites

1. The Firebase project must be properly configured in your environment
2. You must have the necessary permissions to read from source collections and write to the target wedding document

## Running the Migration

### Option 1: Using NPM Script (Recommended)

Run the following command:

```bash
npm run migrate-wedding
```

This will use the simplified CommonJS script that doesn't require TypeScript compilation.

### Option 2: Direct Execution with Node

```bash
node migrateWedding.js
```

### Option 3: Using ts-node with Custom Config

```bash
npx ts-node -P src/scripts/tsconfig.json src/scripts/runMigration.ts
```

## Modifying the Script

If you need to change the target wedding ID or collections to migrate, edit the constants at the top of `src/scripts/migrateToWedding.ts`:

```typescript
const TARGET_WEDDING_ID = "vuzRQji2SieDGatQNz0N";
const COLLECTIONS_TO_MIGRATE = ["budget", "settings", "invitees", "tasks"];
```

## Troubleshooting

- If the migration fails, check the console error messages
- Ensure you have the correct permissions in Firebase
- Verify that the Firebase configuration is correct for your environment
- If a batch fails, the script will continue with subsequent collections
