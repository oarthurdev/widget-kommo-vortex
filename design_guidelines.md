# Design Guidelines: Kommo Tag Analytics Widget

## Design Approach

**Selected Approach:** Design System - Material Design  
**Justification:** This is a data-intensive CRM analytics widget requiring clear information hierarchy, consistent data visualization patterns, and optimal readability for productivity-focused users. Material Design's robust component system and proven patterns for dashboards and analytics make it ideal for this use case.

**Key Design Principles:**
1. Information clarity over decoration
2. Scannable data hierarchy with strong typography
3. Purposeful use of space to group related metrics
4. Consistent interaction patterns across all widget views

---

## Core Design Elements

### A. Typography

**Font Family:**
- Primary: Roboto (via Google Fonts CDN)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Display Numbers (Tag Count): 3.5rem (56px), font-weight: 700, letter-spacing: -0.02em
- Section Headings: 1.25rem (20px), font-weight: 600
- Tag Names: 1rem (16px), font-weight: 500
- Lead Counts: 0.875rem (14px), font-weight: 400
- Supporting Text: 0.75rem (12px), font-weight: 400

**Hierarchy Rules:**
- Display numbers should dominate visually with maximum weight and size
- Tag names use medium weight for easy scanning
- Metrics and counts use regular weight for supporting information

---

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (e.g., p-2, m-4, gap-6, py-8)

**Widget Container:**
- Maximum width: 100% of card container (responsive to Kommo's interface)
- Padding: p-6 on desktop, p-4 on mobile
- Internal sections: space-y-6

**Card Layout Structure:**
1. **Header Section:** Displays total tag count with label
   - py-4, text-center
   - Gap between number and label: gap-2

2. **Tag List Section:** Scrollable list of tags with metrics
   - max-h-96, overflow-y-auto
   - Each tag item: p-4, space-y-2
   - Gap between items: space-y-3

3. **Settings Section:** Form layout for configuration
   - space-y-4 between form groups
   - Label-input pairs with gap-1

**Grid System:**
- Tag list items use vertical stacking (single column)
- Progress indicators span full width
- Metrics display as inline elements within each tag item

---

### C. Component Library

**1. Dashboard Header**
- Large display number centered with subtle container
- Descriptive label beneath number
- Optional subtitle for context ("Active Tags" or similar)

**2. Tag List Items**
Components per item:
- Tag name (primary text, left-aligned)
- Lead count badge (inline, right-aligned)
- Progress bar showing distribution percentage
- Percentage indicator (small text, right-aligned above bar)

Structure:
```
[Tag Name                    123 leads]
[████████████░░░░░░░░░░] 45%
```

**3. Progress Bars**
- Height: h-2
- Border radius: rounded-full
- Background: semi-transparent container
- Fill: solid indicator (varies by percentage)
- Width: w-full

**4. Metric Badges**
- Pill-shaped containers: rounded-full, px-3, py-1
- Inline with tag names
- Text: font-weight: 500

**5. Empty State**
- Centered vertically and horizontally
- Icon (from Heroicons - folder-open or tag)
- Message: "No active tags found"
- Secondary text explaining how to add tags

**6. Settings Form Elements**
- Text inputs: w-full, px-4, py-2, rounded-lg
- Input labels: text-sm, font-medium, mb-1
- Submit button: w-full, py-3, rounded-lg, font-medium
- Help text: text-xs, mt-1

**7. Loading States**
- Skeleton loaders for tag list items
- Pulsing animation on placeholders
- Height matches actual content (h-20 per item)

**8. Error States**
- Alert container with icon (Heroicons - exclamation-triangle)
- Error message with retry action button
- Border-l-4 accent on left side

---

### D. Icon Library

**Selected Library:** Heroicons (via CDN)

**Icons Used:**
- Tag icon: For empty states and headers
- Chart-bar: For analytics indicators
- Cog: For settings access
- Exclamation-triangle: For error states
- Refresh: For reload actions
- Check-circle: For success confirmations

**Icon Sizing:**
- Large display icons: w-12 h-12
- Inline icons: w-5 h-5
- Small indicators: w-4 h-4

---

### E. Interaction Patterns

**Hover States:**
- Tag list items: Subtle background change on hover
- Progress bars: Tooltip showing exact count on hover
- Buttons: Slight opacity change (hover:opacity-90)

**Active States:**
- Tag items: Can be clicked to filter/view details
- Active state: Distinct styling (border or background accent)

**Loading Behavior:**
- Smooth skeleton loading on initial data fetch
- Progress bars animate from 0 to target width
- Fade-in animation for content (duration-300)

**Scrolling:**
- Tag list: Custom scrollbar styling (thin, low opacity)
- Smooth scroll behavior
- Sticky header option if list is long

---

### F. Responsive Behavior

**Mobile (< 768px):**
- Reduce padding: p-4
- Font sizes scale down 10-15%
- Progress bars remain full width
- Stack any horizontal elements

**Tablet (768px - 1024px):**
- Standard spacing maintained
- Optimal for sidebar integration

**Desktop (> 1024px):**
- Maximum spacing for breathing room
- Larger display numbers
- Comfortable tag list item heights (min-h-20)

---

### G. Data Visualization

**Progress Bars:**
- Use varying lengths to show relative distribution
- Smooth transitions when data updates (transition-all duration-500)
- Clear percentage indicators

**Number Display:**
- Large, bold total count
- Secondary metrics in smaller, lighter text
- Group thousands with commas (e.g., "1,234")

**Distribution Logic:**
- Sort tags by lead count (descending) by default
- Option to sort alphabetically
- Show top N tags if list is very long (with "Show more" expansion)

---

## Widget-Specific Guidelines

**Card Integration:**
- Widget fits within Kommo's card tab system
- Respects Kommo's interface width constraints
- Seamless visual integration with native Kommo components

**Settings Page:**
- Simple form layout with clear labels
- API connection status indicator
- Save confirmation feedback
- Link to Kommo documentation

**Performance Considerations:**
- Lazy load tag list items if count exceeds 50
- Virtual scrolling for very long lists
- Debounce any search/filter inputs (300ms)

---

## Quality Standards

- All text must be readable against backgrounds
- Touch targets minimum 44x44px for mobile
- Keyboard navigation support for all interactive elements
- ARIA labels for screen readers on progress bars and metrics
- Focus indicators clearly visible
- Loading states for all async operations