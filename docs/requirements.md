# ExpenseFlow Requirements

## 1. Muc tieu

ExpenseFlow la he thong noi bo de nhan vien tao va theo doi chi phi, dong thoi ho tro quan ly truc tiep xem xet va phe duyet chi phi. MVP tap trung vao luong expense cua `EMPLOYEE` va `MANAGER`; backend la nguon quyet dinh authorization va state transition.

## 2. Pham vi MVP

- Hai role: `EMPLOYEE` va `MANAGER`.
- Employee tao, sua va xoa expense o trang thai `DRAFT`.
- Employee submit expense de phe duyet.
- Manager xem danh sach tong quat expense cua cac Employee hien dang la direct reports cua minh.
- Manager chi approve hoac reject expense duoc gan cho minh trong approval snapshot.
- Reject bat buoc co ly do.
- Owner reopen expense bi reject.
- Luu lich su submit, approve, reject va reopen theo audit event append-only.
- Danh sach, loc, phan trang va dashboard co ban.
- Tien luu duoi dang so nguyen theo don vi dong Viet Nam.
- User duoc tao bang database seed; khong co public registration.
- Local PostgreSQL chay bang Docker Compose.
- Unit va integration test dung Vitest. Playwright them sau khi cac flow chinh hoan thanh.

## 3. Ngoai pham vi MVP

- Chuyen tien that, payment hoac payout.
- Upload va luu receipt.
- Public registration.
- SSO, 2FA va password change/forgot/reset.
- Notification.
- Approval chain nhieu cap.
- Multi-currency.
- Export/report nang cao.
- Dashboard custom time range.
- Reopen expense `APPROVED`.
- UI/API logout all devices.
- User-management UI/API.
- Hard-delete User.
- General idempotency key.

## 4. Vai tro va pham vi du lieu

### EMPLOYEE

- Chi xem expense do minh so huu.
- Tao, sua va xoa expense cua minh khi o `DRAFT`.
- Submit va resubmit khi co manager hien tai.
- Reopen expense cua minh khi o `REJECTED`.
- Employee khong co manager van xem va sua `DRAFT`, nhung khong duoc submit/resubmit.

### MANAGER

- General expense list chi gom expense cua Employee co `User.managerId` bang id cua Manager dang dang nhap.
- Pending approval queue chi gom expense co status `PENDING` va `Expense.assignedManagerId` bang id cua Manager dang dang nhap.
- Expense detail duoc xem neu Manager la current manager cua Employee owner, hoac Manager la `assignedManagerId` cua expense.
- Approve/reject chi duoc thuc hien khi `Expense.assignedManagerId` bang id cua Manager dang dang nhap va expense o `PENDING`.
- Khong duoc tu approve expense cua chinh minh.
- Khong duoc approve/reject expense khong phai employee expense trong MVP.
- Khi Employee doi Manager, Manager moi chi xem expense trong general list neu Employee la direct report hien tai va chi xem detail theo detail policy; Manager moi khong co pending queue, approve/reject hoac audit access neu khong phai `assignedManagerId`.

## 5. Expense fields va validation

| Field               | Quy tac                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `id`                | Dinh danh duy nhat.                                                  |
| `ownerId`           | User so huu expense. MVP approval chi ap dung cho owner la Employee. |
| `title`             | Bat buoc, toi da 120 ky tu.                                          |
| `description`       | Tuy chon, toi da 1000 ky tu.                                         |
| `amountVnd`         | So nguyen duong, don vi dong. Khong dung floating point.             |
| `category`          | Mot trong `TRAVEL`, `MEAL`, `OFFICE`, `TRAINING`, `OTHER`.           |
| `expenseDate`       | Date-only, khong nam trong tuong lai.                                |
| `status`            | Mot trong `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`.                |
| `submittedAt`       | Nullable truoc submit; cap nhat khi submit/resubmit.                 |
| `createdAt`         | System timestamp UTC.                                                |
| `updatedAt`         | System timestamp UTC.                                                |
| `assignedManagerId` | Nullable snapshot manager tai thoi diem submit.                      |

Tat ca system timestamp luu UTC. `expenseDate` khong mang timezone va duoc serialize theo dang `YYYY-MM-DD`.

## 6. User flows

### 6.1 Tao va sua draft

1. Employee dang nhap.
2. Employee tao expense hop le, he thong gan owner va `DRAFT`.
3. Employee co the sua hoac xoa khi expense van la `DRAFT`.
4. Employee co the xem expense cua minh.

### 6.2 Submit

1. Employee chon expense `DRAFT` va submit.
2. Backend kiem tra owner, role, validation va manager hien tai.
3. Neu employee khong co manager, tra `409` voi code `EMPLOYEE_MANAGER_REQUIRED`.
4. Neu hop le, chuyen `DRAFT -> PENDING`, gan `assignedManagerId` bang manager hien tai va cap nhat `submittedAt`.
5. Transition va audit event duoc ghi trong cung transaction.

### 6.3 Approve/reject

1. Manager xem pending approval queue gom expense `PENDING` co `assignedManagerId` bang id cua minh.
2. Manager approve de chuyen `PENDING -> APPROVED`, hoac reject de chuyen `PENDING -> REJECTED`.
3. Reject phai co reason.
4. Manager khong thay doi metadata expense trong thao tac approve/reject.
5. Transition va audit event duoc ghi trong cung transaction.

### 6.4 Reopen va submit lai

1. Owner mo expense `REJECTED` va reopen.
2. He thong chuyen `REJECTED -> DRAFT` va xoa `assignedManagerId`.
3. Employee co the sua draft.
4. Submit lai se lay manager hien tai tai thoi diem submit.

### 6.5 Employee khong co manager

- Thay doi `User.managerId` khong anh huong expense `PENDING` vi expense giu snapshot `assignedManagerId`.
- Employee khong co manager van xem/sua draft cua minh.
- Employee khong co manager khong submit/resubmit.
- Backend tra `409 EMPLOYEE_MANAGER_REQUIRED`.
- MVP khong hard-delete User.
- Khong vo hieu hoa Manager khi con expense `PENDING` gan cho ho. Trong MVP khong co reassign pending expense; cac expense do phai duoc assigned Manager hien tai xu ly truoc khi Manager co the bi vo hieu hoa.

### 6.6 Audit history

- Employee chi xem history cua expense minh so huu.
- Manager chi xem history khi `expense.assignedManagerId` bang id cua manager.
- Audit response chi co allowlist: `id`, `eventType`, actor `id`/`name`, `fromStatus`, `toStatus`, `reason`, `createdAt`.
- Khong tra token, token hash, password, secret hoac metadata noi bo.

Audit visibility cua Manager luon danh gia theo `Expense.assignedManagerId` hien tai, khong theo actor cua tung AuditEvent. Khi expense `PENDING` gan M1, M1 xem duoc toan bo history. Sau khi M1 reject, owner reopen va xoa assignment, khong Manager nao xem duoc history. Khi owner resubmit gan M2, M2 xem duoc toan bo history cua expense, ke ca cycle truoc; owner Employee luon xem duoc.

### 6.7 Manager scope khi thay doi quan he

Quan he quan ly hien tai va nguoi chiu trach nhiem approval la hai khai niem doc lap:

- `User.managerId` xac dinh Employee dang la direct report cua Manager nao hien tai.
- `Expense.assignedManagerId` la snapshot cua Manager chiu trach nhiem tai thoi diem submit.
- General expense list dung `User.managerId`.
- Pending approval queue, approve/reject va audit history dung `Expense.assignedManagerId`.
- Expense detail cho phep current Manager hoac assigned Manager xem, nhung quyen xem detail khong tu dong cap quyen approve/reject.
- Khi Employee E submit X cho M1, sau do `E.managerId` doi sang M2: M1 van thay X trong queue, xem detail, xem audit va approve/reject; M2 thay X trong general list va duoc xem detail nhung khong approve/reject va khong xem audit; X khong tu dong duoc chuyen sang M2.
- Reassign pending expense nam ngoai MVP.

## 7. State transition va business rules

| Tu         | Den        | Actor            | Dieu kien                                                                                     |
| ---------- | ---------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `DRAFT`    | `PENDING`  | Owner Employee   | Employee co manager hien tai. Gan assigned manager snapshot.                                  |
| `PENDING`  | `APPROVED` | Assigned Manager | Actor la Manager, owner la Employee, `assignedManagerId` bang actor va khong tu approve minh. |
| `PENDING`  | `REJECTED` | Assigned Manager | Actor la Manager, owner la Employee, `assignedManagerId` bang actor va reason bat buoc.       |
| `REJECTED` | `DRAFT`    | Owner Employee   | Xoa `assignedManagerId`.                                                                      |

`APPROVED` la trang thai ket thuc trong MVP. Transition khong hop le, status da thay doi hoac transition canh tranh tra `409`. Khong co general idempotency key trong MVP.

Moi transition phai cap nhat expense va tao audit event trong cung database transaction. Audit event append-only, khong co API sua/xoa va luu vo thoi han trong MVP.

## 8. Dashboard MVP

Dashboard dung thang hien tai, khong co time-range tuy chinh:

- So luong va tong tien theo status.
- Tong tien theo category.
- So expense `PENDING` manager dang cho xu ly.

Dashboard tach hai scope:

- General aggregates (count va total theo status, total theo category): Employee chi tren expense do minh so huu; Manager tren expense cua Employee hien dang la direct report cua minh theo `User.managerId`.
- `pendingApprovalCount`: chi dem expense co status `PENDING` va `assignedManagerId` bang id Manager dang dang nhap; khong dung `User.managerId`.

Vi du khi E doi tu M1 sang M2 trong luc X `PENDING` va assign cho M1: general aggregates cua M2 co the gom X, general aggregates cua M1 khong con gom X; `pendingApprovalCount` cua M1 van gom X, cua M2 khong gom X.

## 9. Tieu chi nghiem thu tong quat

- Khong the sua/xoa expense khong phai owner hoac khong o `DRAFT`.
- Khong the submit khi thieu manager.
- Khong the approve/reject neu khong phai assigned manager.
- Reject khong co reason bi tu choi.
- Approved khong the reopen.
- Reopen rejected xoa assigned manager va submit lai lay manager moi.
- Audit duoc tao cung transaction voi transition va khong bi sua/xoa qua API.
- Khong co public registration va khong co API/UI password change trong MVP.
- Access token va CSRF token khong duoc luu trong localStorage.

### Acceptance criteria cho Manager scope

- General manager list tra expense cua Employee co `User.managerId` la Manager hien tai.
- Pending approval queue chi tra expense `PENDING` co `Expense.assignedManagerId` la Manager dang dang nhap.
- Manager chi approve/reject expense khi la `assignedManagerId`; current manager khong thay the assigned manager.
- Manager duoc xem detail neu la current manager cua Employee owner hoac assigned manager cua expense.
- Audit history chi tra cho Employee owner hoac assigned manager.
- Khi E doi tu M1 sang M2 trong luc X `PENDING`, M1 van xu ly X; M2 thay X trong general list va detail nhung khong xu ly hoac xem audit; khong co auto-reassign.

## 10. Assumptions da chot

- Frontend Next.js; Express API chay rieng; TypeScript; PostgreSQL; Prisma.
- Monorepo dung pnpm workspaces, khong dung Turborepo trong MVP.
- Node.js 24.x LTS, pnpm 11.x; exact package manager `pnpm@11.20.0`.
- Primary production topology: Frontend `https://<project>.vercel.app` (Vercel), API `https://<service>.onrender.com` (Render Web Service), Database Render PostgreSQL (private). Cross-site topology. Custom domains (`https://expenseflow.example.com`, `https://api.expenseflow.example.com`) chi la optional/future custom-domain topology, khong phai Primary Execution Track hien tai.
- Password dai 12-128 ky tu, hash Argon2id, khong bat buoc composition rules.
- Demo credentials lay tu environment variables; seed idempotent, chi chay explicit va khong tu chay production.
- Access token song 15 phut trong frontend memory; refresh token HttpOnly cookie; logout revoke session hien tai.
- Production bat buoc HTTPS; CORS chi cho configured frontend origins va credentials; khong wildcard origin.
- Local co `expense_flow_dev` va `expense_flow_test`; integration test chi dung `TEST_DATABASE_URL`.
- Playwright va CI day du thuc hien sau cac flow chinh.

## 11. Open questions

Khong con open question nao can chot truoc khi viet architecture/API docs. Chi tiet implementation khong anh huong contract se duoc quyet dinh trong vertical feature tuong ung.
