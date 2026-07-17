## Design System: KesbYar Pinterest

### Design Dials
- **Variance:** 8/10 ΓÇö Bold / Asymmetric
- **Motion:** 7/10 ΓÇö Standard
- **Density:** 2/10 ΓÇö Spacious

### Pattern
- **Name:** AI Personalization Landing
- **Conversion Focus:** 20%+ conversion with personalization. Requires analytics integration. Fallback for new users.
- **CTA Placement:** Context-aware placement based on user segment
- **Color Strategy:** Adaptive based on user data. A/B test color variations per segment.
- **Sections:** 1. Dynamic hero (personalized), 2. Relevant features, 3. Tailored testimonials, 4. Smart CTA

### Style
- **Name:** Bento Grids
- **Mode Support:** Light Γ£ô Full | Dark Γ£ô Full
- **Keywords:** Apple-style, modular, cards, organized, clean, hierarchy, grid, rounded, soft
- **Best For:** Product features, dashboards, personal sites, marketing summaries, galleries
- **Performance:** ΓÜí Excellent | **Accessibility:** Γ£ô WCAG AA

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#7C3AED` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#6366F1` | `--color-secondary` |
| Accent/CTA | `#D97706` | `--color-accent` |
| Background | `#FAF5FF` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#F7F3FD` | `--color-muted` |
| Border | `#EFE7FC` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#7C3AED` | `--color-ring` |

*Notes: Mood purple + insight amber*

### Typography
- **Heading:** Outfit
- **Body:** Work Sans
- **Mood:** geometric, modern, clean, balanced, contemporary, versatile
- **Best For:** General purpose, portfolios, agencies, modern brands, landing pages
- **Google Fonts:** https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Hover scale (1.02), soft shadow expansion, smooth layout shifts, content reveal

### Motion
**Stagger List** (Standard) ΓÇö Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`
```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```
*Framework notes: grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger*
- Γ£à Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- Γ¥î Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI

### Avoid (Anti-patterns)
- Excessive animation
- Dark mode by default

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

