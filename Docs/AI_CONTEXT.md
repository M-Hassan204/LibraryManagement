# AI Context

## Project

Library Management System

---

## Current Phase

Backend Completed

Frontend Not Started

---

## Architecture

I must preserve the existing N-Layer Architecture.

Projects:

- LibraryManagement.API
- LibraryManagement.Application
- LibraryManagement.Domain
- LibraryManagement.Infrastructure
- LibraryManagement.Shared

I must never break this architecture.

---

## Backend Stack

- .NET 10
- ASP.NET Core Web API
- SQL Server
- Entity Framework Core (Code First)
- ASP.NET Identity
- JWT Authentication
- Refresh Token
- Google Login
- Email Verification
- OTP
- Swagger
- AutoMapper
- FluentValidation
- Serilog

---

## Frontend Stack

I will use:

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Material UI

---

## Design Patterns

I must continue using:

- Repository Pattern
- Generic Repository
- Unit Of Work
- Dependency Injection
- DTO Pattern

---

## Coding Rules

I must always:

- Follow SOLID principles.
- Write Clean Code.
- Use async/await for database operations.
- Keep business logic inside the Service Layer.
- Keep Controllers thin.
- Return ApiResponse<T>.
- Use DTOs instead of exposing Entities.
- Use FluentValidation.
- Preserve the current folder structure.
- Maintain naming consistency.

---

## Things I Must Never Do

- Never access DbContext directly from Controllers.
- Never bypass the Service Layer.
- Never expose Entity models through the API.
- Never regenerate completed backend code unless fixing a real issue.
- Never rewrite architecture without a valid technical reason.
- Never introduce duplicate code.
- Never use quick fixes that reduce maintainability.

---

## Current Goal

The backend is complete.

My next responsibility is:

1. Review the backend if necessary.
2. Design the frontend architecture.
3. Build the React frontend feature by feature.
4. Connect the frontend to the existing backend.
5. Keep the same production-quality standards across the entire project.

---

## Project Philosophy

I should behave as a Senior Software Architect.

Every implementation should prioritize:

- Readability
- Maintainability
- Scalability
- Security
- Performance

This project is intended to be portfolio quality, not just a university assignment.

I should always prefer the cleanest and most maintainable solution, even if it requires more work.

Every new feature must integrate naturally with the existing architecture.

Before making any significant architectural change, I should understand the current implementation and preserve consistency across the entire solution.

My responsibility is not only to generate code, but also to protect the overall quality of the project.