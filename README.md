# Project Architecture Documentation

This document outlines the architecture of the quizz-webapp backend, explaining the design choices, patterns, and technologies used.

## 1. Overall Philosophy

The project aims for a robust, scalable, and maintainable codebase by adhering to the following principles:

-   **Command Query Responsibility Segregation (CQRS)**: We separate operations that read data (Queries) from operations that mutate data (Commands). This allows for optimizing each path independently and simplifies the reasoning about data flow.
-   **Modular Design**: The application is broken down into distinct modules, each responsible for a specific domain or feature set. This promotes loose coupling and high cohesion.
-   **Clean Architecture Principles**: We strive to keep business logic (domain) independent of infrastructure concerns (e.g., database, frameworks). This is achieved through layers of abstraction and dependency inversion.
-   **Type Safety**: TypeScript is used throughout the project to catch errors at compile time and improve code clarity.

## 2. Key Technologies

-   **tRPC**: Used for building type-safe APIs between the server and client. It allows us to share types and ensures that API contracts are respected.
-   **Drizzle ORM**: A TypeScript ORM used for database interactions, providing a type-safe way to query SQL databases.
-   **Zod**: A TypeScript-first schema declaration and validation library. We use Zod to validate input data for commands, queries, and API endpoints.
-   **Vitest**: A fast and modern testing framework used for unit and integration tests.
-   **Yarn**: Used as the package manager for the project.

## 3. Directory Structure (Typical Module)

A typical module within `src/modules/{module_name}` follows this structure:

```
src/modules/{module_name}/
├── application/                  # Application services, use cases
│   ├── commands/                 # Command handlers and definitions
│   │   └── {command_name}/
│   │       ├── {command_name}.command.ts
│   │       └── {command_name}.command.spec.ts
│   └── queries/                  # Query handlers and definitions
│       └── {query_name}/
│           ├── {query_name}.query.ts
│           └── {query_name}.query.spec.ts
├── domain/                       # Core business logic and entities
│   └── {entity_name}/
│       ├── {entity_name}.ts
│       ├── {entity_name}.repository.ts # Or .reader.ts / .writer.ts
│       └── {entity_name}.builder.ts
├── infrastructure/               # Implementation details (database, external services)
│   └── persistence/
│       └── {entity_name}/
│           ├── sql-{entity_name}.repository.ts
│           ├── in-memory-{entity_name}.repository.ts
│           ├── {entity_name}.mapper.ts
│           └── {entity_name}.mapper.spec.ts
├── presentation/                 # API endpoints, controllers (e.g., tRPC routers)
│   └── {entity_name}/
│       └── {entity_name}.controller.ts # Or {module_name}.router.ts for tRPC
├── {module_name}.container.ts    # Dependency injection container setup for the module
└── {module_name}.tokens.ts       # Dependency injection tokens for the module
```

## 4. Core Concepts

### 4.1. Modules

Each business capability or bounded context is encapsulated within its own module. This helps in organizing code and managing dependencies.

### 4.2. Domain Layer

This is the heart of the application and contains the core business logic.

-   **Entities**: Represent business objects with identity and state (e.g., `User`, `Quizz`, `Question`). They encapsulate business rules.
-   **Repositories (or Readers/Writers)**: Interfaces defining contracts for data persistence operations. The domain layer depends on these interfaces, not their concrete implementations. This adheres to the Dependency Inversion Principle.
    -   **Readers**: For query operations.
    -   **Writers**: For command (mutation) operations.
-   **Builders**: Utility classes for creating instances of domain models, primarily for testing. They use `@faker-js/faker` to generate realistic random data, avoiding the need for mocks in many test scenarios.

### 4.3. Application Layer

This layer orchestrates use cases and acts as an intermediary between the presentation layer and the domain layer.

-   **Commands**: Represent an intent to change the state of the system (e.g., `CreateQuizzCommand`, `UpdateQuestionCommand`). Each command has a dedicated handler that processes it, interacts with the domain layer, and persists changes via repositories/writers.
-   **Queries**: Represent an intent to retrieve data (e.g., `GetQuizzByIdQuery`, `ListAllQuestionsQuery`). Each query has a handler that fetches data using repositories/readers.
-   **Input Validation**: Zod schemas are used to validate the input to commands and queries, ensuring data integrity before processing.

### 4.4. Infrastructure Layer

This layer contains implementations of interfaces defined in the domain or application layers. It deals with external concerns like databases, file systems, or third-party APIs.

-   **Persistence**: Concrete implementations of repository interfaces. We typically provide:
    -   **SQL Repositories**: Using Drizzle ORM to interact with a SQL database.
    -   **In-Memory Repositories**: For testing or development environments, providing a fast and isolated way to simulate data persistence.
-   **Mappers**: Responsible for converting data between domain entities and persistence models (e.g., database table structures) or DTOs. This separation ensures that the domain model is not polluted with persistence-specific details.

### 4.5. Presentation Layer

This layer is responsible for handling incoming requests and sending responses. In this project, it primarily consists of:

-   **tRPC Routers**: Define API endpoints, map them to application layer commands or queries, and handle request/response serialization/deserialization.

## 5. Data Flow Example

### Command Flow (e.g., Creating a Quizz):

1.  Client sends a request to a tRPC endpoint (e.g., `quizz.create`).
2.  The tRPC router in the presentation layer receives the request.
3.  Input data is validated using a Zod schema.
4.  The router dispatches a `CreateQuizzCommand` to its handler in the application layer.
5.  The command handler:
    a. May perform business logic validation.
    b. Uses a domain entity (e.g., `Quizz.create(...)`) to create a new quizz instance.
    c. Uses a `QuizzWriter` (repository) to persist the new quizz.
6.  The tRPC router sends a response back to the client.

### Query Flow (e.g., Fetching a Quizz):

1.  Client sends a request to a tRPC endpoint (e.g., `quizz.getById`).
2.  The tRPC router receives the request.
3.  Input data (e.g., quizz ID) is validated.
4.  The router dispatches a `GetQuizzByIdQuery` to its handler.
5.  The query handler uses a `QuizzReader` (repository) to fetch the quizz data.
6.  Data might be mapped to a DTO if necessary.
7.  The tRPC router sends the data back to the client.

## 6. Testing Strategy

-   **Unit Tests**: Vitest is used for writing unit tests. We focus on testing individual units (classes, functions) in isolation.
-   **Builders over Mocks**: Domain model builders (`*.builder.ts`) are heavily used to create test data. This approach is preferred over extensive mocking because it leads to more realistic and maintainable tests.
-   **In-Memory Repositories**: In-memory implementations of repositories are used for testing application service and query/command handlers to ensure tests are fast and reliable without needing a database.
-   **Test Coverage**: Aim for comprehensive test coverage for domain logic and application services.

## 7. Module Scaffolding

To accelerate the creation of new modules, a shell script `scripts/create-module.sh` is available. It can be run using `yarn create-module <source-slug> <target-slug>`.

This script:

-   Creates the basic directory structure for the target module.
-   Copies and renames files from a source module's `domain/` and `infrastructure/` directories if they exist.
-   Creates empty `application/commands/` and `application/queries/` directories.
-   Creates other module files (like `.tokens.ts`, `.container.ts`) as empty shells.

Developers need to manually populate empty files and review/update any copied content to fit the new module's requirements.

## 8. Dependency Injection

The project uses a token-based dependency injection (DI) system, likely facilitated by files like `{module_name}.container.ts` and `{module_name}.tokens.ts`. This allows for decoupling components and managing dependencies effectively, especially for swapping implementations (e.g., SQL vs. In-Memory repositories).
