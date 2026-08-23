# ZOOM_AUDIT — Regional Anatomy UI

Last audited: V2.4. Automated tests verify that every file exists, every dot is
within bounds, every dot belongs to its region, and every interactive non-shoulder
muscle is covered. Human visual review was applied to known overlap defects.

## Shared Label System
- Full body: explicit left/right one-line label columns outside the art;
  `BODY_REGION_HOTSPOTS.labelY` controls collision-free order. Straight dotted
  full-canvas SVG connectors lead from labels to dots. Body size reserves gutters.
- Zoom diagrams: full-canvas dotted leader lines, one edge label per canonical
  muscle, bilateral dots sharing one label, collision-aware vertical distribution,
  and separate keyboard-focusable dot/label buttons.

## Region Matrix
| Region | Artwork | Muscles | UI notes / result |
|---|---|---:|---|
| Shoulder | `shoulder.webp` | 9 | No text on image. 3 deltoids in Surface group; trapezius/rotator cuff in separate supporting group. Duplicate Explorer chip row disabled. |
| Chest | `region-chest.webp` | 3 | Upper/middle/lower sections vertically separated; left labels collision-free. |
| Back | `region-back.webp` | 3 | Bilateral lats share label; rhomboids/erectors separated. Portrait max-width constrained. |
| Biceps | `region-arms.webp` | 2 | Biceps + brachialis labels collision-distributed. Full-body Biceps marker moved to upper arm y34%. |
| Triceps | `region-arms.webp` | 1 | Bilateral posterior arm dots share one label; full-body marker y35%. |
| Forearms | `region-forearms.webp` | 3 | Dedicated art. Detected centers: brachioradialis 24.4/39.6, flexors 30.3/47.4, extensors 70.5/47.9. |
| Core | `region-core.webp` | 3 | Abs/obliques/transverse label distribution; full-body marker directly below chest y43%. |
| Glutes | `region-glutes.webp` | 2 | Bilateral medius/maximus dots share labels. |
| Legs | `region-legs.webp` | 5 | Front/back split panel; quads/adductors on left, hamstrings/calves/soleus right; min-gap adapts for crowded labels. |

## Regression Checklist After Artwork Changes
1. Ensure image aspect matches configured Tailwind `aspect-*`.
2. Re-run color-centroid detection or manually verify dot percentages.
3. Confirm every `getInteractiveMuscles(region)` id appears in diagram dots.
4. Check 375px, 768px, 1440px widths in light and dark themes.
5. Check keyboard tab order and selected-state contrast.
6. Check labels do not cover muscle target dots or each other.
7. Run domain tests and production build.
