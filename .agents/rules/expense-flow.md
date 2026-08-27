---
trigger: always_on
description: Persistent project rules for ExpenseFlow development
---

# ExpenseFlow Agent Rules

# ExpenseFlow Copilot Instructions

## Sources of truth

Before planning or implementing a task, read:

1. The task definition in `docs/backlog.md`.
2. Relevant product behavior in `docs/requirements.md`.
3. Relevant technical decisions in `docs/architecture.md`.
4. Relevant HTTP contracts in `docs/api.md`.
   These documents are the sources of truth. Do not silently change or contradict them.

If the documents conflict in a way that affects product behavior, security, architecture, data model or API contract, stop and report the exact conflict before implementing.

## Task scope

- Work on only the task ID explicitly requested by the user.
- Confirm that its dependencies are complete before implementation.
- Do not implement future tasks.
- Do not expand the MVP.
- Do not perform unrelated refactoring.
- Preserve existing user changes outside the current task.
- Do not modify requirements, architecture or API contracts unless the current request explicitly asks for documentation changes.
- Do not mark a task `DONE` without user confirmation after review and manual acceptance.

## Planning workflow

When asked to plan a task:

- Read the task and relevant documentation.
- Inspect the current workspace and Git changes.
- Do not modify files or run commands that change the workspace.
- List the files expected to be created or modified.
- List packages and commands expected to be used.
- Map the plan to every acceptance criterion.
- Identify automated tests and manual acceptance checks.
- Report assumptions, risks and unresolved conflicts.
- Wait for approval before implementation.

## Implementation workflow

When the user approves implementation:

- Implement only the approved task and plan.
- Keep changes small and reviewable.
- Explain any necessary deviation before making it.
- Do not add dependencies that were not in the approved plan without explaining why.
- Never commit credentials, tokens, cookies, passwords, database URLs or other secrets.
- Do not commit or push unless explicitly requested.

## Verification

Before reporting implementation complete:

- Run the tests relevant to the task.
- Run applicable lint, typecheck and build checks.
- Confirm existing relevant tests still pass.
- Perform automated acceptance checks described in the backlog.
- Report manual checks the user must perform.
- Compare the result with every acceptance criterion.
- Report commands run and their actual results.
- Report files created or modified.
- Report incomplete items and risks honestly.
- Provide a concise Git diff summary.
  A task is not complete merely because code was generated.

## Project boundaries

- Backend is the authority for authentication, authorization and state transitions.
- Frontend visibility is only UX and never replaces backend authorization.
- Do not add public registration, payment, receipt upload, user-management UI/API, password change/reset, logout-all, pending-expense reassignment or other out-of-MVP features.
- Do not store access tokens or CSRF tokens in localStorage.
- Do not expose secrets, stack traces or internal metadata.
- Money uses positive integer VND, never floating point.
- State transitions and audit-event creation must be atomic.
- Audit events are append-only.

## Manager authorization

Evaluate Manager authorization separately for each operation:

- General expense list uses current `User.managerId`.
- Expense detail allows the Employee owner, current Manager or current `Expense.assignedManagerId`.
- Pending approval queue uses `status=PENDING` and `Expense.assignedManagerId`.
- Approve/reject uses only `Expense.assignedManagerId`; it must not require the owner to remain a current direct report.
- Audit visibility allows the Employee owner or current `Expense.assignedManagerId`.
- Dashboard general aggregates use current `User.managerId`.
- Dashboard `pendingApprovalCount` uses `status=PENDING` and `Expense.assignedManagerId`.
  Do not replace these operation-specific policies with one generic Manager-scope condition.

## Response after implementation

Always report:

1. Files created or modified.
2. Main implementation decisions.
3. Commands run and actual results.
4. Acceptance criteria satisfied.
5. Manual checks still required.
6. Incomplete work or risks.
7. Git diff summary.
   Do not automatically start the next task.
