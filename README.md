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

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Custom CSS Variables
- **UI Components**: Custom component library with Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with social login support
- **Fonts**: Poppins (Google Fonts)
- **Animations**: Framer Motion, Custom CSS animations
- **Development**: ESLint, Prettier, Husky

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
