# Anaros ERP - Beauty Center Management Platform

## Overview

Anaros ERP is a comprehensive Single Page Application (SPA) designed for managing beauty center operations. The platform provides intelligent appointment scheduling, employee management, client tracking, and business analytics for the Anaros Beauty Center.

**Core Purpose:** Centralized management system for beauty salon operations including appointment booking, staff scheduling, client management, service catalog, and business intelligence dashboards.

**Tech Stack:** React + TypeScript frontend with Vite, Express.js backend, PostgreSQL database via Neon serverless, FullCalendar for scheduling, Shadcn/UI + Tailwind CSS for design system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and developer experience
- Vite as the build tool for fast development and optimized production builds
- Single Page Application (SPA) architecture with client-side routing via Wouter
- Component-based architecture using functional components and React hooks

**State Management Strategy**
- TanStack Query (React Query) for server state management, data fetching, and caching
- React Context API for authentication state (AuthContext)
- Local component state for UI interactions
- No global state management library (Redux/Zustand) - relies on React Query's caching

**UI Component System**
- Shadcn/UI component library providing pre-built, accessible components
- Radix UI primitives for headless, accessible component foundations
- Tailwind CSS utility-first styling with custom design tokens
- Custom theme system supporting light/dark modes via CSS variables
- Beauty industry aesthetic with rose/gold color palette defined in design guidelines

**Routing & Navigation**
- Wouter for lightweight client-side routing
- Role-based route protection via ProtectedRoute wrapper component
- Routes: `/login`, `/dashboard`, `/calendar`, `/clients`, `/services`, `/users`, `/my-schedule`
- Sidebar navigation with role-based menu item visibility

**Calendar & Scheduling**
- FullCalendar library with resource-timegrid plugin for staff scheduling
- Resource-based view showing appointments per employee
- Interactive drag-and-drop appointment creation
- Color-coded by employee with configurable hex colors

### Backend Architecture

**Server Framework**
- Express.js HTTP server with TypeScript
- RESTful API design pattern
- Session-based authentication (localStorage on client)
- JSON request/response format

**API Structure**
- `/api/auth/*` - Authentication endpoints (login)
- `/api/profiles/*` - Employee/user management
- `/api/clients/*` - Client management
- `/api/services/*` - Service catalog management
- `/api/appointments/*` - Appointment CRUD operations
- `/api/dashboard/*` - Analytics and KPI endpoints

**Database Access Layer**
- Storage abstraction interface (IStorage) defined in `server/storage.ts`
- Drizzle ORM for type-safe database queries
- Schema-first design with Drizzle schema definitions
- Database migrations managed via drizzle-kit

**Authentication & Authorization**
- Role-Based Access Control (RBAC) with 4 roles: superadmin, admin, reception, staff
- Password-based authentication (email/password)
- Session persistence via localStorage (client-side)
- Role-based UI rendering and API endpoint protection

### Data Storage

**Database System**
- PostgreSQL database hosted on Neon serverless platform
- Connection via `@neondatabase/serverless` package
- Environment variable configuration (`DATABASE_URL`)

**Schema Design**

Core tables:
- `profiles` - Users/employees with roles, color codes, credentials
- `service_categories` - Service groupings (e.g., facial, nails, hair)
- `services` - Service catalog with pricing, duration, category linkage
- `clients` - Customer information with contact details and notes
- `appointments` - Booking records linking staff, clients, services with timestamps and status
- `staff_skills` - Many-to-many relationship between staff and service categories

**Data Relationships**
- Appointments reference profiles (staff), clients, and services
- Services belong to categories
- Staff have skills (categories they can perform)
- ProfileWithSkills type joins profiles with their skill categories
- ServiceWithCategory type joins services with category details
- AppointmentWithDetails type includes full client, staff, and service information

### External Dependencies

**Database & Backend Services**
- Neon Serverless PostgreSQL - Cloud-hosted PostgreSQL database
- Drizzle ORM - TypeScript ORM for database queries and migrations

**Frontend Libraries**
- FullCalendar - Interactive calendar and scheduling UI
  - `@fullcalendar/react` - React wrapper
  - `@fullcalendar/resource-timegrid` - Resource-based timeline view
  - `@fullcalendar/interaction` - Drag-and-drop interactions
- TanStack Query - Server state management and data synchronization
- Wouter - Lightweight client-side routing
- React Hook Form - Form state management with validation
- Zod - Schema validation for forms and API payloads

**UI Component Dependencies**
- Radix UI - 20+ accessible component primitives (dialog, dropdown, select, etc.)
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Component variant styling
- Lucide React - Icon library

**Development Tools**
- TypeScript - Static typing
- Vite - Build tool and dev server
- ESBuild - Production bundler for server code
- PostCSS + Autoprefixer - CSS processing

**Fonts**
- Google Fonts: Inter (primary sans-serif), Playfair Display (accent serif for headings)

**Deployment Platform**
- Replit - Primary hosting environment
- Custom build script bundling client (Vite) and server (ESBuild)
- Static file serving from Express for production builds