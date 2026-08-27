# ExpenseFlow Architecture

## 1. Overview

ExpenseFlow la monorepo TypeScript dung pnpm workspaces. He thong gom Next.js frontend, Express API chay rieng va PostgreSQL. Prisma chi nam trong backend; chi backend duoc ket noi PostgreSQL. Frontend khong truy cap database truc tiep.

MVP khong dung Turborepo.

## 2. Runtime va repository

- Node.js `24.x LTS`.
- pnpm `11.x`.
- `.nvmrc` chua `24`.
- Root `package.json` phai dung `packageManager: "pnpm@11.20.0"`.
- Root `package.json` engines: Node `>=24 <25`, pnpm `>=11 <12`.
- Package names:
  - `@expense-flow/web`
  - `@expense-flow/api`
  - `@expense-flow/shared`

Layout du kien:

```text
expense-flow/
  apps/
    web/
      app/
      package.json
    api/
      src/
      prisma/
      package.json
  packages/
    shared/
      src/
      package.json
  package.json
  pnpm-workspace.yaml
  .nvmrc
```

Root scripts du kien: `dev`, `dev:web`, `dev:api`, `build`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `db:generate`, `db:migrate:dev`, `db:migrate:deploy`, `db:seed`. Chi tao script khi workspace/package tuong ung da ton tai.

`@expense-flow/shared` chua type/schema contract dung chung, khong chua database access. API la boundary duy nhat cho authentication, authorization, business rules, state transition va database.

## 3. Deployment topology

- Primary Production Topology:
  - Frontend: `https://<project>.vercel.app` (Vercel default deployment domain)
  - API: `https://<service>.onrender.com` (Render Web Service default deployment domain)
  - Database: Render PostgreSQL (private database, không public)
  - Frontend Vercel và API Render sử dụng default deployment domains tạo thành cross-site topology.
- Optional/future custom-domain topology:
  - `https://expenseflow.example.com`
  - `https://api.expenseflow.example.com`
  - Được ghi nhận dưới dạng tùy chọn mở rộng tương lai, không phải Primary Execution Track hiện tại.
- Frontend, API và database là các component riêng.
- Database không public và chỉ cho API truy cập.
- Production bắt buộc HTTPS.

## 4. Backend layers

1. HTTP/router: parse request, request id, cookie/CORS/Origin checks va map response.
2. Authentication middleware: validate access token hoac refresh session.
3. Authorization policy: kiem tra role va policy cua tung operation; khong dung mot dieu kien Manager scope chung.
4. Application service: validate use case va goi state transition.
5. State transition service: update theo status hien tai, tao audit trong transaction.
6. Prisma data layer: truy cap PostgreSQL va enforce query scope.

Frontend chi hien thi control dua tren session state de co UX tot; backend van bat buoc enforce moi quyen va transition.

### Authorization policy theo operation

| Operation                    | Policy                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| General manager expense list | Manager chi xem expense cua Employee co `User.managerId` bang id cua minh hien tai.                                                                                                              |
| Expense detail               | Employee owner duoc xem; Manager duoc xem neu la current manager cua Employee owner hoac `Expense.assignedManagerId` bang id cua minh. Quyen xem detail khong cap quyen approve/reject.          |
| Pending approval queue       | Chi expense co status `PENDING` va `Expense.assignedManagerId` bang id Manager hien tai.                                                                                                         |
| Approve/reject               | Chi actor role Manager co id bang `Expense.assignedManagerId`, expense `PENDING` va owner role Employee; khong kiem tra `User.managerId`; Manager khong duoc tu approve/reject expense cua minh. |
| Audit history                | Employee owner hoac Manager co id bang `Expense.assignedManagerId`. Current manager khong tu dong xem audit cua workflow cu.                                                                     |
| Current-month dashboard      | General aggregates dung owner/current `User.managerId`; `pendingApprovalCount` chi dung `PENDING` + `assignedManagerId` cua Manager hien tai.                                                    |

`User.managerId` la quan he quan ly hien tai. `Expense.assignedManagerId` la approval assignment snapshot tai thoi diem submit. Khi `User.managerId` thay doi, pending expense cu giu nguyen `assignedManagerId` va tiep tuc do Manager cu xu ly. Khong co reassign workflow hoac user-management UI/API trong MVP.

Vi du E submit X cho M1, sau do E doi sang M2: M1 van co queue/detail/audit/approve/reject access; M2 co X trong general list va detail access nhung khong co queue/approve/reject/audit access. X khong tu dong chuyen assignment.

## 5. Data model de xuat

### User

- `id`
- `role`: `EMPLOYEE` hoac `MANAGER`
- `managerId`: nullable foreign key toi User
- identity fields can thiet cho login/display
- system timestamps UTC

Business rules:

- `managerId` nullable; Employee co the tam thoi khong co Manager.
- Employee khong co Manager van dang nhap, tao/xem/sua/xoa DRAFT; submit/resubmit bi chan voi `409 EMPLOYEE_MANAGER_REQUIRED`.
- Manager co the co `managerId` null.
- MVP khong hard-delete User.
- Khong vo hieu hoa Manager khi con `PENDING` expense gan cho manager do. Trong MVP khong co reassign pending expense; cac expense do phai duoc assigned Manager hien tai xu ly truoc khi Manager co the bi vo hieu hoa.

### Expense

- `id`
- `ownerId`
- `assignedManagerId`: nullable snapshot manager tai submit
- `title`: required, max 120
- `description`: optional, max 1000
- `amountVnd`: positive integer
- `category`: `TRAVEL`, `MEAL`, `OFFICE`, `TRAINING`, `OTHER`
- `expenseDate`: date-only, khong tuong lai
- `status`: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`
- `submittedAt`: nullable
- `createdAt`, `updatedAt`: UTC

Khi submit, `assignedManagerId` lay manager hien tai cua employee. Thay doi `User.managerId` khong lam thay doi expense `PENDING` hoac quyen xu ly cua assigned manager cu. Reopen tu `REJECTED` xoa assigned manager; submit lai tao snapshot moi.

### RefreshSession

- `id`
- `userId`
- refresh-token hash
- CSRF-token hash hien tai
- expiry, created timestamp, last-used timestamp
- revoked timestamp/reason
- optional device/session metadata khong nhay cam

Moi login tao mot session. Mot user co the co nhieu session/device. Rotation thay hash cu bang hash moi. Logout revoke session hien tai. Session service co internal capability `revokeAllSessionsForUser`; password change, forgot/reset va logout-all khong co API/UI trong MVP.

### AuditEvent

- `id`
- `expenseId`
- `eventType`
- `actorId`
- `fromStatus`, `toStatus`
- `reason` nullable
- `createdAt` UTC

Audit append-only, khong co API update/delete va luu vo thoi han trong MVP. Metadata noi bo khong duoc tra qua audit API va khong duoc chua password, token, token hash hoac secret.

Audit visibility cua Manager chi danh gia theo `Expense.assignedManagerId` hien tai, khong theo Manager cua tung AuditEvent. Khi reopen xoa assignment, khong Manager nao xem history; khi resubmit gan Manager moi, Manager moi xem toan bo history cu. Khong them workflow-cycle model hoac assigned manager vao AuditEvent.

Indexes can thiet cho owner/status/date, assigned manager/status/date, session user/revocation/expiry va audit expense/time.

## 6. State machine va transaction

| Transition            | Authorization                                                           | Transaction effect                                                             |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `DRAFT -> PENDING`    | Owner Employee co manager hien tai                                      | Gan assigned manager snapshot, set submittedAt, tao audit.                     |
| `PENDING -> APPROVED` | Manager co id bang `assignedManagerId`, owner Employee                  | Update status, tao audit; khong can current direct-report relation.            |
| `PENDING -> REJECTED` | Manager co id bang `assignedManagerId`, owner Employee, reason bat buoc | Update status, tao audit voi reason; khong can current direct-report relation. |
| `REJECTED -> DRAFT`   | Owner Employee                                                          | Xoa assigned manager, tao audit.                                               |

`APPROVED` terminal. Update phai co dieu kien status hien tai trong transaction; neu khong con match hoac co concurrent transition thi tra `409`. Khong dung general idempotency key trong MVP.

## 7. Authentication, cookie, CORS va CSRF

### Token

- Access token TTL 15 phut, chi giu trong frontend memory.
- Khong luu access token trong localStorage.
- Refresh token chi o HttpOnly cookie.
- Database chi luu hash refresh token.
- Login tao RefreshSession va tra access token cung CSRF token dau tien.
- Refresh rotation ca refresh token va CSRF token.
- Logout revoke session hien tai.

### Cookie va origin

Local Development refresh cookie (`http://localhost:3000` <-> `http://localhost:4000`):

- `HttpOnly=true`
- `Secure=false`
- `SameSite=Lax`
- host-only, khong set Domain
- `Path=/api/v1/auth`

Production refresh cookie (cross-site Vercel `*.vercel.app` frontend <-> Render `*.onrender.com` API):

- `HttpOnly=true`
- `Secure=true`
- `SameSite=None`
- host-only, khong set Domain
- `Path=/api/v1/auth`
- expiry phu hop voi refresh session

CORS chi cho configured frontend origins (danh sach nghem ngat, khong dung wildcard origin), `credentials=true`. Refresh/logout phai kiem tra `Origin` hop le va header `X-CSRF-Token`. Production bat buoc HTTPS.

### CSRF flow

1. `GET /api/v1/auth/csrf` doc refresh-token cookie de tim RefreshSession.
2. Backend tao raw CSRF token ngau nhien, luu hash vao session va tra raw token trong JSON.
3. Response co `Cache-Control: no-store`.
4. Frontend giu CSRF token trong memory.
5. Refresh/logout gui refresh cookie, `Origin` hop le va `X-CSRF-Token`.
6. Refresh thanh cong rotate ca refresh token va CSRF token.
7. Access-token business APIs dung `Authorization: Bearer`.

Full reload lam mat access/CSRF token memory; frontend khoi tao lai bang cookie-based auth flow, khong hydrate tu storage. Khong tra token/hash/secret trong response khong can thiet.

Login kiem tra Origin va rate limit. Secret va credentials chi nam trong environment/configured secret store.

## 8. Seed va password

- Password policy: 12-128 ky tu.
- Hash Argon2id.
- Khong bat buoc chu hoa, so hoac ky tu dac biet.
- Demo credentials lay tu environment variables.
- Khong commit credential that.
- Seed idempotent, chi chay khi duoc goi ro rang.
- Demo seed khong tu chay trong production.
- Local, CI va production dung credentials rieng.

## 9. Migration va database environments

Local co hai database:

- `expense_flow_dev`
- `expense_flow_test`

Integration test chi dung `TEST_DATABASE_URL`, apply migrations va reset test data co kiem soat. Migration tao/review trong development va commit vao repository. Test va production dung `prisma migrate deploy`; production khong dung `prisma migrate dev`. API startup khong chay migration.

### Primary Execution Track (Free/Low-cost Portfolio)

Production deployment tu dong chay qua GitHub Actions theo chuoi tuan tu nghem ngat:

1. `Full CI` (`EF-034`): Lint, typecheck, unit/integration test pass.
2. `Production Migration Gate` (`EF-036`): GitHub Actions thuc thi `pnpm --filter @expense-flow/api db:migrate:deploy` vao `PRODUCTION_DATABASE_URL` (duoc bao mat trong GitHub Environment secrets).
3. `Production Deployment` (`EF-037`): Chi khi migration gate thanh cong, GitHub Actions moi kich hoat deploy Render (API Web Service) va Vercel (Frontend Web App) qua API/Webhook trigger.
4. Auto-deploy tren Git push o Render va Vercel phai duoc tat (chuyen sang manual/API trigger) de dam bao deployment khong chay song song hoac truoc khi migration gate pass.
5. Neu Full CI hoac migration gate thất bại, quy trình STOP ngay va khong trigger deployment.

### Alternative Track Note (Paid Render Service)

Doi voi moi truong Render paid service, co the dung pre-deploy command noi bo cua Render:

```text
pnpm --filter @expense-flow/api db:migrate:deploy
```

Đây chỉ là phương án dự phòng/ghi chú tham khảo, không phải primary execution path của dự án.

## 10. Testing strategy

- Foundation: typecheck, lint, sample unit test va health integration test.
- Unit tests dung Vitest, khong can database: policy, validation, money/date rules, state machine va token/session helpers.
- Integration tests dung Vitest voi Express/Prisma va `TEST_DATABASE_URL`.
- Moi vertical feature them unit/integration test tuong ung.
- Playwright chi them sau khi flow chinh hoan thanh; bao phu login, draft lifecycle, submit, approve/reject, mandatory reason, reopen, audit, filters va dashboard.
- CI day du chay sau flow chinh; GitHub Actions dung PostgreSQL service container tren Linux runner.

## 11. Vertical delivery order

1. pnpm workspace, runtime constraints, shared contracts, typecheck/lint/sample tests.
2. Prisma schema, migration, seed explicit va health integration test.
3. Authentication, RefreshSession, CSRF va logout session hien tai.
4. Employee draft lifecycle.
5. Submit, employee-without-manager rules va assigned manager snapshot.
6. Manager approve/reject, conflict handling va audit visibility.
7. List/filter/pagination.
8. Current-month dashboard.
9. Frontend validation, error states va accessibility hardening.
10. Playwright E2E va CI day du.

Chi tiet implementation khong anh huong contract duoc chot trong vertical tuong ung.

## 12. Architecture status

Plan da duoc chot va san sang cho documentation/implementation. Khong co API password change, forgot/reset password, logout-all UI/API hoac user-management UI/API trong MVP.
