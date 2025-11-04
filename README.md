# PromptAlchemy

<div align="center">
  <img src="./generated-icon.png" alt="PromptAlchemy Logo" width="120" />
  <h3>Transform ordinary prompts into extraordinary AI interactions</h3>
  <p>A professional prompt engineering platform with real-time collaboration, AI-powered optimization, and comprehensive evaluation tools</p>
</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [API Documentation](#-api-documentation)
- [COPSTA Framework](#-copsta-framework)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🔮 Overview

PromptAlchemy is a professional prompt engineering platform that systematically evaluates, optimizes, and enhances AI model interactions through advanced collaborative tools. The platform helps users craft highly effective prompts for AI models including those from OpenAI, Anthropic, xAI, and Mistral.

### Key Highlights

- **🎯 Multi-dimensional Evaluation**: Analyze prompts across clarity, specificity, focus, and AI-friendliness
- **⚗️ AI-Powered Optimization**: Leverage GPT-4o to automatically improve your prompts
- **🧠 Real-time Collaboration**: Work with teams using WebSocket-based collaborative whiteboards
- **📊 Performance Analytics**: Track and visualize prompt effectiveness over time
- **🔒 Secure & Private**: No hardcoded secrets, all data stored in your own PostgreSQL database

---

## ✨ Core Features

### 🔍 Prompt Evaluation Studio

Analyze your prompts with a sophisticated multi-dimensional evaluation framework powered by OpenAI's GPT-4o:

- **Clarity** (Score: 1-10): Measures how clear and unambiguous your instructions are
- **Specificity** (Score: 1-10): Evaluates the level of detail and context provided
- **Focus** (Score: 1-10): Assesses how well your prompt stays on topic without tangents
- **AI-Friendliness** (Score: 1-10): Determines how effectively AI models can process your prompt

Each dimension provides:
- Numerical score with detailed breakdown
- Constructive feedback and actionable suggestions
- Overall score averaging all evaluated dimensions
- Visual charts and progress tracking

### ⚗️ Prompt Optimization Studio

Transform your prompts with advanced AI-powered optimization controls:

**Basic Controls:**
- **Length**: Concise → Medium → Detailed → Comprehensive
- **Tone**: Casual → Neutral → Professional → Formal
- **Specificity**: General → Somewhat Specific → Detailed → Highly Detailed

**Advanced Settings:**
- **Creativity**: Conservative → Balanced → Creative → Highly Creative
- **Formality**: Informal → Conversational → Business → Academic
- **Audience**: Target specific knowledge levels (Novice, Intermediate, Expert)
- **Purpose**: Optimize for specific response types (Information, Analysis, Creative, etc.)
- **Structure**: Choose formatting styles (Narrative, Structured, List-based, etc.)

**Enhancement Toggles:**
- Enhance Clarity
- Enhance Specificity
- Enhance Focus
- Enhance AI-Friendliness

**Style Preferences:**
- Use Markdown formatting
- Use bullet points
- Use section headings
- Include concrete examples
- Include contextual information

**Magic Optimization**: One-click improvements based on evaluation feedback with highlighted changes showing exactly what was improved.

### 🧠 Collaborative Brainstorming Whiteboard

Work with your team in real-time to develop and refine prompt ideas:

**Real-time Features:**
- **Live Cursors**: See cursor positions of all team members in real-time
- **Visual Mapping**: Create spatial relationships between concepts with drag-and-drop nodes
- **Instant Sync**: All changes broadcast immediately via WebSocket connections
- **User Presence**: See who's actively working in each session

**Collaboration Tools:**
- **Idea Nodes**: Add, edit, move, and delete concept cards
- **Connections**: Visually link related ideas with lines
- **Voting System**: Team members can vote on promising concepts
- **Color Coding**: Differentiate ideas with customizable colors
- **Session Management**: Create multiple brainstorming sessions

**Use Cases:**
- Team brainstorming for complex prompts
- Mapping prompt structures and workflows
- Collaborative refinement of prompt strategies
- Visual prompt architecture planning

### 📚 Prompt Vault

Store, organize, and share your prompt library with powerful management features:

**Organization:**
- **Categories & Tags**: Organize prompts by use case, model, and performance
- **Search & Filter**: Quickly find prompts by title, content, or tags
- **Sorting**: Sort by date, score, or custom criteria

**Version Management:**
- **Version History**: Track changes and improvements over time
- **Comparison**: Compare different versions side-by-side
- **Rollback**: Restore previous versions if needed

**Sharing & Export:**
- **Team Collaboration**: Share prompts with team members
- **Duplication**: Clone prompts for variations
- **Export/Import**: Move prompts between environments and applications
- **Backup**: Download your entire prompt library

**Analytics:**
- View evaluation scores for each prompt
- Track optimization history
- Monitor performance trends
- Identify top-performing prompts

---

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework with hooks and context |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **Vite** | 5.4.14 | Fast development bundler with HMR |
| **TailwindCSS** | 3.4.17 | Utility-first CSS framework |
| **Wouter** | 3.3.5 | Lightweight client-side routing |
| **TanStack React Query** | 5.60.5 | Server state management and caching |
| **React Hook Form** | 7.55.0 | Performant form validation |
| **Radix UI** | Latest | Accessible component primitives |
| **Framer Motion** | 11.13.1 | Smooth animations |
| **Recharts** | 2.15.2 | Data visualization charts |
| **Lucide React** | 0.453.0 | Beautiful icon library |
| **Zod** | 3.24.2 | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 | JavaScript runtime |
| **Express** | 4.21.2 | Web application framework |
| **TypeScript** | 5.6.3 | Type safety on backend |
| **Drizzle ORM** | 0.39.1 | Type-safe database queries |
| **PostgreSQL** | 16 | Primary database (Neon serverless) |
| **WebSocket (ws)** | 8.18.0 | Real-time communication |
| **OpenAI SDK** | 4.100.0 | AI API integration (GPT-4o) |
| **Zod** | 3.24.2 | Runtime type validation |

### Database

- **PostgreSQL 16** via Neon serverless
- **WebSocket support** for real-time features
- **Connection pooling** for performance
- **Drizzle Kit** for migrations

### Development Tools

- **tsx** - Fast TypeScript execution
- **esbuild** - Blazing fast bundler
- **Drizzle Kit** - Database migrations
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🏗 Architecture

### Application Structure

```
PromptAlchemy/
├── client/                          # React frontend (SPA)
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   │   ├── prompts/            # Prompt-related components
│   │   │   ├── whiteboard/         # Whiteboard collaboration UI
│   │   │   └── ui/                 # Base UI components (Button, Card, etc.)
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   ├── SidebarContext.tsx  # Sidebar state
│   │   │   └── ThemeContext.tsx    # Theme management
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── Evaluation.tsx      # Evaluation studio
│   │   │   ├── Optimization.tsx    # Optimization studio
│   │   │   ├── Vault.tsx           # Prompt vault
│   │   │   └── Whiteboard.tsx      # Collaborative whiteboard
│   │   ├── lib/                    # Utility functions
│   │   ├── App.tsx                 # Root component
│   │   └── main.tsx                # Entry point
│   └── index.html                  # HTML template
│
├── server/                          # Express backend (API + WebSocket)
│   ├── index.ts                    # Server entry & middleware
│   ├── routes.ts                   # REST API endpoints
│   ├── db.ts                       # Database connection
│   ├── storage.ts                  # Data access layer
│   ├── vite.ts                     # Vite dev server integration
│   └── services/                   # Business logic
│       ├── openai.ts              # OpenAI integration (GPT-4o)
│       ├── promptEvaluation.ts    # Evaluation service
│       └── whiteboard.ts          # WebSocket collaboration
│
├── shared/                          # Shared between client & server
│   └── schema.ts                   # Database schema (Drizzle ORM)
│
├── migrations/                      # Database migrations
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite bundler config
├── drizzle.config.ts              # Drizzle ORM config
└── tailwind.config.ts             # Tailwind CSS config
```

### Request Flow

```
User Browser
    ↓
  Vite Dev Server (Development) / Static Files (Production)
    ↓
  React SPA (Port 5000)
    ↓
  Express API (/api/*)
    ↓
  ┌─────────────────┬─────────────────┐
  │                 │                 │
PostgreSQL      OpenAI API      WebSocket Server
(Neon)          (GPT-4o)        (Real-time)
  │                 │                 │
  └─────────────────┴─────────────────┘
           Response to Client
```

### Database Schema

**Tables:**
- `users` - User accounts and profiles
- `prompts` - Stored prompts with metadata
- `evaluations` - Evaluation results and scores
- `optimizations` - Optimization history
- `sessions` - User sessions

**Key Relationships:**
- Users → Prompts (1:many)
- Prompts → Evaluations (1:many)
- Prompts → Optimizations (1:many)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **PostgreSQL database** (Recommended: [Neon](https://neon.tech) serverless)
- **OpenAI API key** (Optional, for AI features: [Get API Key](https://platform.openai.com/api-keys))
- **Git** for version control

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/promptalchemy.git
cd promptalchemy
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all frontend and backend dependencies (~300 packages).

#### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```bash
# Required: PostgreSQL database connection
DATABASE_URL=postgresql://username:password@host.neon.tech/promptalchemy?sslmode=require

# Optional: OpenAI API key (uses mock data if not provided)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Optional: Environment mode
NODE_ENV=development
```

**Important**: Never commit the `.env` file to git! It's already in `.gitignore`.

#### 4. Initialize the Database

Push the schema to your database:

```bash
npm run db:push
```

This creates all necessary tables using Drizzle ORM.

#### 5. Start the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:5000**

You should see:
```
serving on port 5000
```

#### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*
- **WebSocket**: ws://localhost:5000/ws/whiteboard

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` | [Neon](https://neon.tech), [Railway](https://railway.app), or local PostgreSQL |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | `mock-key-for-development` | `sk-proj-...` |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `REPL_ID` | Replit platform ID | (none) | Auto-set on Replit |

### Environment Behaviors

**Development Mode** (`NODE_ENV=development`):
- Vite dev server with hot module replacement (HMR)
- Source maps enabled
- Detailed error messages
- Mock data returned if no OpenAI API key

**Production Mode** (`NODE_ENV=production`):
- Serves pre-built static files from `dist/`
- Minified and optimized bundles
- No source maps
- Requires valid OpenAI API key for AI features

### Getting API Keys

#### Neon PostgreSQL (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

#### OpenAI API Key

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to API keys section
3. Create a new secret key
4. Format: `sk-proj-...` (starts with `sk-`)
5. **Important**: Add billing information to use GPT-4o

**Cost Estimate**:
- GPT-4o pricing: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Average prompt evaluation: ~$0.01-0.02
- Average prompt optimization: ~$0.02-0.05

---

## 🗄 Database Setup

### Using Neon (Recommended)

Neon provides serverless PostgreSQL with WebSocket support, perfect for this application.

```bash
# 1. Create a Neon account at https://neon.tech

# 2. Create a new project

# 3. Copy the connection string (looks like):
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# 4. Add to .env
DATABASE_URL=your_connection_string_here

# 5. Push schema
npm run db:push
```

### Using Local PostgreSQL

```bash
# 1. Install PostgreSQL 16
brew install postgresql@16  # macOS
# or
sudo apt install postgresql-16  # Ubuntu

# 2. Start PostgreSQL
brew services start postgresql@16  # macOS
# or
sudo systemctl start postgresql  # Ubuntu

# 3. Create database
createdb promptalchemy

# 4. Add to .env
DATABASE_URL=postgresql://localhost/promptalchemy

# 5. Push schema
npm run db:push
```

### Database Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

### Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make changes to code
# - Frontend: client/src/**
# - Backend: server/**
# - Shared: shared/**

# 3. Changes auto-reload via HMR

# 4. Check types
npm run check

# 5. Push DB schema changes
npm run db:push
```

### Hot Module Replacement (HMR)

The development server supports HMR for instant updates:
- React components reload without full page refresh
- CSS updates apply instantly
- State is preserved during updates
- Backend changes require manual restart

### Code Structure Guidelines

**Frontend Components:**
- Use functional components with hooks
- Co-locate component files with styles
- Use TypeScript for all components
- Follow Radix UI patterns for accessibility

**Backend Services:**
- Keep business logic in `server/services/`
- Use Zod for request validation
- Return consistent JSON responses
- Handle errors with try-catch

**Database Queries:**
- Use Drizzle ORM for type safety
- Keep queries in `server/storage.ts`
- Use transactions for multi-step operations
- Index frequently queried columns

---

## 🚢 Production Deployment

### Build Process

```bash
# Build frontend and backend
npm run build

# Output:
# - dist/public/    - Frontend static files
# - dist/index.js   - Backend bundle
```

### Deployment on Replit

This project is optimized for Replit:

```bash
# 1. Import from GitHub to Replit

# 2. Set environment variables in Secrets:
DATABASE_URL=your_neon_connection_string
OPENAI_API_KEY=your_openai_key

# 3. Click "Run" - Replit handles the rest
```

### Deployment on Other Platforms

#### Vercel / Netlify (Frontend Only)

```bash
# 1. Build frontend
npm run build

# 2. Deploy dist/public/ directory

# 3. Set environment variables in platform settings
```

#### Railway / Render (Full Stack)

```bash
# 1. Connect GitHub repository

# 2. Set environment variables:
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
NODE_ENV=production

# 3. Build command: npm run build
# 4. Start command: npm run start

# 5. Platform auto-detects port 5000
```

#### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

### Environment Variables in Production

```bash
# Set in your hosting platform's dashboard
DATABASE_URL=postgresql://production-db-url
OPENAI_API_KEY=sk-prod-key
NODE_ENV=production
```

---

## 📡 API Documentation

### Authentication

Currently uses mock authentication for demo purposes. In production, implement proper authentication:

```typescript
// Current: Mock user
GET /api/auth/user
Response: { id: "1", name: "Alex Morgan", email: "alex@example.com" }
```

### Prompts API

#### Get All Prompts

```http
GET /api/prompts
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Customer Support Prompt",
    "content": "You are a helpful customer support agent...",
    "modelId": "gpt-4o",
    "overallScore": 8.5,
    "createdAt": "2025-11-04T10:00:00Z",
    "updatedAt": "2025-11-04T10:00:00Z"
  }
]
```

#### Get Prompt by ID

```http
GET /api/prompts/:id
```

#### Create Prompt

```http
POST /api/prompts
Content-Type: application/json

{
  "title": "New Prompt",
  "content": "Prompt content here...",
  "modelId": "gpt-4o",
  "description": "Optional description",
  "tags": ["customer-service", "support"]
}
```

#### Update Prompt

```http
PUT /api/prompts/:id
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
```

#### Delete Prompt

```http
DELETE /api/prompts/:id
```

#### Duplicate Prompt

```http
POST /api/prompts/:id/duplicate
```

### Evaluation API

```http
POST /api/evaluate
Content-Type: application/json

{
  "title": "Prompt Title",
  "content": "Prompt content to evaluate...",
  "modelId": "gpt-4o",
  "evaluateClarity": true,
  "evaluateSpecificity": true,
  "evaluateFocus": true,
  "evaluateAiFriendliness": true
}
```

**Response:**
```json
{
  "clarity": {
    "score": 8.5,
    "feedback": "The prompt is clear but could benefit from..."
  },
  "specificity": {
    "score": 7.0,
    "feedback": "Add more specific examples..."
  },
  "focus": {
    "score": 9.0,
    "feedback": "Excellent focus on the main task"
  },
  "aiFriendliness": {
    "score": 8.0,
    "feedback": "Well-structured for AI processing"
  },
  "overallScore": 8.1
}
```

### Optimization API

```http
POST /api/optimize
Content-Type: application/json

{
  "originalPrompt": "Be a helpful assistant",
  "settings": {
    "length": 3,
    "tone": 3,
    "specificity": 4,
    "creativity": 2,
    "audience": "professional",
    "formality": 3,
    "purpose": "customer-support",
    "structure": "structured",
    "enhanceClarity": true,
    "enhanceSpecificity": true,
    "style": {
      "useMarkdown": true,
      "useBulletPoints": true,
      "useHeadings": true,
      "useExamples": true,
      "includeContext": true
    }
  },
  "evaluationDetails": {
    "clarity": { "score": 6.5, "feedback": "..." },
    "specificity": { "score": 5.0, "feedback": "..." },
    "focus": { "score": 8.0, "feedback": "..." },
    "aiFriendliness": { "score": 7.0, "feedback": "..." }
  }
}
```

**Response:**
```json
{
  "optimizedPrompt": "# Role\n<span class='text-green-600'>You are a professional customer support specialist...</span>",
  "improvements": [
    "Added <span class='text-green-600'>role context</span>",
    "Enhanced with <span class='text-primary-600'>professional tone</span>",
    "Included <span class='text-accent-600'>concrete examples</span>"
  ],
  "score": 9.2
}
```

### Analytics API

#### Dashboard Stats

```http
GET /api/stats
```

**Response:**
```json
{
  "username": "Alex",
  "totalPrompts": 42,
  "promptsChangePercent": 12,
  "averageScore": "8.5",
  "scoreChange": 0.6,
  "totalOptimizations": 28,
  "optimizationRate": 8,
  "teamMembers": 7,
  "newTeamMembers": 2
}
```

#### Performance Data

```http
GET /api/performance
```

### WebSocket API

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/whiteboard');
```

**Join Session:**
```json
{
  "type": "join",
  "sessionId": "session-id",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "color": "#FF5733"
  }
}
```

**Add Idea:**
```json
{
  "type": "add-idea",
  "sessionId": "session-id",
  "idea": {
    "id": "idea-id",
    "text": "Use examples in prompts",
    "x": 200,
    "y": 150,
    "color": "#F97316",
    "connections": [],
    "createdBy": "user-id",
    "votes": 0
  }
}
```

**Other Message Types:**
- `cursor-move` - Update cursor position
- `delete-idea` - Remove an idea
- `update-idea` - Modify idea properties
- `add-connection` - Link two ideas
- `remove-connection` - Unlink ideas
- `vote` - Vote for an idea

---

## 📊 COPSTA Framework

PromptAlchemy utilizes the **COPSTA framework** for systematic prompt improvement:

| Component | Description | Example |
|-----------|-------------|---------|
| **C**ontext | Provide necessary background information | "You are an expert Python developer with 10 years of experience" |
| **O**bjective | Clearly state the goal of the prompt | "Write a function that validates email addresses" |
| **P**arameters | Set specific constraints and requirements | "Must handle international domains, return boolean, include docstring" |
| **S**tructure | Organize prompt sections effectively | Use headings, bullet points, numbered lists |
| **T**one | Adjust formality and style for the response | Professional, casual, academic, creative |
| **A**udience | Target specific knowledge levels | Beginner, intermediate, expert |

### Applying COPSTA

**Before (Poor Prompt):**
```
Make a customer service bot
```

**After (COPSTA-Enhanced):**
```
# Context
You are a customer support specialist for TechCorp, a SaaS company
providing project management software to enterprise clients.

# Objective
Respond to customer inquiries about billing, technical issues, and
account management with professional and empathetic support.

# Parameters
- Respond within 2-3 sentences for simple queries
- Escalate complex technical issues to engineering team
- Always verify account details before making changes
- Use positive, solution-oriented language

# Structure
1. Acknowledge the customer's concern
2. Provide clear solution or next steps
3. Offer additional help

# Tone
Professional yet friendly, empathetic and solution-focused

# Audience
Enterprise customers (managers, IT administrators) with varying
technical expertise
```

---

## 🔒 Security

### Security Audit Results

✅ **No exposed secrets found in codebase**

The codebase has been thoroughly audited and follows security best practices:

- All sensitive credentials use environment variables
- No hardcoded API keys or passwords
- `.env` files excluded from version control
- Safe fallbacks for missing credentials
- Proper error handling without leaking sensitive data

### Best Practices

**Environment Variables:**
- Never commit `.env` files
- Use `.env.example` as a template
- Rotate API keys regularly
- Use different keys for dev/prod

**Database Security:**
- Use SSL/TLS connections (`sslmode=require`)
- Implement connection pooling limits
- Use prepared statements (Drizzle ORM handles this)
- Regular backups

**API Security:**
- Implement rate limiting (recommended)
- Add authentication/authorization (currently mock)
- Validate all user inputs with Zod
- Sanitize outputs to prevent XSS

**OpenAI API:**
- Never expose API keys to frontend
- Monitor usage and set spending limits
- Use environment-specific keys
- Implement request timeouts

### Recommended Security Enhancements

For production deployment, consider:

1. **Authentication**: Implement OAuth 2.0 or JWT-based auth
2. **Rate Limiting**: Use `express-rate-limit`
3. **CORS**: Configure proper CORS policies
4. **Helmet.js**: Add security headers
5. **Input Validation**: Validate all inputs with Zod
6. **SQL Injection**: Drizzle ORM prevents this by default
7. **XSS Protection**: Sanitize user-generated content
8. **CSRF Protection**: Implement CSRF tokens

---

## 🔧 Troubleshooting

### Common Issues

#### Port 5000 Already in Use

```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

#### Database Connection Failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"

# Re-push schema
npm run db:push
```

#### OpenAI API Errors

```bash
# Verify API key
echo $OPENAI_API_KEY

# Check billing: https://platform.openai.com/usage
# The app will use mock data if key is invalid
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures

```bash
# Check TypeScript errors
npm run check

# Clear build cache
rm -rf dist
npm run build
```

#### WebSocket Connection Failed

```bash
# Check if server is running on correct port
curl http://localhost:5000/api/stats

# Verify WebSocket path: ws://localhost:5000/ws/whiteboard
```

### Performance Issues

**Slow Database Queries:**
- Add indexes to frequently queried columns
- Use connection pooling
- Enable query logging in Drizzle

**High Memory Usage:**
- Limit WebSocket connections
- Implement pagination for large datasets
- Clear unused React Query cache

**Slow Frontend:**
- Enable production build optimizations
- Use code splitting
- Lazy load heavy components

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run check`
5. Commit with clear messages: `git commit -m "Add amazing feature"`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add comments for complex logic
- Update documentation for new features

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

### Pull Request Process

1. Update README.md with details of changes
2. Update the `.env.example` if adding new env variables
3. Ensure all checks pass
4. Request review from maintainers

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 PromptAlchemy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## 📞 Support

### Getting Help

- **Documentation**: Read this README thoroughly
- **Issues**: [GitHub Issues](https://github.com/yourusername/promptalchemy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/promptalchemy/discussions)
- **Email**: support@promptalchemy.com

### Reporting Bugs

When reporting bugs, please include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Node version, browser)
5. Error messages and stack traces
6. Screenshots if applicable

### Feature Requests

We welcome feature requests! Please:
1. Check existing issues/discussions first
2. Describe the use case
3. Explain why it's valuable
4. Suggest implementation approach (optional)

---

## 🙏 Acknowledgments

Built with these amazing technologies:
- [React](https://react.dev) - UI framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Vite](https://vitejs.dev) - Build tool
- [TailwindCSS](https://tailwindcss.com) - Styling
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [OpenAI](https://openai.com) - AI capabilities
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Radix UI](https://www.radix-ui.com) - Accessible components

---

<div align="center">
  <p>Made with ❤️ by the PromptAlchemy team</p>
  <p>
    <a href="https://github.com/yourusername/promptalchemy">GitHub</a> •
    <a href="https://promptalchemy.com">Website</a> •
    <a href="https://twitter.com/promptalchemy">Twitter</a>
  </p>
</div>
