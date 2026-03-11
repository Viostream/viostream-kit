# AGENTS.md — viostream-kit

> This file provides instructions for AI coding agents operating in this repository.
> Sections marked **[TODO]** need to be filled in once the corresponding tooling is set up.

## Project Overview

- **Repository:** Viostream/viostream-kit
- **License:** MIT
- **Language:** [TODO] (not yet configured)
- **Framework:** [TODO] (not yet configured)
- **Package manager:** [TODO] (not yet configured)

## Build Commands

> **[TODO]** Fill these in once a build system is configured (e.g. package.json scripts).

```shell
# Install dependencies
# [TODO] e.g. npm install / pnpm install / yarn

# Build the project
# [TODO] e.g. npm run build

# Development server
# [TODO] e.g. npm run dev
```

## Lint and Format

> **[TODO]** Fill these in once linting/formatting tools are added.

```shell
# Lint all files
# [TODO] e.g. npm run lint

# Auto-fix lint issues
# [TODO] e.g. npm run lint -- --fix

# Format code
# [TODO] e.g. npm run format
```

## Test Commands

> **[TODO]** Fill these in once a test framework is configured.

```shell
# Run all tests
# [TODO] e.g. npm test

# Run a single test file
# [TODO] e.g. npm test -- path/to/file.test.ts

# Run tests matching a pattern
# [TODO] e.g. npm test -- -t "pattern"

# Run tests in watch mode
# [TODO] e.g. npm test -- --watch
```

**When fixing a bug or adding a feature, always run the relevant single test file
rather than the full suite to get fast feedback.**

## Code Style Guidelines

> **[TODO]** Update these once the project establishes conventions.
> The guidelines below are reasonable defaults — replace with actual project rules.

### Imports

- Use ES module syntax (`import`/`export`), not CommonJS (`require`).
- Group imports in this order, separated by blank lines:
  1. Node/built-in modules
  2. External dependencies (third-party packages)
  3. Internal/project modules
  4. Relative imports (siblings, parents)
- Prefer named exports over default exports.

### Formatting

- [TODO] Specify formatter (Prettier, Biome, etc.) and config location.
- Use consistent indentation (2 spaces recommended for JS/TS projects).
- Trailing commas in multi-line structures.
- Semicolons at end of statements.
- Single quotes for strings (unless the project configures otherwise).

### TypeScript / Types

- [TODO] Specify tsconfig location and strictness level.
- Prefer `interface` for object shapes, `type` for unions/intersections/utility types.
- Avoid `any` — use `unknown` and narrow with type guards when the type is uncertain.
- Use explicit return types on exported functions.
- Prefer `readonly` for properties that should not be mutated.

### Naming Conventions

- **Files:** kebab-case (`my-component.ts`, `user-service.ts`).
- **Variables/functions:** camelCase (`getUserById`, `isActive`).
- **Classes/interfaces/types:** PascalCase (`UserService`, `ApiResponse`).
- **Constants:** UPPER_SNAKE_CASE for true constants (`MAX_RETRIES`, `API_BASE_URL`).
- **Booleans:** Prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasPermission`).
- **Private members:** Prefer TypeScript `private` keyword over `_` prefix.

### Error Handling

- Never silently swallow errors — always log or rethrow.
- Use typed/custom error classes for domain-specific errors.
- Prefer early returns and guard clauses over deeply nested conditionals.
- In async code, always handle promise rejections (try/catch or .catch()).

### Comments and Documentation

- Write self-documenting code; use comments to explain *why*, not *what*.
- Use JSDoc/TSDoc for public API functions and exported types.
- Remove commented-out code — use version control history instead.

## Project Structure

> **[TODO]** Fill in once the project structure is established.

```
viostream-kit/
  LICENSE
  AGENTS.md
  # [TODO] Add directory layout here, e.g.:
  # src/           — source code
  # tests/         — test files
  # docs/          — documentation
  # scripts/       — build/utility scripts
```

## CI/CD

> **[TODO]** Fill in once CI pipelines are configured (e.g. GitHub Actions).

```
# [TODO] e.g. .github/workflows/ci.yml
# Describe what the CI pipeline does: lint, test, build, deploy, etc.
```

## Environment and Prerequisites

> **[TODO]** Fill in required tool versions.

- **Node.js:** [TODO] (specify minimum version)
- **Package manager:** [TODO] (npm/pnpm/yarn + version)
- **Other tools:** [TODO]

## Commit Convention

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
Always include the current branch name in the commit footer using a `Branch:` token.

### Format

```
<type>(<optional scope>): <description>

[optional body]

Branch: <branch-name>
```

### Allowed Types

| Type       | Purpose                                        |
|------------|------------------------------------------------|
| `feat`     | A new feature                                  |
| `fix`      | A bug fix                                      |
| `docs`     | Documentation-only changes                     |
| `style`    | Formatting, missing semicolons, etc. (no logic)|
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                        |
| `test`     | Adding or updating tests                       |
| `build`    | Changes to build system or dependencies        |
| `ci`       | Changes to CI configuration                    |
| `chore`    | Other changes that don't modify src or tests   |
| `revert`   | Reverts a previous commit                      |

### Rules

- Use **imperative mood** in the description (e.g. "add feature", not "added feature").
- Keep the first line under **72 characters**.
- Add a blank line between the description and the body/footer.
- Use the body to explain *what* and *why*, not *how*.
- Breaking changes must include `BREAKING CHANGE:` in the footer or `!` after the type/scope.
- The `Branch:` footer is **required** on every commit. Determine the branch
  name by running `git branch --show-current` before committing.

### Examples

```
feat(auth): add OAuth2 login flow

Implement Google and GitHub OAuth2 providers with token refresh support.

BREAKING CHANGE: removed legacy session-based auth endpoints
Branch: feature/oauth2-login
```

```
fix: prevent crash when config file is missing

Branch: fix/missing-config
```

## Agent-Specific Notes

- Always run lint and tests before considering a task complete.
- Prefer editing existing files over creating new ones.
- When adding dependencies, use the project's configured package manager.
- Do not commit `.env` files or secrets.
- Follow existing patterns in the codebase — consistency is more important
  than personal preference.
- When unsure about a convention, check nearby files for precedent.
- **Always** use Conventional Commits with a `Branch:` footer (see above).

---

*Last updated: 2026-03-11. Update this file as the project evolves.*
