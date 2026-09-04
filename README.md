# TaskFlow - Full-Stack Task Management System

A full-stack, production-ready Task Management application built with **React 19**, **TypeScript**, **Node.js**, **Express 5**, **Prisma ORM**, **PostgreSQL**, and **Zod**.

Features secure JWT authentication (with access + refresh token rotation), server-side pagination, multi-attribute sorting, search, status & priority filtering, and responsive UI built with Tailwind CSS.

---

## Features

### Authentication & Security
- **JWT-Based Authentication**: Short-lived Access Tokens (15 minutes) paired with secure Refresh Tokens (7 days).
- **Token Rotation & Hashing**: Refresh tokens are cryptographically hashed and stored in PostgreSQL; issued via `httpOnly` secure cookies.
- **Silent Token Refresh**: Frontend auto-refreshes expired access tokens seamlessly on 401 responses via `authenticatedFetch`.
- **Protected Routes**: React client-side route guarding with redirect flows.
- **Password Security**: Strong hashing with `bcryptjs`.

### Task Management (CRUD)
- **Create**: Add tasks with title, optional description, and priority level (`LOW`, `MEDIUM`, `HIGH`).
- **Read**: Fetch user-isolated tasks with server-side pagination.
- **Update**: Edit title, description, priority, and completed state.
- **Delete**: Safe task deletion with client confirmation.
- **Quick Status Toggle**: Checkbox toggle on task cards to instantly switch between Pending and Completed.

### Advanced Search, Filtering & Sorting
- **Server-Side Search**: Case-insensitive substring search matching task titles and descriptions.
- **Status Filter**: Filter tasks by `All`, `Pending`, or `Completed`.
- **Priority Filter**: Filter tasks by `All`, `LOW`, `MEDIUM`, or `HIGH`.
- **Multi-Field Sorting**:
  - Created Date: Newest First (`createdAt desc`) / Oldest First (`createdAt asc`)
  - Updated Date: Recently Updated (`updatedAt desc`)
  - Title: Alphabetical (`title asc` / `title desc`)
  - Priority: Severity (`priority desc` / `priority asc`)
- **Reset Filters**: One-click reset back to default view.

### Server-Side Pagination
- Custom items per page selector: `5`, `10`, `20`, or `50` tasks per page.
- Item count summary (`Showing 1 to 10 of 42 tasks`).
- Interactive pagination bar with **Previous**, **Next**, and numbered page buttons with ellipsis handling.
- Boundary protection: auto-recovers to previous page when the last item on a page is deleted.

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) + [tsx](https://github.com/privatenumber/tsx)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM 7](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/) for type-safe schema parsing
- **Auth**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + [cookie-parser](https://github.com/expressjs/cookie-parser)

---

## Project Structure

```text
task-flow-final/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Database schema (User, Task, RefreshToken)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts # Register, login, refresh, logout, me
│   │   │   └── taskController.ts # Task CRUD, query, pagination, sorting
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts # Access token verification
│   │   ├── routes/
│   │   │   ├── authRoutes.ts     # /api/auth routes
│   │   │   └── taskRoutes.ts     # /api/tasks routes
│   │   ├── types/
│   │   │   ├── auth.ts           # Zod auth schemas
│   │   │   └── task.ts           # Zod task schemas & query validation
│   │   ├── app.ts                # Express app configuration & middleware
│   │   └── server.ts             # Server entrypoint
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateTaskForm.tsx
│   │   │   ├── EditTaskForm.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Pagination.tsx    # Reusable pagination component
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── TaskCard.tsx      # Task item with quick complete toggle
│   │   │   └── TaskFilters.tsx   # Search, filters, sort & reset controls
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Global auth state & session management
│   │   ├── lib/
│   │   │   ├── api.ts            # Base API URL config
│   │   │   ├── authenticatedFetch.ts # Auto-refresh fetch wrapper
│   │   │   ├── authApi.ts        # Auth API endpoints
│   │   │   └── taskApi.ts        # Task API endpoints
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Tasks.tsx         # Main dashboard page
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   └── task.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **PostgreSQL**: Local instance or hosted service (Supabase, Neon, etc.)
- **npm** or **yarn** / **pnpm**

---

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/HasarangaSam/Task-Manager-Prisma-Zod.git
cd task-flow-final

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Copy the example environment file and adjust your settings:

```bash
cd backend
cp .env.example .env
```

`backend/.env` contents:
```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/task-manager-prisma"

# JWT Access Token Configuration
JWT_ACCESS_SECRET="your-super-secret-access-key-minimum-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"

# JWT Refresh Token Configuration
JWT_REFRESH_SECRET="your-super-secret-refresh-key-minimum-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Port
PORT=5000

# Client Application URL (CORS Allowed Origin)
CLIENT_URL="http://localhost:5173"
```

#### Frontend (`frontend/.env`)
Copy the example environment file:

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` contents:
```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Database Migration

Run Prisma migrations from the `backend` directory:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

### 4. Running the Application

#### Start the Backend Server
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`.

#### Start the Frontend Client
```bash
cd frontend
npm run dev
```
The Vite dev server will start on `http://localhost:5173`.

---

## API Endpoints Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Log in user (returns access token & sets refresh cookie) | No |
| `POST` | `/api/auth/refresh` | Exchange refresh cookie for a new access token | No (Cookie) |
| `POST` | `/api/auth/logout` | Revoke refresh token and clear cookie | No (Cookie) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer`) |

---

### Tasks (`/api/tasks`)

All task endpoints require an `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get paginated, filtered, and sorted tasks |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `PATCH` | `/api/tasks/:id` | Update task details or status |
| `DELETE` | `/api/tasks/:id` | Delete task by ID |

#### `GET /api/tasks` Query Parameters

| Parameter | Type | Default | Options / Details |
| :--- | :--- | :--- | :--- |
| `search` | `string` | — | Substring match against `title` or `description` |
| `completed` | `string` | — | `"true"` or `"false"` |
| `priority` | `string` | — | `"LOW"`, `"MEDIUM"`, `"HIGH"` |
| `sortBy` | `string` | `"createdAt"` | `"createdAt"`, `"updatedAt"`, `"title"`, `"priority"` |
| `order` | `string` | `"desc"` | `"asc"`, `"desc"` |
| `page` | `number` | `1` | Page number (`>= 1`) |
| `limit` | `number` | `10` | Tasks per page (`1` - `100`) |

#### Example Response (`GET /api/tasks`)
```json
{
  "tasks": [
    {
      "id": 14,
      "title": "Build UI components",
      "description": "Implement responsive layout",
      "completed": false,
      "priority": "HIGH",
      "userId": 2,
      "createdAt": "2026-09-04T09:30:00.000Z",
      "updatedAt": "2026-09-04T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalTasks": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Build & Typecheck

```bash
# Frontend build
cd frontend
npm run build

# Backend build
cd backend
npm run build
```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
