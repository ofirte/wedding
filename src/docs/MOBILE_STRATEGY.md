# Mobile Support Strategy Guide

## Overview

This guide outlines the comprehensive mobile-first approach implemented in the Wedding Planning app and provides guidelines for maintaining and extending mobile support.

## Architecture Overview

### 1. Responsive Layout System

**Main Components:**

- `App.tsx` - Main container with responsive layout
- `Sidebar.tsx` - Dual-mode sidebar (permanent desktop, temporary mobile)
- `MobileAppBar.tsx` - Mobile-specific navigation bar

**Key Features:**

- Mobile-first design with progressive enhancement
- Breakpoint-based responsive behavior
- Touch-friendly interface elements
- Consistent spacing and typography scaling

### 2. Responsive Utilities (`src/utils/ResponsiveUtils.ts`)

**Central Hook: `useResponsive()`**

```typescript
const { isMobile, isTablet, isDesktop, isXs, isSm, isMd, isLg } =
  useResponsive();
```

**Pre-defined Patterns:**

- `responsivePatterns` - Common responsive styles
- `gridColumns` - Standard grid configurations
- `touchConfig` - Touch-friendly settings

## Implementation Strategy

### 1. Breakpoint System

**Material-UI Breakpoints:**

- `xs`: 0px - 600px (Mobile phones)
- `sm`: 600px - 900px (Tablets portrait)
- `md`: 900px - 1200px (Tablets landscape, small laptops)
- `lg`: 1200px - 1536px (Desktop)
- `xl`: 1536px+ (Large desktop)

**Our Usage:**

- Mobile: `xs` and `sm` (0-900px)
- Desktop: `md` and up (900px+)

### 2. Component Patterns

#### A. Layout Components

```typescript
// Responsive container
<Box sx={{
  py: { xs: 2, md: 4 },
  px: { xs: 1, sm: 2, md: 3 }
}}>
  {content}
</Box>

// Responsive grid
<Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    {item}
  </Grid>
</Grid>
```

#### B. Navigation Components

```typescript
// Conditional rendering
{
  isMobile ? <MobileAppBar /> : <DesktopHeader />;
}

// Responsive sidebar
<Drawer variant={isMobile ? "temporary" : "permanent"} />;
```

#### C. Typography and Sizing

```typescript
// Responsive typography
<Typography sx={{
  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
  textAlign: { xs: 'center', md: 'left' }
}}>
  {title}
</Typography>

// Responsive buttons
<Button sx={{
  minHeight: { xs: 44, sm: 'auto' },
  width: { xs: '100%', sm: 'auto' }
}}>
  {label}
</Button>
```

## Best Practices

### 1. Mobile-First Approach

- Start with mobile design and scale up
- Use progressive enhancement
- Ensure touch targets are at least 44px (iOS guidelines)

### 2. Performance Considerations

```typescript
// Lazy load mobile-specific components
const MobileComponent = lazy(() => import('./MobileComponent'));

// Use keepMounted for better mobile performance
<Drawer ModalProps={{ keepMounted: true }}>
```

### 3. Touch Interactions

- Implement swipe gestures where appropriate
- Use larger touch targets
- Provide visual feedback for interactions

### 4. Content Strategy

- Prioritize essential content on mobile
- Use progressive disclosure
- Implement infinite scroll or pagination for large lists

## Implementation Checklist

### For New Components:

- [ ] Use `useResponsive()` hook for breakpoint detection
- [ ] Implement responsive spacing with sx prop
- [ ] Test on multiple screen sizes
- [ ] Ensure touch targets meet minimum size requirements
- [ ] Verify text readability on small screens
- [ ] Test interaction patterns (tap, scroll, swipe)

### For Existing Components:

- [ ] Add responsive spacing patterns
- [ ] Update grid layouts for mobile
- [ ] Implement mobile-specific navigation
- [ ] Optimize typography for small screens
- [ ] Test and fix layout issues

## Common Responsive Patterns

### 1. Card Layouts

```typescript
// Mobile: Stack vertically, Desktop: Grid layout
<Grid container spacing={{ xs: 2, md: 3 }}>
  {items.map((item) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
      <Card sx={responsivePatterns.cardPadding}>{content}</Card>
    </Grid>
  ))}
</Grid>
```

### 2. Form Layouts

```typescript
// Mobile: Full width, Desktop: Side by side
<Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }}>
  <TextField fullWidth />
  <TextField fullWidth />
</Stack>
```

### 3. Action Buttons

```typescript
// Mobile: Full width stack, Desktop: Inline
<Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    gap: { xs: 1, sm: 2 },
    "& > *": { width: { xs: "100%", sm: "auto" } },
  }}
>
  <Button variant="contained">Primary</Button>
  <Button variant="outlined">Secondary</Button>
</Box>
```

## Testing Strategy

### 1. Device Testing

- Test on actual devices when possible
- Use browser dev tools for different screen sizes
- Test touch interactions with actual fingers

### 2. Breakpoint Testing

- Test all major breakpoints (320px, 768px, 1024px, 1440px)
- Ensure no horizontal overflow
- Verify readable font sizes

### 3. Performance Testing

- Test on slower mobile devices
- Monitor bundle size impact
- Use React DevTools Profiler

## Maintenance Guidelines

### 1. Regular Audits

- Review components quarterly for responsive issues
- Update patterns as design system evolves
- Monitor analytics for mobile usage patterns

### 2. Documentation Updates

- Keep this guide updated with new patterns
- Document any breaking changes
- Maintain component examples

### 3. Team Guidelines

- All PRs should include mobile testing
- Use responsive utilities consistently
- Follow established patterns

## Common Issues and Solutions

### 1. Horizontal Scroll

**Problem:** Content overflows on mobile
**Solution:** Use `overflow: 'hidden'` and proper responsive spacing

### 2. Tiny Touch Targets

**Problem:** Buttons too small for mobile
**Solution:** Use `touchConfig.minTouchTarget` for minimum sizes

### 3. Poor Typography

**Problem:** Text too small or too large on mobile
**Solution:** Use responsive font sizing patterns

### 4. Layout Breaking

**Problem:** Components don't adapt to screen size
**Solution:** Use responsive grid systems and flex layouts

## Future Considerations

1. **PWA Features:** Consider implementing PWA capabilities
2. **Offline Support:** Add offline functionality for key features
3. **Native App:** Consider React Native migration path
4. **Accessibility:** Ensure WCAG compliance across all devices
5. **Performance:** Implement code splitting for mobile optimization

## Resources

- [Material-UI Responsive Documentation](https://mui.com/system/responsive/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design Guidelines](https://material.io/design)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
