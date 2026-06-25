<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Reference Documents

Before starting any feature work, read both documents below and use them as the authoritative source for what to build and how to build it.

- **User stories:** `docs/user-stories.md` — defines every feature in terms of what the user needs and why. Every piece of code written must trace back to a user story. Do not build features not represented there.
- **Development plan:** `docs/development-plan.md` — defines the tech stack, folder structure, database schema, component names, phase order, and implementation notes. Follow the architecture and naming conventions described there. If a decision is already made in the plan, do not re-litigate it.

# Code Standards

Always use modern JavaScript and current best practices:

- Use ES modules (`import`/`export`) exclusively — never `require()`
- Use `async`/`await` — never raw `.then()` chains
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of manual null guards
- Prefer `const` over `let`; never use `var`
- Use TypeScript strict mode — no `any`, no type assertions unless unavoidable
- Use Server Components by default; only add `'use client'` when the component genuinely needs browser APIs or interactivity
- Use Server Actions for all data mutations — no client-side `fetch` POST/PUT/DELETE calls to internal API routes
- Use `useActionState` (React 19) for form state and validation errors — not `useState` + manual fetch
- Use `useOptimistic` (React 19) for instant UI feedback on mutations
- Validate all user input with Zod on the server before touching the database
- Never expose raw database objects to the client — return only the fields the component needs
