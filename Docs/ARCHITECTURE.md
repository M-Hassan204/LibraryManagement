# Architecture

Architecture Style

N-Layer Architecture

---

Presentation Layer

LibraryManagement.API

Responsibilities

- Controllers
- Middleware
- Authentication
- Swagger
- Dependency Injection

---

Application Layer

LibraryManagement.Application

Responsibilities

- Business Logic
- DTOs
- Validators
- Interfaces
- Services
- AutoMapper

---

Domain Layer

LibraryManagement.Domain

Responsibilities

- Entities
- Enums
- Constants

Contains NO infrastructure logic.

---

Infrastructure Layer

LibraryManagement.Infrastructure

Responsibilities

- EF Core
- DbContext
- Repository
- Unit Of Work
- JWT
- Email
- Identity

---

Shared Layer

LibraryManagement.Shared

Responsibilities

- ApiResponse
- Exceptions
- Helpers
- Common Models

---

Flow

Client

↓

Controller

↓

Service

↓

Repository

↓

DbContext

↓

SQL Server