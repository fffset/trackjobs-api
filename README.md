# TrackJobs API

A RESTful backend API for the TrackJobs application — a job application tracking system built with NestJS, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** TypeORM
- **Auth:** JWT (httpOnly cookies) + Refresh Token
- **Containerization:** Docker Compose (local development)

## Features

- JWT authentication with httpOnly cookies
- Refresh token support with "Remember Me" option
- Full CRUD for job applications
- Kanban-style status management (Applied, Interview, Offer, Rejected)
- Route protection with Guards
- CORS configuration for cross-origin requests

## Coming Soon

- Claude AI integration for CV analysis and cover letter generation

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

### Installation

```bash
git clone https://github.com/fffset/trackjobs-api
cd trackjobs-api
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=trackjobs
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
NODE_ENV=development
```

### Running Locally

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Start the API
npm run start:dev
```

API will be available at `http://localhost:8000`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/me | Get current user |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /applications | Get all applications |
| POST | /applications | Create application |
| PATCH | /applications/:id | Update application |
| DELETE | /applications/:id | Delete application |

## Deployment

Deployed on [Render](https://render.com) with [Supabase](https://supabase.com) PostgreSQL.