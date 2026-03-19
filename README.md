<p align="center">
  <img src="https://img.shields.io/badge/FromZero-Personalized%20E--Learning-20c997?style=for-the-badge&logo=bookstack&logoColor=white" alt="FromZero Badge"/>
</p>

<h1 align="center">🎓 FromZero — AI-Powered Personalized E-Learning Platform</h1>

<p align="center">
  A full-stack, AI-integrated e-learning platform that delivers personalized learning paths, AI-generated quizzes, an intelligent tutor chatbot, and real-time performance analytics — all designed to adapt to each learner's unique pace and style.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?logo=google&logoColor=white" alt="Gemini AI"/>
</p>

---

## ✨ Key Features

### 🤖 AI Integration
- **AI-Generated Quizzes** — Quizzes are automatically generated via Google Gemini AI when a user accesses a lesson, with shuffled question/option order per request for a unique experience every time
- **AI Tutor Chatbot** — Real-time conversational AI tutor with streaming responses, session management, and context-aware learning assistance
- **AI-Suggested Answers** — Community Q&A enhanced with AI-powered answer suggestions
- **Personalized Insights** — AI-driven analytics that identify learning patterns, suggest revisions, and recommend next courses

### 📚 Learning Experience
- **Structured Learning Paths** — Curated multi-course paths with sequential lesson unlocking and progress gating
- **Video-Based Lessons** — YouTube-integrated video player with progress tracking
- **Quiz-Gated Progression** — Learners must score ≥60% on quizzes to unlock the next lesson, ensuring concept mastery
- **Course Catalog** — Browse, filter, and search courses by category and difficulty (Beginner / Intermediate / Advanced)

### 📊 Analytics & Tracking
- **Performance Dashboard** — Visual progress rings, weekly activity charts, streak tracking, and completion stats
- **Growth Trends** — Week-over-week progress comparison, quiz score trends, and monthly completion graphs
- **Learning Insights** — Personalized recommendations powered by learning behavior analysis

### 👥 Community
- **Discussion Forum** — Post questions, share answers, comment, and upvote within a community knowledge base
- **Category Filtering** — Filter discussions by topic (General, Help, Resources, etc.)

### 🔐 Authentication & Security
- **JWT-Based Auth** — Short-lived access tokens (15 min) with automatic silent refresh via HttpOnly refresh token cookies
- **Role-Based Access** — Admin and User roles with route-level protection
- **Secure Token Rotation** — Refresh tokens are bcrypt-hashed before database storage

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (Turbopack), React, TypeScript |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL with Prisma ORM |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai` SDK) |
| **Auth** | JWT (access + refresh tokens), bcrypt, HttpOnly cookies |
| **Validation** | Zod schema validation |
| **Styling** | Tailwind CSS, Glassmorphism UI |

---

## 📁 Project Structure

```
FromZero/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (User, Course, Lesson, Quiz, etc.)
│   ├── src/
│   │   ├── controllers/           # Route handlers (auth, quiz, course, AI, analytics, etc.)
│   │   ├── middlewares/           # Auth middleware, role guards
│   │   ├── routes/                # API route definitions
│   │   ├── services/              # Business logic layer
│   │   ├── utils/                 # Helpers (token generation, AI quiz generator)
│   │   ├── app.js                 # Express app configuration
│   │   └── server.js              # Server entry point
│   ├── .env.example               # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/         # Main dashboard, courses, analytics, AI tutor, community
│   │   │   ├── lesson/            # Learning path lesson viewer with quiz section
│   │   │   ├── login/             # Authentication pages
│   │   │   ├── signup/
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/            # Reusable components (AuthGuard, etc.)
│   │   └── utils/                 # Utilities (fetchWithAuth for auto token refresh)
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **PostgreSQL** database
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/Austinpinesh/FromZero.git
cd FromZero
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file based on the template:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fromzero_db"
JWT_ACCESS_SECRET="your_access_token_secret"
JWT_REFRESH_SECRET="your_refresh_token_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CLIENT_ORIGIN="http://localhost:3000"
PORT=5000
GEMINI_API_KEY="your_gemini_api_key_here"
```

Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend:
```bash
node src/server.js
```
> Backend runs on **http://localhost:5000**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs on **http://localhost:3000**

### 4. (Optional) Prisma Studio  
```bash
cd backend
npx prisma studio
```
> Database GUI on **http://localhost:5555**

---

## 🔌 API Endpoints

| Module | Endpoint | Description |
|---|---|---|
| **Auth** | `POST /api/auth/register` | User registration |
| | `POST /api/auth/login` | Login (returns access token + refresh cookie) |
| | `POST /api/auth/refresh` | Silent token refresh |
| | `POST /api/auth/logout` | Logout & revoke refresh token |
| **Courses** | `GET /api/courses` | List/search/filter courses |
| **Lessons** | `GET /api/lessons/:id` | Get lesson details |
| **Quizzes** | `GET /api/quizzes/lesson/:id` | Get quiz (auto-generates via AI if none exists) |
| | `POST /api/quizzes/submit` | Submit quiz answers & get score |
| **AI Tutor** | `POST /api/ai/chat/stream` | Stream AI tutor response |
| | `GET /api/ai/sessions` | List chat sessions |
| **Analytics** | `GET /api/analytics/dashboard` | Dashboard stats |
| | `GET /api/analytics/trends` | Growth trends |
| | `GET /api/analytics/insights` | AI-powered learning insights |
| **Community** | `GET /api/community/posts` | List community posts |
| | `POST /api/community/answers` | Post an answer |
| **Progress** | `POST /api/progress/complete` | Mark lesson as complete |
| **Learning Paths** | `GET /api/learning-paths` | List curated learning paths |

---

## 🧠 How AI Quiz Generation Works

```
User opens a lesson
        ↓
Frontend calls GET /api/quizzes/lesson/:id
        ↓
┌─ Quiz exists in DB? ──────────┐
│  YES → Return quiz            │
│  (shuffled per request)       │
├───────────────────────────────┤
│  NO → Call Gemini AI          │
│  → Generate 5 MCQ questions   │
│  → Save to database           │
│  → Return shuffled quiz       │
└───────────────────────────────┘
```

Each request shuffles question order and option order using **Fisher-Yates algorithm**, ensuring every user sees a unique arrangement.

---

## 📸 Screenshots

> <img src="./scr shot/Screenshot 2026-02-20 195416.png" alt="FromZero Screenshot"/>


---

## 👨‍💻 Author

**Austin Pinesh**  
*FromZero: AI-Powered Personalized E-Learning Platform*

---

<p align="center">
  Built with ❤️ using Next.js, Node.js, PostgreSQL & Google Gemini AI
</p>
