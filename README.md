# JobTrackAI

[![Node.js](https://img.shields.io/badge/Node.js-22.14.0-green.svg)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/Astro-5.5.5-purple.svg)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.17-38B2AC.svg)](https://tailwindcss.com/)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

JobTrackAI is a web application MVP that solves the time-consuming problem of customizing CVs for job offers while providing a simple kanban system for managing the recruitment process. The application uses artificial intelligence to automatically personalize CVs based on job requirements, making the job application process more efficient and organized.

### Key Features

- **AI-Powered CV Generator**: Automatically creates personalized CVs based on job descriptions
- **Cover Letter Generator**: Creates tailored cover letters for each application
- **Kanban Board**: Track applications through stages: Planned, Sent, Response, Interview, Offer, Rejection
- **User Authentication**: Secure user registration, login, and profile management
- **Master CV Profile**: Store your base CV and skills for customization
- **Application Tracking**: Comprehensive system for managing multiple job applications

### Problem Solved

Job seekers face two main challenges:
1. **CV Customization**: Manually adapting CVs for each job posting is time-consuming and often results in generic applications
2. **Application Tracking**: Managing multiple applications simultaneously leads to missed deadlines and poor follow-up

JobTrackAI addresses these issues by automating CV customization and providing a structured approach to application management.

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) - Modern static site generator
- **Frontend**: [React 19](https://react.dev/) - Dynamic UI components
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **Build Tool**: Vite - Fast development and building
- **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks

## Getting Started Locally

### Prerequisites

- **Node.js**: Version 22.14.0 (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **npm**: Package manager (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jobtrackai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321` to view the application

### Environment Setup

Make sure you have the correct Node.js version:
```bash
nvm use 22.14.0
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |

## Project Scope

### MVP Features

#### User Management
- User registration and authentication
- Password reset functionality
- User profile management with master CV

#### AI-Powered CV Generation
- Automatic CV customization based on job requirements
- Keyword analysis and content matching
- Markdown format output
- Salary range extraction from job postings

#### Cover Letter Generation
- Automated cover letter creation
- Content tailored to job offers and user profile
- Text format output (max 250 words)

#### Application Tracking (Kanban)
- **Planned**: New applications to be prepared
- **Sent**: Applications submitted to employers
- **Response**: Received employer responses
- **Interview**: Scheduled or completed interviews
- **Offer**: Received job offers
- **Rejection**: Declined applications

#### Data Management
- Unlimited application storage
- Permanent user data retention
- CV history for each application
- Editable application details

### Out of Scope (Future Versions)
- Job posting import from external APIs
- Automatic application submission
- Reminder systems
- Advanced CV analytics
- Mobile application
- Calendar integrations
- Premium features

## Project Status

- **Current Version**: 0.0.1
- **Development Phase**: MVP (Minimum Viable Product)
- **Status**: In Development
- **Target**: Free MVP version for all users

### Success Metrics
- 70% of users track minimum 5 applications simultaneously
- CV generation time under 3 minutes
- 80% positive feedback on generated CVs
- 40% user retention after 30 days

## License

MIT

---

## Contributing

This project is currently in MVP development. Contribution guidelines will be added as the project evolves.

## Support

For questions and support, please open an issue in the GitHub repository.

---

## API Documentation

### Profiles API

Base URL: `/api/profiles`

#### List Profiles

```http
GET /api/profiles
```

Query Parameters:
- `limit` (optional, default: 20) - Number of items per page (1-100)
- `offset` (optional, default: 0) - Pagination offset
- `sort_by` (optional, default: "created_at") - Sort field: "created_at", "updated_at", "name"
- `sort_dir` (optional, default: "desc") - Sort direction: "asc", "desc"

Response:
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "name": "string",
        "is_default": boolean,
        "master_cv": "string?",
        "pref_salary_min": number?,
        "pref_salary_max": number?,
        "pref_salary_currency": "string?",
        "pref_salary_period": "monthly|yearly|hourly?",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "total": number
  },
  "error": null
}
```

#### Create Profile

```http
POST /api/profiles
```

Request Body:
```json
{
  "name": "string (1-120 chars)",
  "is_default": "boolean?",
  "master_cv": "string? (max 200KB)",
  "pref_salary_min": "number?",
  "pref_salary_max": "number?",
  "pref_salary_currency": "ISO 4217 code?",
  "pref_salary_period": "monthly|yearly|hourly?"
}
```

Response:
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "string",
    // ... same as list response
  },
  "error": null
}
```

#### Get Profile

```http
GET /api/profiles/:id
```

Parameters:
- `id` (UUID) - Profile ID

Response:
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "string",
    // ... same as list response
    "profile_skills": [
      { "skill_id": "uuid" }
    ]
  },
  "error": null
}
```

#### Update Profile

```http
PUT /api/profiles/:id
```

Parameters:
- `id` (UUID) - Profile ID

Request Body: Same as POST but all fields optional

Response: Same as GET

#### Delete Profile

```http
DELETE /api/profiles/:id
```

Parameters:
- `id` (UUID) - Profile ID

Response:
```json
{
  "data": { "ok": true },
  "error": null
}
```

#### Attach Skills

```http
POST /api/profiles/:id/skills
```

Parameters:
- `id` (UUID) - Profile ID

Request Body:
```json
{
  "skill_ids": ["uuid"] // 1-200 skill IDs
}
```

Response:
```json
{
  "data": {
    "attached": number
  },
  "error": null
}
```

#### Detach Skills

```http
DELETE /api/profiles/:id/skills
```

Parameters:
- `id` (UUID) - Profile ID

Request Body: Same as POST /skills

Response:
```json
{
  "data": {
    "detached": number
  },
  "error": null
}
```

### Error Responses

All endpoints may return the following error responses:

```json
{
  "data": null,
  "error": {
    "code": "error_code",
    "message": "Human readable message",
    "details": "Optional details"
  }
}
```

Error Codes:
- `server_error` (500) - Internal server error
- `unauthorized` (401) - Authentication required
- `bad_request` (400) - Invalid input data
- `not_found` (404) - Resource not found
- `conflict` (409) - Resource conflict (e.g., duplicate name)

Special Cases:
- Creating/updating with `is_default=true` will unset `is_default` on other profiles
- Cannot delete a profile referenced by applications
- Cannot delete the last default profile if it's the only profile
- Skills operations are idempotent (duplicates are ignored)


