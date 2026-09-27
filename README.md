# Job Tracker

A Next.js application for tracking job applications across multiple sources. Monitor your job search progress, filter by status, and visualize application statistics.

## 📋 Features

- **Multi-source tracking**: Add and track job applications from different sources (LinkedIn, Jobstreet, Glints, Direct Company)
- **Status management**: Track application status (Pending, Applied, Interview, Rejected, Accepted) with color-coded badges
- **Infinite pagination**: Browse job listings with automatic loading more results
- **Global search**: Search across all job listings by company, position, location, or status
- **Statistics dashboard**: Visual pie chart showing application distribution by status
- **Status editing**: Update application status inline with validation and toast notifications
- **Responsive design**: Works on mobile and desktop with brutalist UI styling

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Next.js 14** - App Router with Server Components and Client Components
- **React** - With SWR for data fetching
- **Tailwind CSS** - With brutalist design utilities (shadow-brutal, border-brutal)
- **Drizzle ORM** - Type-safe SQL queries for PostgreSQL
- **FlexSearch** - Full-text search indexing
- **Recharts** - Statistics chart visualization
- **Phosphor Icons** - Icon set

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (sources, listings, search, stats)
│   ├── detail/[id]/        # Detail page per source
│   ├── components/         # Page-level components (AddSourceDialog, GlobalSearchDialog, StatusStats)
│   ├── globals.css         # Global styles with custom theme variables
│   └── layout.tsx          # Root layout with Toaster
├── components/             # UI components (badge, button, card, dialog, input, label, select, skeleton, textarea, toast)
├── lib/                    # Utility modules
│   ├── status.ts           # Status badge classes and chart colors
│   ├── swr.ts              # SWR query keys and fetcher
│   ├── utils.ts            # cn utility helper
│   └── validation.ts       # Zod schemas for input validation
└── database/               # Drizzle ORM models and connection
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sources` | GET | List all job sources |
| `/api/sources` | POST | Add a new job source |
| `/api/sources/:id/listings/count` | GET | Get total listings count for a source |
| `/api/sources/:id/listings?page=&limit=` | GET | Paginated job listings for a source |
| `/api/search` | GET | Global search across all listings |
| `/api/stats` | GET | Statistics by status |

## 🏷️ Status Values

Supported application statuses:
- `Pending` - Primary (yellow)
- `Applied` - Secondary (purple)
- `Interview` - Warning (amber)
- `Rejected` - Destructive (red)
- `Accepted` - Success (green)

Each status has corresponding badge classes and chart colors defined in `src/lib/status.ts`.

## 🎨 UI Features

The project features a custom brutalist design with:

- Shadow-based depth (shadow-brutal-sm, shadow-brutal, shadow-brutal-lg)
- Custom theme colors in `src/app/globals.css`
- Rounded corners with varying radii
- Interactive hover states with translate animations
- Toast notifications for user feedback
- Dialog modals for add/edit operations

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## 🛢️ Database

Uses Drizzle ORM with PostgreSQL. Key tables:
- `sourceTable` - Job sources (LinkedIn, Jobstreet, etc.)
- `jobListingsTable` - Individual job applications with company, position, location, status, and application date