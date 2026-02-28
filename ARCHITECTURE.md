# Architecture & Design Decisions

This document outlines the architectural decisions made to fulfill the internship responsibilities, specifically focusing on building scalable solutions, writing clean/maintainable code, and integrating modern technologies.

## 1) Tech Stack Selection & Scalable Solutions

- **Backend: Node.js + Express**
  - Chosen for rapid API development, straightforward JSON handling, and non-blocking I/O. This ensures the foundational backend is highly scalable and performant under load.
- **Frontend: Next.js 14 (React)**
  - Provides a modern React setup utilizing server-side rendering (SSR) capabilities where applicable, reducing initial load times and optimizing rendering performance.
- **Database: MongoDB + Mongoose**
  - **Seamless Data Handling:** A flexible, schema-driven NoSQL document model is perfectly suited for managing user and task entities dynamically. Mongoose provides clean validation layers.
- **AI Integration: Google Gemini API**
  - **Enhancing User Experience:** Utilizing Generative AI tools to magically break down broad project ambitions into exactly 5 concise, actionable sub-tasks.

## 2) Clean, Efficient, and Maintainable Code

### Backend Layers (Decoupled Architecture)
- `src/server.js`: Application bootstrap, middleware wiring, and route mounting.
- `src/routes/*`: Dedicated API endpoint definitions for clean routing.
- `src/controllers/*`: Isolated request handling logic, making edge-cases highly testable.
- `src/models/*`: Explicit Mongoose schemas (`User`, `Task`).
- `src/middleware/*`: Reusable JWT authentication and centralized error handling logic.

### Frontend Design (Modular & Reusable)
- Single-page dashboard located within `app/page.tsx`, securely hiding views behind authentication state.
- Tailored React hooks (`useEffect`, `useCallback`, `useMemo`) utilized to prevent unnecessary re-renders.
- CSS Modules / Tailwind CSS for scoping style logic cleanly.

## 3) Secure Authentication Strategy

- On `register` or `login`, the backend issues a cryptographically secure JWT token alongside the user profile.
- The frontend securely retains this token and securely attaches it via `Authorization: Bearer <token>` to protected endpoints.
- Backend Auth middleware rigorously verifies the token's validity before injecting the `user` identity into the request runtime.

## 4) Data Model (MongoDB Integration)

### User Entity
- `name` (string, required)
- `email` (string, unique, strictly formatted)
- `password` (hashed string using bcrypt for security)
- timestamps (createdAt, updatedAt)

### Task Entity
- `userId` (ObjectId referencing User - ensuring Data Isolation)
- `title` (string, required)
- `description` (string, optional context)
- `status` (`todo` | `in-progress` | `done`)
- timestamps

## 5) Troubleshooting & Debugging for Optimal Performance

- **Zod Validation:** Request payloads are strictly validated in controllers to stop bad data early.
- **Centralized Error Handling:** Any unhandled rejection or throw is routed through a central middleware, preventing API crashes and returning standard `JSON` error wrappers, severely aiding in troubleshooting.
- **React Hydration:** Component initializations delay storage fetches slightly to prevent hydration mismatch bugs between server frames and client frames.

## 6) AI Feature Implementation

- **Endpoint:** `POST /api/ai/task-suggestions`
- **Mechanism:** Takes a plain-text `topic` from the user, constructs a rigid prompt context, and queries the Gemini API.
- **Output:** An array of explicitly actionable string suggestions. The frontend dynamically populates these, letting the user "Use" them instantly to save cognitive load.

## 7) Future Scaling

- The current implementation separates concerns thoroughly. As traffic scales, the Node process can be horizontally scaled, and MongoDB can be clustered with zero code changes dynamically.
