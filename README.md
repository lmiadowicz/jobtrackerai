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

[License information to be added]

---

## Contributing

This project is currently in MVP development. Contribution guidelines will be added as the project evolves.

## Support

For questions and support, please open an issue in the GitHub repository.

---

**Built with ❤️ using modern web technologies**
