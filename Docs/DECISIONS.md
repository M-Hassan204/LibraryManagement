# Architectural Decisions

> This document records the major architectural decisions made throughout the project and the reasoning behind each choice.

---

# ADR-001

## Use N-Layer Architecture

Status

Accepted

Decision

The project uses N-Layer Architecture.

Layers

- API
- Application
- Domain
- Infrastructure
- Shared

Reason

This project is intended as a university project and portfolio project.

N-Layer Architecture provides:

- Clear separation of concerns.
- Easier debugging.
- Easier learning.
- Easier maintenance.
- Better scalability than a single-project architecture.

Alternative Considered

Clean Architecture

Reason for rejection

Although Clean Architecture provides stronger isolation, it introduces unnecessary complexity for this project's scope.

---

# ADR-002

## Entity Framework Core

Status

Accepted

Decision

Use Entity Framework Core with SQL Server.

Reason

- Strong .NET integration.
- Excellent migration support.
- Code First workflow.
- Large community.
- Production ready.

Alternative

Dapper

Reason rejected

Less productive for this project and requires more manual mapping.

---

# ADR-003

## Code First

Status

Accepted

Reason

Database schema is controlled from C# models.

Advantages

- Easier version control.
- Easy migrations.
- Better maintainability.

---

# ADR-004

## Repository Pattern

Status

Accepted

Reason

Repositories isolate database access from business logic.

Benefits

- Testability.
- Clean separation.
- Easier replacement of data source.
- Better maintainability.

---

# ADR-005

## Unit Of Work

Status

Accepted

Reason

Multiple repositories should participate in a single transaction.

Benefits

- Transaction consistency.
- Single SaveChanges().
- Cleaner service layer.

---

# ADR-006

## Dependency Injection

Status

Accepted

Reason

Use the built-in ASP.NET Core Dependency Injection container.

Benefits

- Loose coupling.
- Easier testing.
- Better maintainability.

---

# ADR-007

## JWT Authentication

Status

Accepted

Reason

REST APIs should be stateless.

JWT provides

- Stateless authentication.
- Easy frontend integration.
- Industry standard.

Alternative

Cookie Authentication

Rejected because

The frontend is a separate application.

---

# ADR-008

## Refresh Tokens

Status

Accepted

Reason

JWT access tokens should remain short-lived.

Refresh Tokens improve

- Security.
- User experience.

---

# ADR-009

## ASP.NET Identity

Status

Accepted

Reason

Avoid implementing authentication manually.

Identity already provides

- Password hashing.
- User management.
- Roles.
- Security best practices.

---

# ADR-010

## AutoMapper

Status

Accepted

Reason

Avoid repetitive DTO mapping code.

Benefits

- Cleaner services.
- Less boilerplate.
- Easier maintenance.

---

# ADR-011

## FluentValidation

Status

Accepted

Reason

Validation should remain outside controllers.

Benefits

- Cleaner controllers.
- Reusable validation rules.
- Better separation of concerns.

---

# ADR-012

## Global Exception Middleware

Status

Accepted

Reason

Every API response should have a consistent error format.

Benefits

- Unified error responses.
- Easier debugging.
- Better frontend integration.

---

# ADR-013

## Serilog

Status

Accepted

Reason

Structured logging is required.

Benefits

- Easier troubleshooting.
- Better production diagnostics.

---

# ADR-014

## Generic Repository

Status

Accepted

Reason

Most CRUD operations are identical.

Benefits

- Less duplicated code.
- Easier maintenance.

Custom repositories should only be created when entity-specific queries are required.

---

# ADR-015

## DTO Pattern

Status

Accepted

Reason

Entities should never be exposed directly through the API.

Benefits

- Better security.
- API stability.
- Easier versioning.

---

# ADR-016

## Soft Delete

Status

Accepted

Reason

Deleted records may need to be restored or audited.

Implementation

- IsDeleted flag
- Global Query Filters

Benefits

- Data recovery.
- Audit support.

---

# ADR-017

## Response Wrapper

Status

Accepted

Decision

Every API response uses ApiResponse<T>.

Reason

Clients should always receive a predictable response format.

Example

{
    "success": true,
    "message": "...",
    "data": { },
    "errors": null
}

---

# ADR-018

## Async Programming

Status

Accepted

Decision

All database operations should use async methods.

Reason

Avoid blocking request threads.

---

# ADR-019

## Frontend Technology

Status

Accepted

Decision

Frontend will use

- React
- TypeScript
- Vite

Reason

- Excellent developer experience.
- Strong ecosystem.
- Modern tooling.
- Widely used in industry.

---

# ADR-020

## Project Philosophy

This project is intentionally built as if it were a production system.

Every implementation should prioritize

- Readability.
- Maintainability.
- Scalability.
- Security.
- Performance.

No shortcuts.

No quick fixes.

No duplicated logic.

Every new feature should respect the existing architecture.