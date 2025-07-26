# QuestLink

**Real-World Quests. Real-Time Connections.**

A freelance marketplace platform inspired by anime guild boards, reimagined as a professional, real-world tool for connecting people who need help with tasks or services with individuals or businesses who can fulfill them.

## 🎯 Project Overview

QuestLink serves both individuals and small business owners, allowing them to offer services, find reliable help, or build connections in a streamlined environment. While the branding takes subtle inspiration from the "quest board" concept seen in fantasy or anime themes, the functionality is entirely grounded in real-world use.

### Key Features

- **QuestBoard**: Post tasks and projects you need help with
- **SkillBoard**: Find and hire skilled specialists for your projects
- **Service Providers**: Discover local businesses and services
- **User Roles**: Guest, Base, Specialist, Service Provider, Admin
- **Real-time Connections**: Connect instantly with available specialists
- **Anime-inspired Design**: Clean, modern interface with subtle anime aesthetics

## 🚀 Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library built with Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Poppins (Google Fonts)

### **Backend & Database**
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email verification
- **ORM/Client**: Supabase JavaScript client
- **Database Features**: 
  - Custom enums and types
  - Triggers for timestamps
  - Performance indexes
  - Comprehensive RLS policies

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint 9 with Next.js config
- **Formatting**: Prettier 3.5.3
- **Git Hooks**: Husky 9.1.7
- **Staged Files**: lint-staged 16.1.2
- **Build Tool**: Next.js with Turbopack (dev mode)

### **UI Component Library**
Built on top of Radix UI primitives:
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-tabs`

### **Supabase Integration**
- `@supabase/supabase-js` 2.50.0
- `@supabase/ssr` 0.6.1
- `@supabase/auth-helpers-nextjs` 0.10.0
- `@supabase/auth-ui-react` 0.4.7
- `@supabase/auth-ui-shared` 0.1.8

### **Styling & Design**
- **CSS Framework**: Tailwind CSS v4
- **Design System**: Custom CSS variables with anime-inspired aesthetics
- **Component Variants**: class-variance-authority
- **CSS Utilities**: clsx, tailwind-merge
- **Responsive**: Mobile-first approach

### **Key Architecture Patterns**
- App Router (Next.js 15)
- Server-Side Rendering (SSR)
- Client-Side Rendering (CSR) for interactive components
- Custom hooks for state management
- Component composition patterns
- Responsive design patterns

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account (for database and auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd questlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # User dashboard routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── quest/             # Quest-related components
│   ├── skill/             # Skill-related components
│   ├── service/           # Service-related components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🎨 Design System

QuestLink uses a custom design system with anime-inspired aesthetics:

- **Colors**: Custom CSS variables with theme support
- **Typography**: Poppins font family
- **Components**: Consistent styling with variant-based design
- **Animations**: Floating, glowing, and shimmer effects
- **Responsive**: Mobile-first design approach

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **TypeScript**: Type safety

## 📝 Version History

- **v0.1** - Initial project setup and architecture (Created by Cirqle, 5/23/2025)

## 👨‍💻 Author

**Cirqle**
- Initial Creation: May 23, 2025
- Project Lead & Developer

## 📄 License

This project is private and proprietary.

---

*QuestLink - Where real-world quests meet real-time connections.*
