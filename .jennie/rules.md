# Jennie Custom Security & Repository Guidelines

Define your team's custom code standards, sensitive path protections, and security rules here.

## 1. Security Requirements
- Never commit hardcoded API keys, bearer tokens, or database passwords.
- All dynamic API routes must validate request payloads using Zod schemas.
- Sanitize user inputs before rendering to prevent XSS vulnerabilities.

## 2. Architecture Standards
- Keep TypeScript types strictly defined; avoid `any`.
- Ensure all public functions have descriptive comments.

## 3. Testing Standards
- New features must include corresponding unit tests.
