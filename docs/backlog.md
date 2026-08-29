# ExpenseFlow Backlog

## Quy uoc

- `requirements.md`, `architecture.md` va `api.md` la nguon su that.
- Moi task co Muc tieu, Pham vi, Acceptance criteria, Dependency, Automated tests, Manual acceptance check, Deliverable/evidence va Trang thai.
- Task chi `DONE` khi acceptance criteria, API/UI trong pham vi, test moi, regression lien quan, manual check (neu co), lint/typecheck/build lien quan deu pass va khong co thay doi ngoai pham vi.
- Cac task EF-019, EF-020, EF-021, EF-022, EF-023, EF-024, EF-025, EF-026, EF-027, EF-028, EF-029 va EF-030 la vertical slice: domain/backend, API, frontend UI, validation/error states va test trong cung task.
- Playwright va Full CI chi bat dau sau flow chinh.
- Khong them public registration, receipt upload, payment that, user-management UI/API, reassign pending expense, password change/forgot/reset hoac logout-all UI/API.

## Epic 1: Foundation va Workspace

### EF-001 - Workspace va runtime

- Muc tieu: Tao monorepo TypeScript voi pnpm va runtime policy.
- Pham vi: pnpm workspaces, Node 24.x LTS, pnpm 11.x, `.nvmrc`, engines, exact packageManager va package names.
- Acceptance criteria: Khong Turborepo; package `@expense-flow/web`, `@expense-flow/api`, `@expense-flow/shared`; `.nvmrc` la `24`; engines Node `>=24 <25`, pnpm `>=11 <12`; `packageManager` la `pnpm@11.20.0`.
- Dependency: Khong co.
- Automated tests: Workspace resolution, package names va runtime constraint checks.
- Manual acceptance check: Review workspace policy.
- Deliverable/evidence: Root manifests, `.nvmrc`, `pnpm-workspace.yaml`, workspace discovery output voi `pnpm 11.20.0`, Node `24.18.0` va manual review da duoc user xac nhan.
- Trang thai: `DONE`

### EF-002 - Shared package foundation

- Muc tieu: Cung cap contract dung chung cho web va API.
- Pham vi: TypeScript shared package, role/status/category va contract can thiet; khong database access.
- Acceptance criteria: Web/API import duoc package; khong co database implementation.
- Dependency: EF-001.
- Automated tests: Shared typecheck va sample unit test.
- Manual acceptance check: Kiem tra khong co dependency nguoc.
- Deliverable/evidence: Shared source, manifest va test output.
- Trang thai: `DONE`

### EF-003 - Next.js frontend foundation

- Muc tieu: Tao Next.js App Router voi Tailwind va placeholder page.
- Pham vi: Next.js, TypeScript, Tailwind CSS, placeholder; khong business UI.
- Acceptance criteria: App Router va Tailwind hoat dong; placeholder render; co cau truc mo rong components/features/lib/providers; chua co login/expense form.
- Dependency: EF-001, EF-002.
- Automated tests: Placeholder render test.
- Manual acceptance check: Mo frontend va thay placeholder.
- Deliverable/evidence: Web app, Tailwind config, screenshot/local URL.
- Trang thai: `DONE`

### EF-004 - Frontend form va server-state conventions

- Muc tieu: Dat convention cho form/server state.
- Pham vi: React Hook Form, Zod, `@hookform/resolvers`, TanStack Query, QueryClient provider, native fetch.
- Acceptance criteria: QueryClientProvider dung client boundary; form sau nay dung RHF + Zod; Query chi server state; local state cho UI; khong Redux/Zustand/Axios.
- Dependency: EF-003.
- Automated tests: Provider/query client setup test.
- Manual acceptance check: Kiem tra client/server boundary.
- Deliverable/evidence: Provider/convention source va test output.
- Trang thai: `DONE`

### EF-005 - Frontend test infrastructure

- Muc tieu: Cau hinh Vitest + RTL + jsdom.
- Pham vi: Test config va mot smoke test nho.
- Acceptance criteria: jsdom hoat dong; RTL render duoc placeholder; smoke test chay qua package script.
- Dependency: EF-003.
- Automated tests: Vitest/RTL/jsdom smoke test.
- Manual acceptance check: Review test output.
- Deliverable/evidence: Config, smoke test va output.
- Trang thai: `DONE`

### EF-006 - Express application foundation

- Muc tieu: Tao Express 5 ESM app tach process startup.
- Pham vi: TypeScript strict, `app.ts`, `server.ts`, JSON body limit, helmet, cors, cookie-parser.
- Acceptance criteria: `app.ts` khong `listen()`; `server.ts` start server; import app khong bind port; CORS environment-based va body limit.
- Dependency: EF-001, EF-002.
- Automated tests: Import app, middleware va request parsing tests.
- Manual acceptance check: Start server va kiem tra app test doc lap.
- Deliverable/evidence: App/server source va tests.
- Trang thai: `DONE`

### EF-007 - Backend configuration va logging

- Muc tieu: Environment validation va structured logging an toan.
- Pham vi: Zod config, pino, pino-http; chua auth/security.
- Acceptance criteria: Khong doc `process.env` rai rac; khong log password/token/cookie/secret; chua JWT, auth middleware, CSRF, rate limit, password hashing.
- Dependency: EF-006.
- Automated tests: Config valid/invalid va logging redaction tests.
- Manual acceptance check: Review log mau khong co secret.
- Deliverable/evidence: Config/logger source va output.
- Trang thai: `DONE`

### EF-008 - API error foundation

- Muc tieu: Chuan hoa HTTP error handling cho cac endpoint sau.
- Pham vi: Request ID, validation convention, global error handler, 404 handler, error envelope.
- Acceptance criteria: Error co `code`, `message`, optional `details`, `requestId`; 404 hoat dong; khong stack trace/secret/token/password/hash.
- Dependency: EF-006, EF-007.
- Automated tests: Unit/integration tests request ID, 404, validation va error contract.
- Manual acceptance check: Goi route khong ton tai va request sai.
- Deliverable/evidence: Middleware va sample responses.
- Trang thai: `DONE`

### EF-009 - Health endpoint va integration test

- Muc tieu: Tao health endpoint khong phu thuoc business schema.
- Pham vi: `GET /api/v1/health`, Vitest + Supertest.
- Acceptance criteria: Khong auth; HTTP 200; body `{ "status": "ok" }`.
- Dependency: EF-008.
- Automated tests: Health integration test.
- Manual acceptance check: Goi endpoint khi API chay.
- Deliverable/evidence: Route, test va response.
- Trang thai: `DONE`

### EF-010 - Docker Compose va environment hygiene

- Muc tieu: Chuan bi PostgreSQL local va Git hygiene.
- Pham vi: Docker Compose, `.env.example`, `.gitignore`; khong Prisma schema/migration.
- Acceptance criteria: PostgreSQL khoi dong; env example an toan; ignore `.env`, node_modules, secrets, password, token, volume, artifact.
- Dependency: EF-001.
- Automated tests: Compose startup va tracked-file hygiene checks.
- Manual acceptance check: Kiem tra database start va Git status.
- Deliverable/evidence: Compose/env/gitignore files.
- Trang thai: `DONE`

### EF-011 - Foundation verification

- Muc tieu: Xac nhan foundation chay duoc truoc database feature.
- Pham vi: Scripts va verification commands.
- Acceptance criteria: `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, health va `docker compose up` pass; khong co feature epic sau.
- Dependency: EF-002, EF-003, EF-004, EF-005, EF-006, EF-007, EF-008, EF-009, EF-010.
- Automated tests: Foundation command suite.
- Manual acceptance check: Mo placeholder va goi health.
- Deliverable/evidence: Checklist output va clean Git status.
- Trang thai: `DONE`

## Epic 2: Early CI

### EF-012 - Early CI foundation

- Muc tieu: Chay validation co ban som.
- Pham vi: GitHub Actions Linux runner, lint, typecheck, unit co ban, build va health check.
- Acceptance criteria: Khong phu thuoc Playwright/integration chua tao; failure lam job fail.
- Dependency: EF-011.
- Automated tests: Workflow run.
- Manual acceptance check: Review ordering va result.
- Deliverable/evidence: Green Early CI run.
- Trang thai: `DONE`

## Epic 3: Database va Seed

### EF-013 - Prisma schema va database connection

- Muc tieu: Tao data model trong `apps/api/prisma`.
- Pham vi: User, Expense, RefreshSession, AuditEvent, enums/indexes; API-only database access.
- Acceptance criteria: `managerId` va `assignedManagerId` nullable; frontend khong co DB credential; co dev/test database.
- Dependency: EF-011.
- Automated tests: Prisma validation va DB connection integration test.
- Manual acceptance check: Review schema va access boundary.
- Deliverable/evidence: Prisma schema/generated client config.
- Trang thai: `DONE`

### EF-014 - Development/test migration workflow

- Muc tieu: Quan ly migration development/test va quy uoc production.
- Pham vi: Tao/review/commit migration, apply test DB, `prisma migrate deploy`, khong startup migration, seed tach rieng.
- Acceptance criteria: Test/production dung deploy; production khong migrate dev; API startup khong migrate; migration files committed.
- Dependency: EF-013.
- Automated tests: Apply migration tren `TEST_DATABASE_URL` va verify schema.
- Manual acceptance check: Review migration diff va startup command.
- Deliverable/evidence: Migration files va test DB output.
- Trang thai: `DONE`

### EF-015 - Idempotent demo seed

- Muc tieu: Tao demo users tu credentials environment an toan.
- Pham vi: Argon2id, password 12-128, explicit/idempotent seed; khong production auto-seed.
- Acceptance criteria: Credentials local/CI/prod rieng; khong commit credential; seed khong chay cung migration.
- Dependency: EF-013, EF-014.
- Automated tests: Seed mapping, password validation va idempotency tests.
- Manual acceptance check: Goi seed hai lan va kiem tra khong duplicate.
- Deliverable/evidence: Seed source, safe env example va output.
- Trang thai: `DONE`

## Epic 4: Authentication va Session

### EF-016 - Login end-to-end

- Muc tieu: Cho phep demo user login voi token memory.
- Pham vi: Login, Origin/rate limit, access token 15 phut, refresh cookie, CSRF token dau.
- Acceptance criteria: Chi seeded user; access token khong localStorage; refresh HttpOnly; response co access/user/CSRF.
- Dependency: EF-008, EF-015.
- Automated tests: Auth unit va login integration tests.
- Manual acceptance check: Login va kiem tra browser storage khong co token.
- Deliverable/evidence: Auth API/UI, tests va browser evidence.
- Trang thai: `DONE`

### EF-017 - Refresh sessions va logout

- Muc tieu: Hoan thien multiple-session lifecycle.
- Pham vi: RefreshSession hash, rotation, revoke current, internal revoke-all, me/logout.
- Acceptance criteria: Moi login tao session; nhieu device; DB chi hash; logout chi revoke session hien tai; khong password/logout-all API/UI MVP.
- Dependency: EF-016.
- Automated tests: Rotation, multiple session, revoke va me integration tests.
- Manual acceptance check: Logout session nay khong lam mat session khac.
- Deliverable/evidence: Session service/endpoints va test output.
- Trang thai: `DONE`

### EF-018 - CSRF va cookie/CORS end-to-end

- Muc tieu: Bao ve refresh/logout flows.
- Pham vi: CSRF endpoint/token hash, Origin, CORS credentials, cookie attributes.
- Acceptance criteria: CSRF endpoint dung refresh cookie va no-store; refresh/logout bat buoc cookie + `X-CSRF-Token` + Origin; refresh rotate hai token; development cookie Secure=false/HttpOnly/Lax; production cross-site cookie Secure=true/HttpOnly/SameSite=None/host-only/Path auth; CORS khong wildcard.
- Dependency: EF-017.
- Automated tests: CSRF/Origin/CORS/cookie/rotation tests.
- Manual acceptance check: Valid flow thanh cong, thieu CSRF/Origin bi chan.
- Deliverable/evidence: Security config, auth client, tests va network evidence.
- Trang thai: `DONE`

## Epic 5: Employee Draft va Submit

### EF-019 - Tao expense draft end-to-end

- Muc tieu: Employee tao `DRAFT`.
- Pham vi: Domain/API create, RHF+Zod form, UI validation/error states.
- Acceptance criteria: Owner/status server-assigned; title <=120, description <=1000, amount positive integer, category enum, date-only khong tuong lai; UI hien loi.
- Dependency: EF-018.
- Automated tests: Validation unit, API integration, form/component tests.
- Manual acceptance check: Tao draft hop le va thu tung input sai.
- Deliverable/evidence: API/UI source, tests va screenshot.
- Trang thai: `TODO`

### EF-020 - Sua/xoa/detail end-to-end

- Muc tieu: Employee quan ly draft va xem detail dung policy.
- Pham vi: PATCH/DELETE/detail API/UI, ownership/state errors.
- Acceptance criteria: Chi owner Employee sua/xoa DRAFT; khong sua system/assignment; Employee owner, Manager current hoac assigned duoc xem detail; xem detail khong cap approve/reject.
- Dependency: EF-019.
- Automated tests: API policy/state/field tests va UI component tests.
- Manual acceptance check: Owner/non-owner/non-draft va current/assigned Manager scenarios.
- Deliverable/evidence: API/UI, tests va scenario record.
- Trang thai: `TODO`

### EF-021 - Submit expense end-to-end

- Muc tieu: Employee dua draft vao approval.
- Pham vi: Submit action, manager snapshot, submittedAt, UI states.
- Acceptance criteria: Chi owner Employee submit DRAFT; snapshot lay `User.managerId`; thieu manager `409 EMPLOYEE_MANAGER_REQUIRED`; transition/audit cung transaction; UI xu ly conflict.
- Dependency: EF-018, EF-019, EF-020.
- Automated tests: State/manager unit, API integration, submit component tests.
- Manual acceptance check: Submit thanh cong, thieu manager va status da doi.
- Deliverable/evidence: Submit API/UI, tests va atomic audit evidence.
- Trang thai: `TODO`

## Epic 6: Manager Approval va Audit

### EF-022 - Pending approval queue end-to-end

- Muc tieu: Manager xem queue phu trach.
- Pham vi: Queue API/UI, `PENDING` + assigned snapshot, loading/empty/error states.
- Acceptance criteria: Chi expense `PENDING` co `assignedManagerId` bang Manager hien tai; khong dung `User.managerId`; Employee khong co queue.
- Dependency: EF-021.
- Automated tests: Queue query/authorization integration va component tests.
- Manual acceptance check: M1 thay item cua M1; M2 khong thay queue item cua M1.
- Deliverable/evidence: Queue endpoint/page, tests va screenshot.
- Trang thai: `TODO`

### EF-023 - Approve expense end-to-end

- Muc tieu: Assigned Manager approve.
- Pham vi: Approve domain/API/UI, immutability/conflict.
- Acceptance criteria: Actor role `MANAGER`, owner role `EMPLOYEE`, expense `PENDING` va actor id bang `assignedManagerId`; khong kiem tra current `User.managerId`; khong self-approve; `PENDING -> APPROVED`; audit atomic; UI co states.
- Dependency: EF-022.
- Automated tests: Policy/state unit, API integration, component/conflict tests.
- Manual acceptance check: Assigned success; current/unrelated blocked; approved terminal.
- Deliverable/evidence: Approve API/UI, tests va manual record.
- Trang thai: `TODO`

### EF-024 - Reject expense end-to-end

- Muc tieu: Assigned Manager reject voi reason.
- Pham vi: Reject domain/API/UI, reason validation.
- Acceptance criteria: Actor role `MANAGER`, owner role `EMPLOYEE`, expense `PENDING` va actor id bang `assignedManagerId`; khong kiem tra current `User.managerId`; reason khong rong; metadata khong doi; `PENDING -> REJECTED`; audit atomic; UI hien loi.
- Dependency: EF-022.
- Automated tests: Reason/state/policy unit, API integration, form/component/conflict tests.
- Manual acceptance check: Empty reason blocked; assigned reject success.
- Deliverable/evidence: Reject API/UI, tests va audit result.
- Trang thai: `TODO`

### EF-025 - Reopen rejected expense end-to-end

- Muc tieu: Owner dua rejected ve draft.
- Pham vi: Reopen API/domain/UI, xoa assignment, resubmit preparation.
- Acceptance criteria: Chi owner Employee reopen `REJECTED`; `APPROVED` blocked; `assignedManagerId` bi xoa; audit atomic; UI sua lai draft.
- Dependency: EF-024.
- Automated tests: Transition/authorization unit, API integration, component/atomicity tests.
- Manual acceptance check: Owner reopen; manager khong duoc reopen; assignment bi xoa.
- Deliverable/evidence: Reopen API/UI, tests va scenario record.
- Trang thai: `TODO`

### EF-026 - Audit history end-to-end

- Muc tieu: Hien thi audit theo assigned snapshot.
- Pham vi: Append-only persistence/API/UI, allowlist va transaction evidence.
- Acceptance criteria: Co submit/approve/reject/reopen; employee owner hoac assigned Manager hien tai moi xem; sau reopen khi `assignedManagerId` bi xoa, Manager khong xem duoc; sau resubmit assigned Manager moi xem duoc toan bo history cu; allowlist chi id/event/actor/from/to/reason/createdAt; khong secrets/internal metadata; UI states.
- Dependency: EF-021, EF-023, EF-024, EF-025.
- Automated tests: Visibility/allowlist/append-only integration va component tests.
- Manual acceptance check: Pending assign M1: M1 xem; doi current sang M2: M2 khong xem audit; M1 van xem; M1 reject, owner reopen: Manager khong xem; resubmit assign M2: M2 xem toan bo history cu, owner luon xem.
- Deliverable/evidence: History API/UI, response sample, tests va screenshot.
- Trang thai: `TODO`

### EF-027 - Operational manager assignment policy

- Muc tieu: Bao ve snapshot khi quan he manager doi.
- Pham vi: Domain policy/unit-testable rule; khong user-management UI/API.
- Acceptance criteria: Doi `User.managerId` khong doi pending `assignedManagerId`; khong vo hieu hoa Manager con pending assigned expense neu operation noi bo ton tai; khong tao operation gia de reassign.
- Dependency: EF-013, EF-021, EF-026.
- Automated tests: Unit snapshot/policy tests; integration chi neu co operation MVP thuc su goi duoc.
- Manual acceptance check: Review M1 -> M2 policy scenario; khong can UI/API.
- Deliverable/evidence: Policy module, unit output va operational note.
- Trang thai: `TODO`

## Epic 7: List, Filter, Pagination va Dashboard

### EF-028 - General expense list end-to-end

- Muc tieu: Manager/Employee xem general list dung scope.
- Pham vi: List domain/API/UI, owner list va current direct-report list.
- Acceptance criteria: Employee chi owner; Manager chi expense cua Employee co `User.managerId` la Manager hien tai; list khong cap approve/reject; UI states.
- Dependency: EF-020, EF-027.
- Automated tests: Query/authorization integration va list component tests.
- Manual acceptance check: M2 thay X general list sau doi manager; M1 khong thay qua general list neu khong con direct report.
- Deliverable/evidence: List API/page, tests, screenshot.
- Trang thai: `TODO`

### EF-029 - Filters va pagination end-to-end

- Muc tieu: Loc/phan trang trong authorization scope.
- Pham vi: status/category/date filters, page/limit, UI controls.
- Acceptance criteria: page tu 1, limit mac dinh 20/toi da 100; response co page/limit/total/totalPages; filters khong vuot scope; UI errors.
- Dependency: EF-028.
- Automated tests: API filter/pagination integration va component tests.
- Manual acceptance check: Boundary 1/20/100, filter combinations va empty page.
- Deliverable/evidence: API/UI, tests va sample response.
- Trang thai: `TODO`

### EF-030 - Current-month dashboard end-to-end

- Muc tieu: Hien thi dashboard MVP.
- Pham vi: Aggregation API/domain/UI, current month.
- Acceptance criteria: General aggregates (count/tong tien theo status, tong tien theo category) cua Employee dung owner scope va cua Manager dung current direct-report `User.managerId`; `pendingApprovalCount` chi dung `status = PENDING` va `assignedManagerId` cua Manager hien tai; khong custom range; UI states; tien integer VND.
- Dependency: EF-028, EF-029, EF-023, EF-024.
- Automated tests: Aggregation unit, API integration va dashboard component tests.
- Manual acceptance check: Kiem tra current month, hai role va totals; E doi M1 -> M2 khi X pending assign M1: general aggregates M2 co X, M1 khong con X, `pendingApprovalCount` M1 co X va M2 khong co X.
- Deliverable/evidence: Dashboard API/page, tests va screenshot.
- Trang thai: `TODO`

## Epic 8: Frontend Quality

### EF-031 - Frontend hardening va consistency review

- Muc tieu: Hoan thien UX sau cac vertical da co UI.
- Pham vi: Error/validation consistency, auth memory behavior, loading/empty/error gaps; khong xay business UI moi.
- Acceptance criteria: Moi man hinh phan biet validation/auth/authorization/conflict; token chi memory; controls phan anh role/state; khong con gap da ghi nhan.
- Dependency: EF-019, EF-020, EF-021, EF-022, EF-023, EF-024, EF-025, EF-026, EF-027, EF-028, EF-029, EF-030.
- Automated tests: Regression component tests cho gap da sua.
- Manual acceptance check: Review tat ca flow MVP.
- Deliverable/evidence: Review checklist va regression output.
- Trang thai: `TODO`

### EF-032 - Accessibility hardening

- Muc tieu: Hoan thien accessibility co ban.
- Pham vi: Labels, keyboard, focus, validation relationships.
- Acceptance criteria: Form/action/error co label ro; keyboard/focus hoat dong; khong doi business/API.
- Dependency: EF-031.
- Automated tests: Component/accessibility checks.
- Manual acceptance check: Keyboard walkthrough tat ca man hinh MVP.
- Deliverable/evidence: Accessibility checklist va output.
- Trang thai: `TODO`

## Epic 9: Playwright va Full CI

### EF-033 - Playwright E2E

- Muc tieu: Test end-to-end cac flow chinh.
- Pham vi: Login, draft CRUD, submit, queue, approve/reject, reopen, audit, list/filter/pagination/dashboard.
- Acceptance criteria: Chi them sau flow chinh; credentials/test data rieng; khong credential trong repo.
- Dependency: EF-030, EF-031, EF-032.
- Automated tests: Playwright suite.
- Manual acceptance check: Review report/traces va flow hai role.
- Deliverable/evidence: Config, report va screenshots/traces khi can.
- Trang thai: `TODO`

### EF-034 - Full CI

- Muc tieu: Chay integration va E2E trong CI.
- Pham vi: PostgreSQL service container Linux, Vitest integration, Playwright, lint/typecheck/build.
- Acceptance criteria: Khong test chua tao; test DB setup/reset; failure lam CI fail.
- Dependency: EF-014, EF-015, EF-026, EF-030, EF-033.
- Automated tests: Full workflow run.
- Manual acceptance check: Review ordering va artifacts.
- Deliverable/evidence: Green full CI run.
- Trang thai: `TODO`

### EF-035 - Provision production PostgreSQL

- Muc tieu: Provision Render PostgreSQL private database va wire secret.
- Pham vi: Resource, network/access va GitHub Environment secrets wiring.
- Acceptance criteria: Database khong public; chi API access; `PRODUCTION_DATABASE_URL` duoc luu trong GitHub Environment secret; connection string khong commit.
- Dependency: EF-034.
- Automated tests: Provider/config validation neu co.
- Manual acceptance check: Review network, masking va access.
- Deliverable/evidence: Provider record va redacted config check.
- Trang thai: `TODO`

### EF-036 - Production migration gate

- Muc tieu: Migration production mot lan qua GitHub Actions truoc khi trigger deployment.
- Pham vi: Primary free/portfolio migration track qua GitHub Actions, secret wiring, concurrency, deployment trigger gate, alternative paid note.
- Acceptance criteria: Primary track chay `pnpm --filter @expense-flow/api db:migrate:deploy` tren GitHub Actions sau khi test pass va truoc khi trigger deploy Render/Vercel; `PRODUCTION_DATABASE_URL` la environment secret; concurrency control; migration failure la STOP gate, ngung ngay khong trigger deploy; khong startup migration; seed rieng; Paid Render pre-deploy command duoc ghi chu duoi dang alternative note.
- Dependency: EF-035.
- Automated tests: Migration success/failure, concurrency va deploy gate tests.
- Manual acceptance check: Review secret scope va failure gate.
- Deliverable/evidence: Workflow, redacted logs va gate evidence.
- Trang thai: `TODO`

### EF-037 - Deploy API va frontend

- Muc tieu: Deploy Express Render Web Service va Next.js Vercel chi khi migration gate da pass.
- Pham vi: Separate services, build/start commands, environment variables, disable auto-deploy on git push.
- Acceptance criteria: Kich hoat deploy Render va Vercel tu dong tu GitHub Actions qua API/Webhook trigger CHI KHI EF-036 migration gate pass 100%; auto-deploy tren Git push o Render va Vercel phai duoc tat (hoac chuyen sang manual/API trigger) de khong bao gio deploy song song hoac truoc migration; frontend khong expose DB credentials.
- Dependency: EF-036.
- Automated tests: Provider build/deploy va health checks.
- Manual acceptance check: Mo frontend production va goi health HTTPS.
- Deliverable/evidence: URLs/logs va redacted env checklist.
- Trang thai: `TODO`

### EF-038 - Production security va smoke verification

- Muc tieu: Xac minh production config va flow chinh.
- Pham vi: Cookie (SameSite=None, Secure, HttpOnly)/CORS/CSRF/HTTPS/origin, migration once, smoke flow, secret exposure.
- Acceptance criteria: Config dung architecture; migration truoc traffic; smoke login, draft, submit, approve/reject, reopen, history, list/dashboard; khong lo secret trong response/log/bundle/repo.
- Dependency: EF-036, EF-037.
- Automated tests: Production smoke/regression checks.
- Manual acceptance check: Checklist hai role va M1/M2 scenario.
- Deliverable/evidence: Redacted smoke/security report.
- Trang thai: `TODO`

### EF-039 - Rollback va recovery note

- Muc tieu: Ghi huong rollback/recovery phu hop portfolio.
- Pham vi: Deploy rollback, migration failure response, service recovery, data safety.
- Acceptance criteria: Note neu migration failure chan deploy va khong startup fallback; huong dan khong co secret.
- Dependency: EF-036, EF-038.
- Automated tests: Markdown/link validation neu co.
- Manual acceptance check: Review recovery note.
- Deliverable/evidence: Versioned rollback/recovery note.
- Trang thai: `TODO`

## Epic 11: Portfolio Completion

### EF-040 - README va project walkthrough

- Muc tieu: Bien project thanh portfolio co the review/chay lai.
- Pham vi: README intro/local setup, architecture diagram, API/doc links, safe demo accounts, screenshots/walkthrough.
- Acceptance criteria: README mo ta MVP/architecture/setup/links; demo credentials chi qua env; co diagram va screenshots; khong credential that.
- Dependency: EF-038, EF-039.
- Automated tests: Markdown/link validation neu co.
- Manual acceptance check: Doc moi follow duoc setup va xem evidence.
- Deliverable/evidence: README, diagram, screenshots va walkthrough.
- Trang thai: `TODO`

### EF-041 - AI-assisted development note

- Muc tieu: Ghi lai cach dung AI co the kiem chung.
- Pham vi: AI support, plan/code review, loi/rui ro, test va verification.
- Acceptance criteria: Co vi du loi/rui ro va cach phat hien/sua; mo ta review/verification; khong secret.
- Dependency: EF-040.
- Automated tests: Markdown/link validation neu co.
- Manual acceptance check: Review note voi qua trinh thuc te.
- Deliverable/evidence: Versioned AI development note.
- Trang thai: `TODO`

### EF-042 - Final regression va release

- Muc tieu: Chot deployed, verified, portfolio-ready release.
- Pham vi: Full regression, docs consistency, release/tag, CV-ready description.
- Acceptance criteria: Lint/typecheck/build/unit/integration/E2E pass; production smoke pass; docs links pass; release/tag tao; co mo ta CV; khong secrets.
- Dependency: EF-034, EF-038, EF-039, EF-040, EF-041.
- Automated tests: Full regression va release validation.
- Manual acceptance check: Review deployed project, README, screenshots va tag.
- Deliverable/evidence: Final CI report, release/tag, portfolio checklist va CV text.
- Trang thai: `TODO`

## Thu tu trien khai theo dependency

1. Foundation: EF-001 -> EF-002 -> EF-003/EF-006 -> EF-004/EF-005/EF-007 -> EF-008 -> EF-009/EF-010 -> EF-011.
2. Early CI: EF-012 sau EF-011.
3. Database/seed: EF-013 -> EF-014 -> EF-015.
4. Authentication E2E: EF-016 -> EF-017 -> EF-018.
5. Employee draft E2E: EF-019 -> EF-020.
6. Submit/approval: EF-021 -> EF-022 -> EF-023/EF-024.
7. Reopen/audit: EF-024 -> EF-025 -> EF-026; EF-027 policy sau snapshot flow.
8. General list/filter/pagination/dashboard: EF-028 -> EF-029 -> EF-030.
9. Frontend hardening/accessibility: EF-031 -> EF-032.
10. Playwright: EF-033.
11. Full CI: EF-034.
12. Production migration va deployment: EF-035 -> EF-036 -> EF-037 -> EF-038 -> EF-039.
13. Portfolio completion/release: EF-040 -> EF-041 -> EF-042.

## Consistency checklist

- General manager list dung `User.managerId`; pending queue/approve/reject/audit dung `Expense.assignedManagerId`.
- Detail cho Employee owner, current Manager hoac assigned Manager; detail khong cap approve/reject.
- M1 -> M2 khi pending: M1 queue/detail/audit/approve/reject; M2 general list/detail; M2 khong queue/approve/reject/audit; khong auto-transfer.
- Chuoi nghiep vu: EF-021 Submit -> EF-022 Pending queue -> EF-024 Reject -> EF-025 Reopen -> EF-026 Audit; EF-023 Approve nam sau queue va truoc audit.
- EF-012 la Early CI; EF-034 la Full CI; khong co test chua tao trong CI som.
- EF-014 chi migration development/test va convention; EF-036 moi la production migration gate.
- EF-027 khong tao user-management UI/API hay reassign endpoint.
- Cac task EF-019, EF-020, EF-021, EF-022, EF-023, EF-024, EF-025, EF-026, EF-027, EF-028, EF-029 va EF-030 co API + UI + test + manual check khi co UI; EF-031 chi hardening.
- Backlog ket thuc bang deployed, verified va portfolio-ready evidence.
