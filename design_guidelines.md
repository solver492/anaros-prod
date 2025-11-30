# Design Guidelines: Anaros ERP - Beauty Center Management Platform

## Design Approach
**System Selected**: Shadcn/UI + Tailwind (as specified) with custom refinements for beauty industry aesthetics
**Rationale**: Utility-focused enterprise application requiring efficiency and clarity, enhanced with elegant touches befitting a premium beauty center

## Core Design Principles
1. **Clarity First**: Data-dense interfaces (dashboards, calendars) prioritize legibility and scannability
2. **Elegant Refinement**: Subtle sophistication through spacing, typography, and color accents
3. **Role-Adaptive UI**: Interface elements adjust based on user permissions without cluttering the view
4. **Touch-Optimized**: Employee mobile views use generous tap targets (minimum 44px)

## Color System

### Primary Palette (Beauty Center Theme)
- **Primary Rose**: `#E8B4B8` (rose poudré) - Main brand color, CTAs, active states
- **Accent Gold**: `#D4AF37` - Premium highlights, VIP client indicators, success states
- **Deep Rose**: `#C5959A` - Hover states, secondary elements

### Functional Colors
- **Neutrals**: Gray-50 to Gray-900 for backgrounds, text, borders
- **Success**: Emerald-500 for completed appointments
- **Warning**: Amber-500 for pending states
- **Error**: Red-500 for cancellations
- **Info**: Blue-500 for notifications

### Employee Color Codes
Each staff member has an assigned hex color displayed in:
- Calendar columns (as background with 20% opacity)
- Avatar borders
- Appointment event blocks

## Typography

### Font Stack
- **Primary**: `Inter` (Google Fonts) - Clean, professional, excellent screen readability
- **Accent**: `Playfair Display` (Google Fonts) - Serif for dashboard headings only, adds elegance

### Hierarchy
- **H1 (Dashboard Titles)**: text-4xl font-bold Playfair Display
- **H2 (Section Headings)**: text-2xl font-semibold Inter
- **H3 (Card Titles)**: text-lg font-medium
- **Body**: text-base leading-relaxed
- **Small Labels**: text-sm text-gray-600
- **Stats/Numbers**: text-3xl font-bold tabular-nums

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-3
- Standard: p-4, gap-4, m-6
- Generous sections: p-8, py-12, gap-16

### Grid System
- **Sidebar**: Fixed 280px width on desktop, collapsible to icon-only on tablet
- **Main Content**: Full width with max-w-7xl container, px-4 md:px-8
- **Dashboard Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- **Calendar**: Full viewport height minus header (h-[calc(100vh-4rem)])

## Component Library

### Navigation Sidebar
- Dark background (gray-900) with subtle gradient
- Icons from Lucide React
- Active state: Primary rose background, rounded-lg
- Hover: gray-800 transition
- Role-based menu items hidden via conditional rendering
- User profile section at bottom with avatar, name, role badge

### Dashboard KPI Cards
- White background, rounded-xl, shadow-sm
- Icon in circle (56px) with primary rose background at 10% opacity
- Large stat number (text-3xl bold) above label
- Micro trend indicator (↑ 12% icon + text) in top-right
- Border-l-4 with accent color for visual distinction

### Calendar (FullCalendar)
- **Resource columns**: Employee name + avatar at top, full-height color-coded background (20% opacity)
- **Time slots**: 30-minute intervals, 9h-20h range
- **Event blocks**: Rounded corners, drop shadow on hover, client name + service abbreviated
- **Current time indicator**: Red line with animated pulse
- **Empty slots**: Subtle dashed border on hover to indicate clickability

### Modal/Dialog (Appointment Creation)
- Overlay: backdrop-blur-sm bg-black/30
- Content: max-w-2xl, rounded-2xl, shadow-2xl
- Multi-step indicator at top (1. Client → 2. Service → 3. Staff)
- Form inputs: Shadcn/UI components with rose focus rings
- Employee selection: Grid of cards with avatar, name, and availability indicator (green dot)
- "Employees shown match selected service skills" helper text

### Client Cards
- Horizontal layout: Avatar (left) + Info (center) + Actions (right)
- Lifetime value badge in gold if top 10% spender
- Phone number with click-to-call icon
- Last visit date in small gray text
- Hover: Subtle lift with shadow-md transition

### Tables (Dashboard Rankings)
- Striped rows (even rows gray-50)
- Sticky header with gray-100 background
- Rank column with medal icons (🥇🥈🥉) for top 3
- Money values right-aligned with DA currency symbol
- Hover row: bg-rose-50 transition

### Employee Schedule (Mobile View)
- Timeline design: Vertical line on left with time markers
- Card per appointment: Large text for client name, service below in gray
- Status badge (Confirmed/Pending) top-right
- Swipe-to-reveal actions (Complete/Cancel) - use react-swipeable
- Current appointment highlighted with rose border-l-4

### Buttons
- **Primary**: bg-rose-400 hover:bg-rose-500, rounded-lg, px-6 py-3, font-medium, shadow-sm
- **Secondary**: border-2 border-rose-400 text-rose-600 hover:bg-rose-50
- **Danger**: bg-red-600 hover:bg-red-700 (delete actions with confirmation)
- **Icon-only**: p-2 rounded-md hover:bg-gray-100 (table actions)

### Form Inputs (Shadcn/UI)
- Consistent h-11 height
- Border-gray-300, focus:ring-2 focus:ring-rose-400
- Labels: text-sm font-medium mb-2
- Errors: text-red-600 text-xs mt-1
- Select dropdowns: Custom arrow icon, max-height with scroll for long lists

### Notifications/Toasts
- Position: top-right, stack vertically
- Design: White background, rounded-xl, shadow-lg, border-l-4 (color by type)
- Icon + message + timestamp + dismiss button
- Auto-dismiss after 5s with progress bar at bottom

## Responsive Breakpoints
- **Mobile**: < 768px - Single column, hamburger menu, simplified tables
- **Tablet**: 768px-1024px - Sidebar icons only, 2-column grids
- **Desktop**: > 1024px - Full sidebar, multi-column layouts

## Images
**No hero images required** - This is a business application, not a marketing site.

**Where images appear**:
- User/employee avatars (circular, 40px standard, 64px in profiles)
- Client profile photos (optional, circular)
- Empty states: Illustration-style SVGs (e.g., "No appointments today" with calendar graphic)

## Animations
**Minimal and purposeful only**:
- Page transitions: Fade in (200ms ease)
- Modal entry: Scale from 95% to 100% (150ms)
- Notification slide-in from right (300ms)
- Calendar event drag: Opacity 0.8 during drag
- **Avoid**: Excessive hover effects, unnecessary micro-interactions

## Accessibility
- ARIA labels on all icon-only buttons
- Keyboard navigation: Tab order logical, visible focus states (ring-2 ring-rose-400)
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Screen reader announcements for calendar updates and notifications
- Touch targets: Minimum 44x44px on mobile