# ExpenseFlow Backlog

## Quy uoc

- Backlog chi phan ra cac yeu cau da co trong `requirements.md`, `architecture.md` va `api.md`.
- Trang thai mac dinh cua task la `TODO`.
- Mỗi task phai hoan thanh ca API, UI va test trong pham vi neu co.
- Playwright va CI day du chi duoc them sau khi cac flow chinh hoan thanh.

## Epic 1: Foundation va Workspace

### EF-001 - Workspace va runtime

- Muc tieu: Tao monorepo TypeScript voi runtime va package policy da chot.
- Acceptance criteria:
  - Workspace dung pnpm workspaces va khong dung Turborepo.
  - Co package `@expense-flow/web`, `@expense-flow/api`, `@expense-flow/shared`.
  - Node.js 24.x LTS va pnpm 10.x duoc ghi trong repository policy.
  - `.nvmrc` chua `24`.
  - Root engines gioi han Node `>=24 <25` va pnpm `>=10 <11`.
  - `packageManager` ghi exact pnpm version lay tu lenh thuc te khi khoi tao.
- Dependency: Khong co.
- Test can co: Kiem tra workspace resolution, package names va runtime/engine constraints.
- Trang thai: `TODO`

### EF-002 - Shared package foundation

- Muc tieu: Tao shared package TypeScript cho cac contract dung chung giua web va API.
- Acceptance criteria:
  - Shared package khong truy cap database.
  - Co contract cho role, expense status, expense category va API contract can thiet.
  - Web va API co the import shared package.
- Dependency: EF-001.
- Test can co: Typecheck shared package va sample unit test cho constants/schema.
- Trang thai: `TODO`

### EF-003 - Next.js frontend foundation

- Muc tieu: Tao frontend Next.js App Router chay duoc voi TypeScript va Tailwind CSS.
- Acceptance criteria:
  - Su dung Next.js App Router.
  - Tailwind CSS duoc cau hinh trong Foundation.
  - Co placeholder page chung minh application chay duoc.
  - Chua tao login form, expense form hoac business UI.
  - Cau truc co the mo rong cho `components`, `features`, `lib`, `providers` ma khong tao abstraction rong.
- Dependency: EF-001, EF-002.
- Test can co: Frontend placeholder render test.
- Trang thai: `TODO`

### EF-004 - Frontend form va server-state conventions

- Muc tieu: Dat convention cho form va server state ma khong trien khai business form.
- Acceptance criteria:
  - Cai React Hook Form, Zod va `@hookform/resolvers`.
  - Form sau nay su dung React Hook Form + Zod theo convention chung.
  - Cai TanStack Query.
  - Tao `QueryClient` va `QueryClientProvider` tai Next.js client boundary dung cach.
  - TanStack Query chi dung cho server state.
  - UI state don gian dung React local state khi can.
  - Khong them Redux, Zustand hoac Axios.
  - HTTP foundation uu tien native `fetch`.
- Dependency: EF-003.
- Test can co: Test provider/query client setup hoat dong.
- Trang thai: `TODO`

### EF-005 - Frontend test infrastructure

- Muc tieu: Cau hinh frontend testing va xac nhan test infrastructure hoat dong.
- Acceptance criteria:
  - Cau hinh Vitest, React Testing Library va jsdom.
  - Co mot frontend smoke test nho.
  - Test co the chay qua script cua package tuong ung.
- Dependency: EF-003.
- Test can co: Vitest + React Testing Library + jsdom smoke test pass.
- Trang thai: `TODO`

### EF-006 - Express application foundation

- Muc tieu: Tao Express 5 application theo ESM va tach khoi process startup.
- Acceptance criteria:
  - Express 5, TypeScript strict mode va ESM duoc cau hinh.
  - `app.ts` tao/configure Express app va khong goi `listen()`.
  - `server.ts` chiu trach nhiem start HTTP server.
  - JSON request parsing co body size limit hop ly.
  - Cau hinh Helmet, CORS theo environment/convention co the mo rong va `cookie-parser`.
  - Co the import Express app trong integration test ma khong bind port that.
- Dependency: EF-001, EF-002.
- Test can co: Test import app khong bind port va request parsing/middleware setup.
- Trang thai: `TODO`

### EF-007 - Backend configuration va logging

- Muc tieu: Dat nen tang environment configuration va structured logging an toan.
- Acceptance criteria:
  - Environment configuration duoc validate bang Zod.
  - Khong truy cap `process.env` rai rac trong code.
  - Structured logging dung `pino` va `pino-http`.
  - Khong log password, token, cookie hoac secret.
  - Chua tao authentication middleware, JWT, CSRF implementation, rate limiting hoac password hashing.
- Dependency: EF-006.
- Test can co: Test valid/invalid environment configuration va logging redaction convention.
- Trang thai: `TODO`

### EF-008 - Health endpoint va integration test

- Muc tieu: Cung cap health endpoint co ban va test duoc Express app khong can port that.
- Acceptance criteria:
  - Tao `GET /api/v1/health`.
  - Endpoint khong yeu cau authentication.
  - Endpoint khong phu thuoc database business schema.
  - Response HTTP `200` voi body `{ "status": "ok" }`.
  - Integration test dung Vitest + Supertest xac nhan status code va response body.
- Dependency: EF-006, EF-007.
- Test can co: Vitest + Supertest health integration test.
- Trang thai: `TODO`

### EF-009 - Docker Compose va environment hygiene

- Muc tieu: Chuan bi PostgreSQL local va bao ve secret/database artifacts khoi Git.
- Acceptance criteria:
  - Docker Compose khoi dong PostgreSQL.
  - Co development-safe `.env.example` voi cac bien can thiet.
  - `.gitignore` loai tru `.env`, `node_modules`, secret, token, password that, database data volume va build artifact khong can thiet.
  - Khong tao Prisma schema, migration hoac database business feature trong task nay.
- Dependency: EF-001.
- Test can co: Docker Compose startup check va Git hygiene check.
- Trang thai: `TODO`

### EF-010 - Foundation scripts va verification

- Muc tieu: Xac nhan toan bo project foundation chay duoc truoc khi bat dau epic tiep theo.
- Acceptance criteria:
  - Chi tao root script khi workspace/package tuong ung da ton tai.
  - `pnpm install` thanh cong.
  - `pnpm dev` chay duoc frontend va backend cung luc.
  - Frontend hien thi placeholder page.
  - `pnpm lint` pass.
  - `pnpm typecheck` pass.
  - `pnpm test` pass.
  - `pnpm build` pass.
  - `GET /api/v1/health` tra HTTP `200`.
  - Frontend test infrastructure va backend health integration test hoat dong.
  - `docker compose up` khoi dong PostgreSQL thanh cong.
  - `git status` khong cho thay `.env` hoac `node_modules` bi track.
  - Khong them feature cua cac epic sau.
- Dependency: EF-002 den EF-009.
- Test can co: Chay toan bo foundation verification tren Linux development environment.
- Trang thai: `TODO`

## Epic 2: Database, Prisma va Seed

### EF-011 - Prisma schema va database connection

- Muc tieu: Tao Prisma schema trong `apps/api/prisma` va ket noi PostgreSQL chi tu API.
- Acceptance criteria:
  - Co model User, Expense, RefreshSession va AuditEvent theo architecture.
  - Co enum role, status, category va event type can thiet.
  - `User.managerId` nullable; `Expense.assignedManagerId` nullable.
  - Frontend khong co database credential hoac database access.
  - Local tach database `expense_flow_dev` va `expense_flow_test`.
- Dependency: EF-001, EF-002, EF-010.
- Test can co: Prisma schema validation va API database connection integration test.
- Trang thai: `TODO`

### EF-012 - Migration workflow

- Muc tieu: Quan ly migration an toan cho development, test va production.
- Acceptance criteria:
  - Migration duoc tao/review trong development va file duoc commit.
  - Test va production dung `prisma migrate deploy`.
  - Production khong dung `prisma migrate dev`.
  - API startup khong tu chay migration.
  - Paid Render dung pre-deploy command da quy dinh.
  - Free deployment migration chay mot lan tu GitHub Actions truoc trigger Render deploy.
  - Migration failure dung deployment va khong trigger deploy.
  - Migration job co concurrency control.
- Dependency: EF-011.
- Test can co: Apply migration tren test database va kiem tra migration failure block flow.
- Trang thai: `TODO`

### EF-013 - Idempotent demo seed

- Muc tieu: Tao demo users bang seed explicit voi credentials tu environment variables.
- Acceptance criteria:
  - Seed idempotent va chi chay khi duoc goi ro rang.
  - Demo seed khong tu chay trong production va khong chay cung migration.
  - Credentials local, CI va production tach rieng.
  - Khong commit credential that.
  - Password hash dung Argon2id va chap nhan do dai 12-128 ky tu.
- Dependency: EF-011, EF-012.
- Test can co: Unit test seed mapping/password validation va integration test seed idempotency.
- Trang thai: `TODO`

## Epic 3: Authentication va Session Security

### EF-014 - Login va access token memory flow

- Muc tieu: Cho phep demo user dang nhap va nhan access token ngan han.
- Acceptance criteria:
  - Login chi dung user da seed; khong co public registration.
  - Login kiem tra Origin hop le va rate limit.
  - Access token co TTL 15 phut.
  - Frontend chi giu access token trong memory, khong dung localStorage.
  - Response thanh cong tra user, access token va CSRF token dau tien.
  - Refresh token duoc set trong HttpOnly cookie.
- Dependency: EF-013, EF-002.
- Test can co: Unit test password verification/rate-limit policy va integration test login success/failure/Origin.
- Trang thai: `TODO`

### EF-015 - RefreshSession va token rotation

- Muc tieu: Quan ly nhieu refresh session/device bang hash va rotation.
- Acceptance criteria:
  - Moi login tao mot RefreshSession.
  - Mot user co the co nhieu session.
  - Database chi luu hash refresh token.
  - Refresh thanh cong rotate refresh token va revoke/replace token material cu.
  - Session service co internal capability `revokeAllSessionsForUser`.
  - Logout MVP chi revoke session hien tai.
- Dependency: EF-011, EF-014.
- Test can co: Unit test hash/rotation/reuse policy va integration test nhieu session, revoke session va refresh failure.
- Trang thai: `TODO`

### EF-016 - CSRF, cookie va CORS security

- Muc tieu: Bao ve refresh/logout cookie flows trong mo hinh frontend va API khac origin.
- Acceptance criteria:
  - Co `GET /api/v1/auth/csrf` dung refresh cookie de tim session.
  - CSRF token random, hash luu trong RefreshSession, raw token tra JSON voi `Cache-Control: no-store`.
  - Frontend chi giu CSRF token trong memory.
  - Refresh/logout bat buoc refresh cookie, `X-CSRF-Token` va Origin hop le.
  - Production cookie Secure, HttpOnly, SameSite=Lax, host-only, Path `/api/v1/auth`.
  - CORS chi cho configured frontend origins, `credentials=true`, khong wildcard.
  - Production bat buoc HTTPS.
- Dependency: EF-015.
- Test can co: Integration test CSRF missing/invalid/valid, Origin allowlist, cookie attributes va refresh rotation ca hai token.
- Trang thai: `TODO`

### EF-017 - Logout va current user

- Muc tieu: Hoan thien session lifecycle co ban cho frontend.
- Acceptance criteria:
  - `POST /api/v1/auth/logout` revoke session hien tai khi credentials hop le.
  - `GET /api/v1/auth/me` tra user hien tai voi access token hop le.
  - Khong co API/UI password change, forgot/reset password hoac logout-all-devices trong MVP.
- Dependency: EF-015, EF-016.
- Test can co: Integration test logout revoke, me authentication va khong truy cap duoc API sau logout.
- Trang thai: `TODO`

## Epic 4: Employee Draft Lifecycle

### EF-018 - Tao expense draft

- Muc tieu: Employee tao expense hop le o trang thai `DRAFT`.
- Acceptance criteria:
  - Backend tu gan `ownerId` tu access token.
  - Status ban dau la `DRAFT`.
  - Validate title required/max 120, description max 1000, amountVnd integer duong, category enum va expenseDate date-only khong tuong lai.
  - System timestamps luu UTC.
  - Client khong tu chon owner, status hoac assignedManagerId.
- Dependency: EF-017, EF-011.
- Test can co: Unit validation tests va API integration tests cho create success/failure.
- Trang thai: `TODO`

### EF-019 - Sua va xoa expense draft

- Muc tieu: Employee quan ly draft cua chinh minh.
- Acceptance criteria:
  - Chi owner Employee duoc sua draft.
  - Chi expense `DRAFT` moi duoc sua/xoa.
  - Khong cho client sua owner, status, assignedManagerId, audit fields hoac system timestamps.
  - Employee khong truy cap duoc expense cua user khac.
- Dependency: EF-018.
- Test can co: Integration test ownership, state restriction, allowed fields va delete draft.
- Trang thai: `TODO`

### EF-020 - Employee expense detail

- Muc tieu: Hien thi detail expense dung authorization scope.
- Acceptance criteria:
  - Employee chi lay duoc expense do minh so huu.
  - Manager chi lay duoc expense trong scope manager da gan.
  - Response dung field va format da quy dinh.
- Dependency: EF-018, EF-017.
- Test can co: API integration test scope isolation va response contract.
- Trang thai: `TODO`

## Epic 5: Submit va Assignment Snapshot

### EF-021 - Submit expense

- Muc tieu: Employee submit draft de dua vao approval workflow.
- Acceptance criteria:
  - Chi owner Employee duoc submit `DRAFT`.
  - Employee co manager hien tai thi chuyen `DRAFT -> PENDING`.
  - `assignedManagerId` lay manager hien tai tai thoi diem submit.
  - `submittedAt` duoc cap nhat.
  - Transition va audit event ghi trong cung transaction.
  - Employee khong co manager nhan `409` voi code `EMPLOYEE_MANAGER_REQUIRED`.
- Dependency: EF-018, EF-015, EF-011.
- Test can co: Unit state/manager policy tests va integration test success, missing manager, ownership, invalid status va atomic audit.
- Trang thai: `TODO`

### EF-022 - Reopen rejected expense

- Muc tieu: Owner dua expense rejected tro lai draft de sua va submit lai.
- Acceptance criteria:
  - Chi owner Employee duoc reopen `REJECTED`.
  - Chuyen `REJECTED -> DRAFT`.
  - Xoa `assignedManagerId`.
  - Tao audit event trong cung transaction.
  - `APPROVED` khong the reopen.
- Dependency: EF-021, EF-025.
- Test can co: Unit transition tests va integration test owner/status restriction, snapshot removal va audit atomicity.
- Trang thai: `TODO`

## Epic 6: Manager Approval va Audit

### EF-023 - Manager pending queue

- Muc tieu: Manager xem expense pending cua direct reports duoc gan cho minh.
- Acceptance criteria:
  - Manager chi xem expense co `assignedManagerId` bang id cua minh.
  - Expense cua manager moi khong tu dong xuat hien neu dang gan manager cu.
  - Approval workflow MVP chi ap dung cho Employee expense.
- Dependency: EF-021, EF-017.
- Test can co: Integration test direct-report scope va manager snapshot behavior.
- Trang thai: `TODO`

### EF-024 - Approve expense

- Muc tieu: Manager phu trach approve expense pending.
- Acceptance criteria:
  - Chi assigned manager duoc approve `PENDING` expense cua direct report.
  - Manager khong duoc tu approve expense cua minh.
  - Chuyen `PENDING -> APPROVED`.
  - Khong cho thay doi metadata trong approve.
  - Transition va audit event ghi trong cung transaction.
  - Status mismatch/concurrent transition tra `409`.
- Dependency: EF-023, EF-021.
- Test can co: Unit authorization/state tests va integration test success, self-approval, wrong manager, metadata immutability va conflict.
- Trang thai: `TODO`

### EF-025 - Reject expense

- Muc tieu: Manager reject expense pending voi ly do bat buoc.
- Acceptance criteria:
  - Chi assigned manager duoc reject `PENDING` expense.
  - Reason khong rong la bat buoc.
  - Chuyen `PENDING -> REJECTED`.
  - Manager khong sua metadata expense.
  - Reason nam trong audit event.
  - Status mismatch/concurrent transition tra `409`.
- Dependency: EF-023, EF-021.
- Test can co: Unit validation/state tests va integration test mandatory reason, authorization, immutable metadata va conflict.
- Trang thai: `TODO`

### EF-026 - Append-only audit history API

- Muc tieu: Luu va hien thi lich su state transition an toan.
- Acceptance criteria:
  - Audit gom submit, approve, reject va reopen.
  - Audit append-only, khong co API sua/xoa.
  - Employee chi xem history expense minh so huu.
  - Manager chi xem history khi assignedManagerId la id cua ho.
  - Response allowlist chi gom id, eventType, actor id/name, fromStatus, toStatus, reason, createdAt.
  - Khong tra token, token hash, password, secret hoac metadata noi bo.
  - Audit giu vo thoi han trong MVP.
- Dependency: EF-021, EF-022, EF-024, EF-025.
- Test can co: Integration test visibility, allowlist, append-only behavior, manager reassignment visibility va transaction consistency.
- Trang thai: `TODO`

### EF-027 - Operational manager assignment rule

- Muc tieu: Bao ve expense pending khi quan he manager thay doi.
- Acceptance criteria:
  - Thay doi `User.managerId` khong thay doi `assignedManagerId` cua expense `PENDING`.
  - Manager khong bi vo hieu hoa khi con pending expense gan cho ho.
  - Phai reassign hoac xu ly pending expense truoc khi vo hieu hoa manager.
  - Khong tao user-management UI/API trong MVP.
- Dependency: EF-011, EF-021.
- Test can co: Unit/business rule tests va integration test pending snapshot/inactivation guard.
- Trang thai: `TODO`

## Epic 7: List, Filter va Pagination

### EF-028 - Expense list authorization

- Muc tieu: Cung cap danh sach expense theo role va scope.
- Acceptance criteria:
  - Employee chi xem expense cua minh.
  - Manager chi xem expense cua direct reports theo scope da chot.
  - Query khong lam lo resource ngoai scope.
- Dependency: EF-020, EF-023.
- Test can co: Integration test role isolation va empty/out-of-scope results.
- Trang thai: `TODO`

### EF-029 - Expense filters va pagination

- Muc tieu: Ho tro loc va phan trang cho danh sach expense.
- Acceptance criteria:
  - Ho tro filter status, category, fromDate va toDate.
  - `page` bat dau tu 1, mac dinh 1.
  - `limit` mac dinh 20, toi da 100.
  - Response co page, limit, total va totalPages.
  - Date filter dung expenseDate date-only.
- Dependency: EF-028.
- Test can co: Integration tests filter combinations, invalid page/limit, boundaries 1/20/100 va pagination totals.
- Trang thai: `TODO`

## Epic 8: Dashboard MVP

### EF-030 - Current-month dashboard

- Muc tieu: Cung cap dashboard co ban theo thang hien tai va authorization scope.
- Acceptance criteria:
  - Khong nhan custom time range.
  - Tra so luong va tong tien theo status.
  - Tra tong tien theo category.
  - Tra so expense `PENDING` manager dang cho xu ly.
  - Tong tien la integer VND.
  - Backend tinh theo scope cua employee/manager.
- Dependency: EF-028, EF-029, EF-024, EF-025.
- Test can co: Unit aggregation tests va integration tests current-month boundary, money totals, role scope va pending count.
- Trang thai: `TODO`

## Epic 9: Frontend Quality va E2E

### EF-031 - Frontend validation va error states

- Muc tieu: Hoan thien UX cho cac flow MVP da co.
- Acceptance criteria:
  - Form phan anh validation title, description, amount, category va expenseDate.
  - UI phan biet loi validation, authentication, authorization va conflict.
  - Access/CSRF token chi nam trong memory.
  - UI khong hien control trai voi role/state, nhung backend van la authority.
  - Co trang thai loading, empty va error cho list/dashboard.
- Dependency: EF-018, EF-021, EF-024, EF-025, EF-029, EF-030.
- Test can co: Frontend unit/component tests cho form, role visibility, error/loading/empty states va memory-only token behavior.
- Trang thai: `TODO`

### EF-032 - Accessibility hardening

- Muc tieu: Dam bao cac flow MVP co the su dung duoc voi giao dien accessible co ban.
- Acceptance criteria:
  - Cac form, action va loi validation co label/relationship ro rang.
  - Keyboard flow va focus behavior phu hop voi cac man hinh MVP.
  - Khong thay doi business rules hoac API contract.
- Dependency: EF-031.
- Test can co: Frontend accessibility/component checks va manual keyboard verification.
- Trang thai: `TODO`

### EF-033 - Playwright E2E

- Muc tieu: Kiem tra end-to-end cac flow chinh sau khi implementation hoan thanh.
- Acceptance criteria:
  - Playwright chi duoc them sau cac flow chinh.
  - Bao phu login, tao/sua/xoa draft, submit, approve, reject voi reason, reopen, history, filters va dashboard.
  - Test khong dung credential that trong repository.
- Dependency: EF-030, EF-031, EF-032.
- Test can co: Playwright E2E voi environment credentials rieng va test data kiem soat.
- Trang thai: `TODO`

## Epic 10: CI/CD

### EF-034 - GitHub Actions foundation va full checks

- Muc tieu: Tu dong hoa validation va deployment prerequisites theo thu tu da chot.
- Acceptance criteria:
  - Foundation chay typecheck, lint, sample unit test va health integration test.
  - GitHub Actions dung PostgreSQL service container tren Linux runner.
  - Full CI chay sau khi flow chinh hoan thanh, bao gom Vitest, integration va Playwright theo setup da co.
  - `PRODUCTION_DATABASE_URL` dung GitHub environment secret.
  - Khong commit credentials.
- Dependency: EF-003, EF-005, EF-006, EF-033.
- Test can co: Workflow validation va CI run tren Linux runner.
- Trang thai: `TODO`

### EF-035 - Production migration gate

- Muc tieu: Chay production migration mot lan va chan deploy khi migration that bai.
- Acceptance criteria:
  - Paid Render dung `pnpm --filter @expense-flow/api db:migrate:deploy` trong pre-deploy command.
  - Free portfolio deployment chay migration trong GitHub Actions sau test/build va truoc trigger Render deploy.
  - Migration job co concurrency control.
  - Migration that bai thi khong trigger Render deploy.
  - Khong migration trong API startup.
  - Demo seed khong tu dong chay cung migration.
- Dependency: EF-012, EF-034.
- Test can co: CI integration test migration success/failure, concurrency behavior va deploy gate.
- Trang thai: `TODO`

## Thu tu uu tien tong quat

1. EF-001 den EF-010: Foundation.
2. EF-011 den EF-013: Database, migration va seed.
3. EF-014 den EF-017: Authentication, sessions, CSRF va logout.
4. EF-018 den EF-022: Employee draft, submit va reopen.
5. EF-023 den EF-027: Manager approval, reject va audit.
6. EF-028 den EF-030: List, filters, pagination va dashboard.
7. EF-031 den EF-032: Frontend quality.
8. EF-033 den EF-035: Playwright, CI va production migration gate.
