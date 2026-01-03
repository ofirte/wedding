# Vite + pnpm Migration Instructions

## Configuration Complete! ✅

All configuration files have been created and updated. Here's what was done:

### Files Created:
- ✅ `vite.config.ts` - Vite configuration with backwards compatibility
- ✅ `vitest.config.ts` - Vitest test configuration
- ✅ `tsconfig.node.json` - TypeScript config for config files
- ✅ `src/vite-env.d.ts` - Vite environment type definitions
- ✅ `.eslintrc.cjs` - ESLint configuration for Vite
- ✅ `pnpm-workspace.yaml` - pnpm workspace configuration
- ✅ `.npmrc` - pnpm settings
- ✅ `.env.template` - Environment variable template
- ✅ `index.html` - Moved from public/ and updated for Vite

### Files Updated:
- ✅ `package.json` - Scripts updated for Vite/pnpm
- ✅ `shared/package.json` - Workspace protocol + pnpm scripts
- ✅ `functions/package.json` - Workspace protocol + pnpm scripts
- ✅ `tsconfig.json` - Modern ES2020 target, Vite types
- ✅ `src/setupTests.ts` - Vitest imports
- ✅ `src/App.test.tsx` - Vitest test syntax

---

## Next Steps - Action Required!

### Step 1: Update Your Environment Variables

You need to update your `.env.development` and `.env.production` files:

**Option A: Dual Format (Recommended for Migration)**
Add VITE_ prefixed variables while keeping REACT_APP_ for backwards compatibility:

```env
# .env.development
VITE_FIREBASE_API_KEY=your_dev_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wedding-c89a1
VITE_FIREBASE_STORAGE_BUCKET=wedding-c89a1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_APP_ENV=development

# Backwards compatibility (optional during migration)
REACT_APP_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
REACT_APP_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
REACT_APP_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
REACT_APP_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
REACT_APP_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
REACT_APP_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
REACT_APP_ENV=${VITE_APP_ENV}
```

Do the same for `.env.production` with production values.

### Step 2: Remove Old Dependencies and Install with pnpm

Run these commands in your terminal:

```bash
# Remove old node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf shared/node_modules shared/package-lock.json
rm -rf functions/node_modules functions/package-lock.json

# Remove CRA and packages we don't need anymore
pnpm remove react-scripts env-cmd @types/jest

# Install all dependencies with pnpm
pnpm install
```

### Step 3: Build the Shared Package

```bash
pnpm --filter @wedding-plan/types build
```

### Step 4: Start the Development Server

```bash
pnpm dev
```

or

```bash
pnpm start
```

The dev server should start on http://localhost:3000

---

## Validation Checklist

Once the dev server starts, verify:

- [ ] Dev server starts successfully on port 3000
- [ ] No console errors in the browser
- [ ] Hot Module Replacement (HMR) works (make a small change and save)
- [ ] Authentication works (login/logout)
- [ ] Firebase connection established
- [ ] RTL content displays correctly (Hebrew/Arabic)
- [ ] All routes are accessible
- [ ] Material-UI components render correctly
- [ ] Drag-drop functionality works
- [ ] Calendar displays
- [ ] All major features work

### Run Tests

```bash
pnpm test:run
```

### Test Production Build

```bash
pnpm build:prod
pnpm preview
```

---

## Troubleshooting

### Issue: "Cannot find module 'vite'"
**Solution**: Make sure you ran `pnpm install` successfully

### Issue: Environment variables are undefined
**Solution**:
1. Check that your `.env.development` and `.env.production` files have VITE_ prefixed variables
2. Restart the dev server
3. Check `vite.config.ts` define section

### Issue: TypeScript errors about unused variables
**Solution**: The new tsconfig.json has stricter linting. You can:
- Fix the issues (recommended)
- Temporarily disable in `.eslintrc.cjs`
- Add `// @ts-ignore` comments (not recommended)

### Issue: "Module not found" errors
**Solution**: Make sure `pnpm --filter @wedding-plan/types build` completed successfully

### Issue: HMR not working
**Solution**:
1. Check that you're using `pnpm dev` not `pnpm start`
2. Clear browser cache
3. Check for any console errors

---

## Performance Comparison

After migration, you should see:

| Metric | Before (CRA) | After (Vite) | Improvement |
|--------|--------------|--------------|-------------|
| Dev server startup | ~20-30s | ~2-5s | 🚀 10x faster |
| HMR | ~3-5s | ~100-500ms | 🚀 6x faster |
| Production build | ~90-120s | ~45-60s | 🚀 2x faster |

---

## Deployment

Once you've validated everything works locally:

### Deploy to Development

```bash
pnpm deploy:dev
```

### Deploy to Production

```bash
pnpm deploy:prod
```

### Deploy Both Hosting and Functions

```bash
pnpm deploy:prod:both
```

---

## Post-Migration Cleanup (Optional)

After confirming everything works:

1. **Remove backwards compatibility** from `vite.config.ts` define section
2. **Update code** to use `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`
3. **Remove old .env format** - keep only VITE_ variables
4. **Delete public/index.html** (we moved it to root)

---

## Rollback Plan

If something goes wrong:

```bash
# Switch back to main branch
git checkout main

# Delete migration branch
git branch -D migration/vite-pnpm

# Reinstall with npm
npm install
npm start
```

---

## Questions or Issues?

Refer to the detailed migration plan at: `~/.claude/plans/gleaming-splashing-hopcroft.md`

Or check the official docs:
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- pnpm: https://pnpm.io/
