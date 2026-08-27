# ExpenseFlow API

## 1. Conventions

- Base prefix: `/api/v1`.
- JSON request/response.
- System timestamps dung UTC va ISO 8601.
- `expenseDate` la date-only theo dang `YYYY-MM-DD`.
- `amountVnd` la so nguyen duong theo don vi dong.
- Access token gui qua `Authorization: Bearer <access-token>` cho business API.
- Refresh token khong gui trong JSON; server doc tu HttpOnly cookie.
- Khong luu access token hoac CSRF token trong localStorage.

## 2. Authentication endpoints

### POST `/api/v1/auth/login`

Login bang demo account da seed. Request phai co Origin hop le va bi ap dung rate limit.

Response thanh cong tra access token 15 phut, thong tin user can thiet va CSRF token dau tien; server set refresh-token HttpOnly cookie.

```json
{
  "data": {
    "accessToken": "<access-token>",
    "expiresInSeconds": 900,
    "csrfToken": "<csrf-token>",
    "user": {
      "id": "user-id",
      "role": "EMPLOYEE",
      "name": "Demo Employee"
    }
  }
}
```

### GET `/api/v1/auth/csrf`

Endpoint dung refresh-token cookie de xac dinh RefreshSession. Backend tao CSRF token ngau nhien, luu hash vao session va tra raw token. Response phai co `Cache-Control: no-store`.

```json
{
  "data": {
    "csrfToken": "<csrf-token>"
  }
}
```

Raw token chi duoc giu trong frontend memory.

### POST `/api/v1/auth/refresh`

Bat buoc co refresh-token cookie, `Origin` hop le va `X-CSRF-Token`. Neu thanh cong, rotate refresh token va CSRF token, revoke/replace session token material va tra access token moi cung CSRF token moi.

### POST `/api/v1/auth/logout`

Bat buoc co refresh-token cookie, `Origin` hop le va `X-CSRF-Token`. Revoke refresh session hien tai. Khong co logout-all-devices API trong MVP.

### GET `/api/v1/auth/me`

Bat buoc access token. Tra user hien tai va role/manager information can cho frontend.

Khong co public registration, password change, forgot password hoac reset password endpoint trong MVP.

## 3. Expense endpoints

### GET `/api/v1/expenses`

Tra danh sach theo authorization scope:

- Employee: expense co `ownerId` la user hien tai.
- Manager: expense cua direct reports va theo scope xu ly cua manager.

Query params MVP:

- `page`: bat dau tu 1, mac dinh 1.
- `limit`: mac dinh 20, toi da 100.
- `status`: filter theo status.
- `category`: filter theo category.
- `fromDate`, `toDate`: filter theo `expenseDate`.
- Sort chi dung cac field duoc backend cho phep.

Response:

```json
{
  "data": [
    {
      "id": "expense-id",
      "ownerId": "employee-id",
      "assignedManagerId": "manager-id",
      "title": "Taxi to client",
      "description": null,
      "amountVnd": 120000,
      "category": "TRAVEL",
      "expenseDate": "2026-08-20",
      "status": "PENDING",
      "submittedAt": "2026-08-20T08:00:00Z",
      "createdAt": "2026-08-20T07:00:00Z",
      "updatedAt": "2026-08-20T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST `/api/v1/expenses`

Employee tao expense `DRAFT`. Backend gan owner tu access token; client khong tu chon owner/status/assigned manager.

### GET `/api/v1/expenses/:expenseId`

Tra detail neu user co scope:

- Employee la owner.
- Manager la assigned manager phu hop voi operation/scope MVP.

### PATCH `/api/v1/expenses/:expenseId`

Chi owner Employee duoc sua expense `DRAFT`. Khong cho sua status, owner, assigned manager, audit fields hoac system timestamps. Validate title, description, amount, category va expenseDate.

### DELETE `/api/v1/expenses/:expenseId`

Chi owner Employee duoc xoa expense `DRAFT`. Xoa expense khong tao state-transition audit event trong MVP; policy nay khong mo rong audit history thanh delete log.

### POST `/api/v1/expenses/:expenseId/submit`

Chi owner Employee submit `DRAFT`. Neu employee khong co manager hien tai:

```json
{
  "error": {
    "code": "EMPLOYEE_MANAGER_REQUIRED",
    "message": "Employee must have a manager before submitting an expense",
    "requestId": "request-id"
  }
}
```

Thanh cong chuyen `DRAFT -> PENDING`, snapshot manager hien tai vao `assignedManagerId`, cap nhat `submittedAt` va tao audit trong cung transaction.

### POST `/api/v1/expenses/:expenseId/approve`

Chi assigned manager duoc approve `PENDING` expense cua direct report. Manager khong duoc approve expense cua chinh minh. Request khong cho sua metadata. Chuyen `PENDING -> APPROVED`.

### POST `/api/v1/expenses/:expenseId/reject`

Chi assigned manager duoc reject `PENDING` expense. Request bat buoc reason khong rong. Chuyen `PENDING -> REJECTED`; reason duoc luu trong audit event.

```json
{
  "reason": "Missing business context"
}
```

### POST `/api/v1/expenses/:expenseId/reopen`

Chi owner Employee reopen `REJECTED`. Chuyen `REJECTED -> DRAFT` va xoa `assignedManagerId`. Submit lai lay manager hien tai tai thoi diem submit. `APPROVED` khong the reopen.

### GET `/api/v1/expenses/:expenseId/history`

Audit visibility:

- Employee chi xem history expense do minh so huu.
- Manager chi xem history neu `expense.assignedManagerId` bang id cua manager.
- Manager moi khong tu dong xem history cua expense dang gan manager cu.

Response allowlist:

```json
{
  "data": [
    {
      "id": "audit-id",
      "eventType": "REJECTED",
      "actor": {
        "id": "manager-id",
        "name": "Demo Manager"
      },
      "fromStatus": "PENDING",
      "toStatus": "REJECTED",
      "reason": "Missing business context",
      "createdAt": "2026-08-20T09:00:00Z"
    }
  ]
}
```

Khong tra token, token hash, password, secret hoac metadata noi bo. Khong co endpoint sua/xoa audit.

## 4. Dashboard

### GET `/api/v1/dashboard`

Dung du lieu thang hien tai, khong nhan custom time range. Backend tinh theo authorization scope.

Response gom:

- So luong va tong tien theo status.
- Tong tien theo category.
- So expense `PENDING` manager dang cho xu ly.

Tat ca tong tien la integer VND.

## 5. Health

### GET `/api/v1/health`

Health integration check co the dung de xac nhan API dang chay. Response khong tra secret hoac thong tin database nhay cam.

## 6. Error response

Format chuan:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "title": ["Required"]
      }
    },
    "requestId": "request-id"
  }
}
```

`details` la optional. Error response khong duoc chua stack trace, secret, password, token hoac token hash.

Status mapping du kien:

| HTTP  | Truong hop                                                                                    |
| ----- | --------------------------------------------------------------------------------------------- |
| `400` | Malformed request hoac invalid syntax.                                                        |
| `401` | Thieu/khong hop le access token, refresh cookie hoac CSRF credential.                         |
| `403` | Origin/role/scope khong duoc phep.                                                            |
| `404` | Resource khong ton tai trong scope user.                                                      |
| `409` | Status mismatch, concurrent transition, employee thieu manager (`EMPLOYEE_MANAGER_REQUIRED`). |
| `422` | Field validation: title/description/amount/category/date/reason.                              |
| `429` | Rate limit, dac biet login.                                                                   |
| `500` | Loi server khong mong doi.                                                                    |

Reject thieu reason va expenseDate nam trong tuong lai la validation error. Transition canh tranh hoac status khong con phu hop la `409`.

## 7. Auth security contract

- Login kiem tra Origin hop le va rate limit.
- Refresh/logout bat buoc refresh-token cookie, `X-CSRF-Token` va Origin hop le.
- CORS chi cho phep configured frontend origins, `credentials=true`, khong wildcard.
- Production cookie: Secure, HttpOnly, SameSite=Lax, host-only, Path `/api/v1/auth`.
- Production bat buoc HTTPS.
- Access token chi trong frontend memory, TTL 15 phut.
- CSRF token chi trong frontend memory; csrf endpoint tra `Cache-Control: no-store`.
- Refresh rotate ca refresh token va CSRF token.
- Logout revoke session hien tai.
- Backend chi luu hash refresh/CSRF token.
- Khong co API password change, forgot/reset password, logout-all-devices hoac user management trong MVP.
