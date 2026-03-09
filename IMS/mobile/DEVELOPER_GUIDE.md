# IMS Developer Guide

## Introduction
Welcome to the Institute Management System (IMS) project. This guide will help you understand the architecture and how to contribute to the codebase.

## Architecture
We follow **Clean Architecture** principles to ensure scalability and maintainability. The code is organized into three main layers:

### 1. Domain Layer (`src/domain/`)
- **Purpose**: Contains the business logic and entities. It is independent of any external frameworks or data sources.
- **Components**:
  - `entities/`: Data structures (interfaces/types) representing business objects (e.g., `User`).
  - `repositories/`: Interfaces defining how data is accessed (e.g., `AuthRepository`).
  - `usecases/`: Application-specific business rules (e.g., `LoginUseCase`).

### 2. Data Layer (`src/data/`)
- **Purpose**: Implements the repositories defined in the Domain layer and handles data sources (API, Local Storage).
- **Components**:
  - `api/`: API definitions and client setup.
  - `local/`: Local storage logic (e.g., `AsyncStorage` wrapper).
  - `repositories/`: Concrete implementations of domain repositories (e.g., `AuthRepositoryImpl`).

### 3. Presentation Layer (`src/presentation/`)
- **Purpose**: Handles the UI and user interaction.
- **Components**:
  - `screens/`: React Native screens.
  - `hooks/`: Custom hooks acting as ViewModels, connecting UI to UseCases.
  - `components/`: Reusable UI components.
  - `theme/`: Styling tokens (colors, fonts).

## Core Utilities (`src/core/`)
- **Logger**: Use `Logger.info()`, `Logger.error()` instead of `console.log`.
- **ApiClient**: Use the configured Axios instance in `src/core/api-client.ts`.
- **StorageService**: Use `StorageService.setItem()`, `getItem()` for local persistence.
- **Error Handling**: Use custom errors like `NetworkError`, `ValidationError` from `src/core/error.ts`.

## How to Add a New Feature
Follow these steps to add a feature (e.g., "Student Profile"):

1.  **Domain**:
    - Define the `Student` entity in `src/domain/entities/student.ts`.
    - Define `StudentRepository` interface in `src/domain/repositories/` with methods like `getStudent(id)`.
    - Create a UseCase `GetStudentProfile` in `src/domain/usecases/`.

2.  **Data**:
    - Implement `StudentRepositoryImpl` in `src/data/repositories/`.
    - Call the API using `ApiClient`.

3.  **Presentation**:
    - Create a custom hook `useStudentProfile` in `src/presentation/hooks/`.
    - Create the screen `StudentProfileScreen` in `src/presentation/screens/`.
    - Register the screen in your navigation.

## Best Practices
- **Strict Typing**: Always use TypeScript types/interfaces. Avoid `any`.
- **Error Handling**: Catch errors in the Repository or Hook level and pass user-friendly messages to the UI.
- **Aliases**: Use `@/` to import from `src/` (e.g., `import { User } from '@/domain/entities/user'`).

## Running the Project
- Install dependencies: `npm install`
- Start the app: `npx expo start`
- Run linting: `npm run lint`

## Testing Credentials

The current sample implementation uses a mock authentication repository. You can use the following to test the app:

- **Any Email** (e.g., `user@example.com`): Simulates a successful login and returns a mock User profile.
- **error@example.com**: Simulates a network error to test the error handling UI.

> [!NOTE]
> All emails currently return a user with the `admin` role for demonstration purposes.

## Troubleshooting

### PowerShell Execution Policy Error
If you see an error like `File ... cannot be loaded because running scripts is disabled on this system`, it means your PowerShell execution policy is too restrictive.

**Solutions:**
1.  **Temporary Bypass (Current Terminal):**
    Run this command to allow scripts for the current session only:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
    ```
2.  **Use CMD:**
    Run your commands using `cmd /c` prefix:
    ```cmd
    cmd /c "npm install"
    ```
3.  **Permanent Change (Admin required):**
    Open PowerShell as Administrator and run:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```
