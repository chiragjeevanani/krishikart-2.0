# Krishikart — Codebase Audit & Bug Report

**Audit Date**: 2026-05-01  
**Auditor**: Claude Code (automated multi-file analysis)  
**Branch**: `main` (commit `d8adab7`)  
**Scope**: Backend (Node.js/Express), Frontend (React/Vite), Order Flow, Auth, Payment

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Critical Bugs](#3-critical-bugs)
4. [High Severity Issues](#4-high-severity-issues)
5. [Medium Severity Issues](#5-medium-severity-issues)
6. [Low Severity Issues](#6-low-severity-issues)
7. [Order Flow Analysis](#7-order-flow-analysis)
8. [Auth Flow Analysis](#8-auth-flow-analysis)
9. [Payment Flow Analysis](#9-payment-flow-analysis)
10. [Security Vulnerabilities](#10-security-vulnerabilities)
11. [Recommendations](#11-recommendations)
12. [Master Issue Table](#12-master-issue-table)

---

## 1. Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | Express.js 5.2.1 (Node.js) |
| Database | MongoDB + Mongoose 9.2.1 |
| Auth | JWT 9.0.3 + OTP-based |
| Payment | Razorpay 2.9.6 |
| Real-time | Socket.IO 4.8.3 |
| Geo | H3-JS 4.4.0 (hexagon indexing) |
| Image storage | Cloudinary 2.9.0 |
| Frontend | React 19.2.0 + Vite 7.2.4 |
| Styling | Tailwind CSS 4.1.18 |
| Maps | React Leaflet + Google Maps API |
| State | React Context + custom hooks |
| HTTP client | Axios 1.13.5 |

---

## 2. Architecture Overview

```
Krishikart/
├── backend/
│   ├── app/
│   │   ├── controllers/     (19 files — order, payment, franchise, delivery, user...)
│   │   ├── models/          (24 Mongoose schemas)
│   │   ├── routes/          (13 route files, ~60 endpoints total)
│   │   ├── middlewares/     (JWT auth per role)
│   │   ├── utils/           (assignment, orderSplit, razorpay, geo helpers)
│   │   ├── services/        (Firebase Admin for push notifications)
│   │   └── lib/             (Socket.IO server)
│   └── index.js             (main entry)
└── frontend/
    └── src/modules/
        ├── user/            (customer app — checkout, orders, tracking)
        ├── franchise/       (store/franchise app)
        ├── delivery/        (delivery partner app)
        ├── masteradmin/     (admin dashboard)
        └── vendor/
```

**Key data flows**: User → Cart → Checkout → Order Split by Category → Auto-assign Franchise → Pack → Assign Delivery → Deliver → Return (optional)

---

## 3. Critical Bugs

### BUG-001 · Undefined `order` in Admin Notification (Race on variable scope)

**File**: `backend/app/controllers/order.controller.js` ~line 249–252  
**Severity**: CRITICAL  

When a Credit payment path fails midway, the code references `order._id` in an admin notification call **before** the `order` variable has been assigned. This produces `TypeError: Cannot read property '_id' of undefined` at runtime, crashing the request handler.

**Impact**: Any credit-payment order attempt that hits an error path sends a broken admin notification and may cause the endpoint to throw an unhandled exception.

**Fix**: Move the admin notification call to after the `order` document is saved, or guard with `if (order)`.

---

### BUG-002 · No Atomicity on Wallet Deduction (Race Condition)

**File**: `backend/app/controllers/order.controller.js` ~line 213–227  
**Severity**: CRITICAL  

Wallet deduction is done in application code with a read-then-write pattern:

```js
// BROKEN PATTERN:
const user = await User.findById(userId);
if (user.walletBalance < amount) return error;
user.walletBalance -= amount;     // another request could run here
await user.save();
```

If two order requests arrive simultaneously, both can pass the balance check and both deduct the full amount — driving `walletBalance` negative.

**Fix**: Use a MongoDB atomic operation:
```js
const result = await User.findOneAndUpdate(
  { _id: userId, walletBalance: { $gte: amount } },
  { $inc: { walletBalance: -amount } },
  { new: true }
);
if (!result) return res.status(400).json({ error: "Insufficient wallet balance" });
```

---

### BUG-003 · No Atomicity on Inventory Stock Deduction (Race Condition)

**File**: `backend/app/controllers/order.controller.js` ~line 1247–1285  
**Severity**: CRITICAL  

Stock is deducted during the "Packed" status update using the same read-modify-write pattern. Two franchises packing the same inventory simultaneously could both read `stock = 10`, both deduct 8, and send `stock = 2` to the DB — allowing over-commitment of inventory.

**Fix**: Use atomic `$inc` with a floor check:
```js
const inv = await Inventory.findOneAndUpdate(
  { productId, currentStock: { $gte: quantityToPack } },
  { $inc: { currentStock: -quantityToPack } },
  { new: true }
);
if (!inv) return res.status(409).json({ error: "Insufficient stock" });
```

---

### BUG-004 · Frontend Can Send Arbitrary Payment Amount (Payment Bypass)

**File**: `backend/app/controllers/payment.controller.js` ~line 17–21  
**Severity**: CRITICAL  

The `/payment/create-razorpay-order` endpoint trusts the `amount` field from the frontend request body without verifying it against the actual cart total. A malicious user could send `{ amount: 1 }` (₹0.01) and receive a valid Razorpay order ID for any cart value.

**Impact**: Full payment bypass — user pays ₹0.01 for a ₹5,000 order.

**Fix**: Recalculate the cart total on the server before creating the Razorpay order. Reject if the amounts don't match.

---

## 4. High Severity Issues

### HIGH-001 · No Idempotency on Order Placement (Duplicate Orders)

**File**: `backend/app/controllers/order.controller.js` ~line 294–315  
**Severity**: HIGH  

The `POST /orders/place` endpoint has no idempotency key. If the client retries the request (e.g., due to a timeout), the endpoint creates a second full set of orders. The user is charged again and their wallet is double-deducted.

**Fix**: Accept an `X-Idempotency-Key` header and deduplicate within a 5-minute window.

---

### HIGH-002 · Mixed-Payment Refund Loses Online Amount

**File**: `backend/app/controllers/order.controller.js` ~line 1361–1368  
**Severity**: HIGH  

When an order is cancelled that was paid with a combination of Wallet + Online (Razorpay), the refund logic only returns `creditAmountUsed` and `walletAmountUsed` back to the wallet. The online (Razorpay) portion may not be refunded at all.

**Impact**: User loses money on cancelled mixed-payment orders.

**Fix**: Track each payment component (`walletPaid`, `razorpayPaid`, `creditPaid`) on the order document and refund each separately — Razorpay refund API for the online portion, wallet credit for the rest.

---

### HIGH-003 · No Inventory Lock During Packing

**File**: `backend/app/controllers/order.controller.js` ~line 1073–1094  
**Severity**: HIGH  

The packing flow: (1) check inventory, (2) pack items, (3) deduct inventory. Steps 1 and 3 are non-atomic. Multiple franchises can pass the inventory check simultaneously and all deduct from the same stock.

**Fix**: Use atomic MongoDB operations with a version field (optimistic concurrency) or a per-product Mongo lock document.

---

### HIGH-004 · No Daily OTP Attempt Cap (Brute Force Possible)

**File**: `backend/app/controllers/user.auth.js` ~line 56–65  
**Severity**: HIGH  

OTP requests have a 15-second cooldown per phone number, but no daily cap. An attacker can make ~5,760 OTP requests per day per number. Although OTPs are hashed, this causes SMS cost exhaustion and possible SMS gateway abuse.

**Fix**: Add a per-phone daily limit (e.g., 10 OTPs/day) enforced in the OTP collection with a TTL-based counter.

---

### HIGH-005 · Razorpay Signature Replay Attack

**File**: `backend/app/controllers/payment.controller.js` ~line 87–99  
**Severity**: HIGH  

After a valid Razorpay payment is verified, the server does not record the `razorpay_payment_id` as "used." An attacker who intercepts a valid signature can call `/payment/verify-payment` multiple times, creating multiple orders from a single payment.

**Fix**: Store verified `razorpay_payment_id` values in the database. Reject duplicate verifications.

---

## 5. Medium Severity Issues

### MED-001 · Coupon Usage Count Includes Cancelled Orders

**File**: `backend/app/utils/checkoutOrderSplit.js` ~line 186–191  
**Severity**: MEDIUM  

Coupon usage per user is counted from all orders, including cancelled ones. If a user's order (placed with coupon) is cancelled, the coupon usage count is not decremented. Over time, users may be blocked from reusing coupons they legitimately have remaining uses for.

**Fix**: Exclude orders with `orderStatus: "Cancelled"` from the usage count query.

---

### MED-002 · Delivery Partner Auth Fallback Bypass

**File**: `backend/app/controllers/order.controller.js` ~line 1051–1058  
**Severity**: MEDIUM  

Delivery-partner status updates check `req.delivery` (set by delivery auth middleware). However, there is a fallback: `req.user?.role === "delivery"`. If a regular user account has `role: "delivery"` set (e.g., by a DB admin error), they bypass the delivery partner authentication entirely and can update any delivery status.

**Fix**: Remove the `req.user?.role` fallback. Rely solely on `req.delivery` from `protectDelivery` middleware.

---

### MED-003 · Franchise Rejection Loop — No Max Attempts

**File**: `backend/app/controllers/order.controller.js` ~line 1862–1866  
**Severity**: MEDIUM  

When a franchise rejects an order, the system auto-reassigns. If the reassigned franchise also rejects, the loop continues. There is no hard cap on assignment attempts. In theory the loop terminates when no franchises remain, but it wastes resources and delays order cancellation.

**Fix**: Add `const MAX_ATTEMPTS = 5` and cancel the order after exceeding this threshold.

---

### MED-004 · Cart Cleared Before Order Confirmation

**File**: `backend/app/controllers/order.controller.js` ~line 324–325  
**Severity**: MEDIUM  

The cart is cleared immediately after the order documents are saved, but before notifications, wallet deduction finalization, and franchise assignment complete. If any of those async operations fail, the user's cart is empty but they may not have a confirmed order.

**Fix**: Clear the cart as the very last step, after all operations succeed. Wrap the entire flow in a try/finally or MongoDB transaction.

---

### MED-005 · Partial Fulfillment Approval Timing Error

**File**: `backend/app/controllers/order.controller.js` ~line 924–948  
**Severity**: MEDIUM  

Master Admin can approve partial fulfillment on an order at any status, including "Packed" or later. If the flag is set after packing has already completed, it has no effect — but the admin receives no warning. They believe partial fulfillment was enabled when it wasn't.

**Fix**: Validate that `orderStatus` is `"Placed"` or `"Accepted"` before allowing the partial fulfillment flag to be set.

---

### MED-006 · Razorpay Checkout Cancel Leaves Cart Empty

**File**: `frontend/src/modules/user/pages/CheckoutScreen.jsx` ~line 323+  
**Severity**: MEDIUM  

If a user initiates a Razorpay payment but cancels the payment modal, the frontend does not restore the cart or the checkout state. The user returns to an empty cart and must re-add all items from scratch.

**Fix**: Do not clear the cart until the `/payment/verify-payment` call succeeds. Keep items in cart until payment is fully confirmed.

---

### MED-007 · Address City Validation Passes on Empty String

**File**: `backend/app/controllers/order.controller.js` ~line 167–179  
**Severity**: MEDIUM  

If the geocoding API returns an empty city string, the city validation check (which does a substring match) may pass silently with no city set on the order's `shippingLocation`. Orders end up with `city: ""` which breaks geo-based queries and delivery-area matching.

**Fix**: Add explicit guard: `if (!resolvedLocation?.city) return res.status(400).json({ error: "Could not determine delivery city" })`.

---

### MED-008 · No Rate Limiting on Order Placement

**File**: `backend/app/controllers/order.controller.js` ~line 131+  
**Severity**: MEDIUM  

The `POST /orders/place` endpoint has no per-user rate limit. A script can continuously hit this endpoint, exhausting the user's wallet balance or credit limit within seconds (since each request deducts and creates an order).

**Fix**: Apply rate limiting middleware: max 5 order placements per minute per user token.

---

### MED-009 · Refund Goes to Wallet, Not Original Payment Method

**File**: `backend/app/controllers/order.controller.js` ~line 1883–1915  
**Severity**: MEDIUM (UX)  

When an order paid via Razorpay (UPI/card) is cancelled, the refund is credited to the user's in-app wallet — not back to their card or UPI. This is not communicated to the user during order placement and causes complaints.

**Fix**: Attempt Razorpay refund via `razorpay.payments.refund()` for online payments. Fall back to wallet credit only if Razorpay refund fails. Always display refund destination to user.

---

## 6. Low Severity Issues

### LOW-001 · Bilty Generation Has No Error Handling

**File**: `backend/app/controllers/order.controller.js` ~line 1203–1243  
**Severity**: LOW  

If bilty (shipping document) generation fails, the order is still marked "Out for Delivery" without a bilty number. There is no retry mechanism or error recovery. The order proceeds without a shipping document.

**Fix**: Generate and save the bilty **before** updating the order status. If bilty generation fails, return an error and do not advance the status.

---

### LOW-002 · Return Pickup Orphaned on Reassignment

**File**: `backend/app/controllers/order.controller.js` ~line 663–673  
**Severity**: LOW  

If a franchise reassigns the return pickup to a different delivery partner, the original `pickupDeliveryPartnerId` is overwritten without marking the previous assignment as cancelled. The old delivery partner's task list may still show the pickup as pending.

**Fix**: Before reassigning, set the previous pickup's status to `"cancelled"` and notify the old delivery partner.

---

### LOW-003 · Duplicate `userId` and `user` Fields on Order Schema

**File**: `backend/app/models/order.js` ~line 109–117  
**Severity**: LOW  

The Order schema has both `userId` (ObjectId ref to User) and `user` (also ObjectId ref to User). Different parts of the codebase use different fields, causing confusion and making queries inconsistent.

**Fix**: Standardize on one field (`userId`). Run a migration to move any `user` data to `userId` and remove the duplicate field.

---

### LOW-004 · No `orderGroupId` Query Endpoint

**File**: `backend/app/controllers/order.controller.js` ~line 137–199  
**Severity**: LOW  

When a cart is split into multiple orders (by product category), all orders share an `orderGroupId`. However, there is no API endpoint to query all orders by `orderGroupId`. Users and admins cannot see the full split group in one request.

**Fix**: Add `GET /api/orders?orderGroupId=:id` that returns all orders sharing that group ID.

---

### LOW-005 · Missing Status Transition Guard (Packed → Dispatched)

**File**: `backend/app/controllers/order.controller.js` ~line 978–991  
**Severity**: LOW  

The intended status flow is: `Packed → Ready → Dispatched`. The "Ready" status exists in the schema but the transition validation allows jumping from `Packed` directly to `Dispatched`, making "Ready" a dead state.

**Fix**: Add `"Packed"` → `"Ready"` as a required intermediate transition, or remove the "Ready" status if it is not needed.

---

### LOW-006 · Franchise Serves All Categories if `servedCategories` is Empty

**File**: `backend/app/controllers/order.controller.js` ~line 1615–1630  
**Severity**: LOW  

In the open order pool, franchises are filtered by `servedCategories`. If a franchise has an empty `servedCategories` array (e.g., due to incomplete registration), the filter treats them as serving ALL categories. They receive orders for products they may not carry.

**Fix**: Require at least one category during franchise registration. Filter: `servedCategories.length > 0 && servedCategories.includes(categoryId)`.

---

### LOW-007 · Phone Number Enumeration via OTP Endpoint

**File**: `backend/app/controllers/user.auth.js` ~line 38–43  
**Severity**: LOW  

The `/user/send-otp` endpoint responds differently depending on whether a phone number is registered (creates user if not found). An attacker can infer whether a number is registered by observing response timing or content differences.

**Fix**: Always return the same response regardless of whether the user exists. Create the user silently on first OTP send.

---

### LOW-008 · Hardcoded Default OTPs in Environment Variables

**File**: `backend/app/controllers/user.auth.js` ~line 45–51  
**Severity**: LOW (HIGH if leaked to production)  

`USER_DEFAULT_OTP`, `FRANCHISE_DEFAULT_OTP`, `DELIVERY_DEFAULT_OTP`, `MASTERADMIN_DEFAULT_OTP` allow bypassing SMS OTP in development. If the `.env` file is ever exposed or these values are accidentally used in production, anyone can log in as any user.

**Fix**: Gate these behind an explicit `NODE_ENV=development` check and add a startup assertion that refuses to boot if default OTPs are set while `NODE_ENV=production`.

---

### LOW-009 · Excessive Diagnostic Logging in Payment Verification

**File**: `backend/app/controllers/payment.controller.js` ~line 50–55  
**Severity**: LOW  

The `verifyPayment` handler contains verbose `console.log` statements that may print payment details, user IDs, and potentially environment-variable-derived values. If logs are shipped to a log aggregator, this becomes a PII disclosure risk.

**Fix**: Remove diagnostic logs from production code. If you need logging, use a structured logger (e.g., `winston`) with PII masking and keep sensitive fields out of log output.

---

## 7. Order Flow Analysis

### Full Flow Diagram

```
User adds items to cart
        ↓
User navigates to Checkout
  - Selects delivery address + pins location on map
  - Selects delivery time slot
  - Applies coupon (optional)
  - Selects payment method
        ↓
Payment Method Branch:
  ┌─── Wallet / Credit / COD ──→ POST /orders/place (direct)
  └─── UPI / Card ─────────────→ POST /payment/create-razorpay-order
                                         ↓
                                  User pays in Razorpay modal
                                         ↓
                                  POST /payment/verify-payment
                                         ↓
                                  POST /orders/place (internal)
        ↓
Order split by product category → N orders created with same orderGroupId
        ↓
Auto-assign each order to nearest franchise (H3 geo + radius fallback)
  ├── Franchise found → orderStatus: "Assigned", notify franchise
  └── No franchise → orderStatus: "Placed" (waits in open pool)
        ↓
Franchise accepts order
  - Check inventory for shortages
  - orderStatus: "Accepted"
        ↓
Franchise packs order
  - Deduct inventory (BUG-003: non-atomic)
  - orderStatus: "Packed"
        ↓
Franchise assigns delivery partner
  - orderStatus: "Dispatched"
  - Push notification to delivery partner
        ↓
Delivery partner picks up and delivers
  - orderStatus: "Out for Delivery" → "Delivered"
  - Bilty generated (LOW-001: no error handling)
  - COD: collected amount recorded
        ↓
User receives order
  - Can mark "Received"
  - Can initiate return within 2 days
        ↓ (optional)
Return flow:
  User creates return request
        ↓
  Franchise approves / rejects
        ↓
  Franchise assigns return pickup delivery
        ↓
  Delivery partner picks up return item
        ↓
  On completion: refund to user wallet
```

### Flow Gaps

| Gap | Description |
|-----|-------------|
| No group-level query | Split orders cannot be fetched together by `orderGroupId` |
| No recovery on payment cancel | Cart is cleared before Razorpay payment confirmation |
| "Ready" status unused | Packed → Dispatched bypasses "Ready" state |
| No order timeout | If franchise never accepts, order waits indefinitely |
| No delivery SLA | No escalation if delivery partner never marks delivered |

---

## 8. Auth Flow Analysis

### Role Matrix

| Role | Auth Method | Verified By | Token Claim |
|------|-------------|-------------|-------------|
| User | OTP → JWT | Self (OTP) | `{ id, role: "user" }` |
| Franchise | OTP → JWT | Master Admin (isVerified) | `{ id, role: "franchise" }` |
| Delivery | OTP → JWT | Master Admin (isApproved) | `{ id, role: "delivery" }` |
| Master Admin | OTP or Secret Key | Self | `{ id, role: "masteradmin" }` |

### Auth Flow Issues

| Issue | Description |
|-------|-------------|
| No refresh tokens | JWTs appear to be long-lived with no rotation mechanism |
| No token revocation | Logged-out tokens remain valid until expiry |
| Default OTP bypass | Dev credentials can leak to production (LOW-008) |
| SubAdmin permission strings | Case-sensitive string matching; typo → silent 403 |

---

## 9. Payment Flow Analysis

### Razorpay Integration Steps

```
1. Frontend: POST /payment/create-razorpay-order { amount }
   ↓  [BUG: amount not verified against cart — CRITICAL BUG-004]
2. Backend: Razorpay.orders.create({ amount, currency: "INR" })
   → Returns { razorpay_order_id }
3. Frontend: Open Razorpay modal → User pays
4. Razorpay: Returns { razorpay_payment_id, razorpay_order_id, razorpay_signature }
5. Frontend: POST /payment/verify-payment { ...razorpay fields, cartData }
6. Backend: HMAC-SHA256 verify signature  ✓
   [MISSING: check if payment_id already used — HIGH-005]
7. Backend: Create orders + deduct wallet
   [BUG: wallet deduction not atomic — CRITICAL BUG-002]
8. Backend: Return success + order IDs
```

### Refund Flow Issues

| Scenario | Current Behavior | Expected Behavior |
|----------|-----------------|-------------------|
| Razorpay order cancelled | Refund to wallet | Refund to original payment method |
| Wallet order cancelled | Refund to wallet | ✓ Correct |
| COD order cancelled | No refund needed | ✓ Correct |
| Mixed payment cancelled | Partial refund (HIGH-002) | Refund each component separately |

---

## 10. Security Vulnerabilities

| ID | Type | Severity | Description | File |
|----|------|----------|-------------|------|
| SEC-001 | Payment Bypass | CRITICAL | Amount not verified server-side | payment.controller.js:17 |
| SEC-002 | Race Condition | CRITICAL | Wallet deduction not atomic | order.controller.js:213 |
| SEC-003 | Race Condition | CRITICAL | Stock deduction not atomic | order.controller.js:1247 |
| SEC-004 | Replay Attack | HIGH | Razorpay signature not stored as used | payment.controller.js:87 |
| SEC-005 | Brute Force | HIGH | No daily OTP attempt cap | user.auth.js:56 |
| SEC-006 | Privilege Escalation | MEDIUM | Delivery auth fallback to user.role | order.controller.js:1051 |
| SEC-007 | PII Disclosure | LOW | Verbose payment logs | payment.controller.js:50 |
| SEC-008 | Enumeration | LOW | Phone enumeration via OTP endpoint | user.auth.js:38 |
| SEC-009 | Hardcoded Creds | LOW (HIGH if leaked) | Default OTPs in env vars | user.auth.js:45 |

**Not Applicable (mitigated)**:
- SQL injection: Mongoose ODM used, no raw queries
- Franchise address injection: Regex properly escaped in assignment.js
- Franchise verification bypass: `isVerified` check is correct

---

## 11. Recommendations

### Immediate (Fix Before Production)

1. **Atomic wallet ops** — Replace read-modify-write with `findOneAndUpdate + $inc` and a balance floor check
2. **Atomic stock ops** — Same pattern for inventory deduction during packing
3. **Server-side amount validation** — Recalculate cart total on server before Razorpay order creation
4. **Idempotency keys** — Add to `/orders/place` and `/payment/verify-payment` to prevent duplicates
5. **Signature replay protection** — Store and check `razorpay_payment_id` in a "used payments" collection
6. **Remove undefined reference** — Fix `order._id` access before order is created in admin notification

### Short-term (This Sprint)

7. **Rate limiting** — Apply per-user rate limits on order placement and OTP requests
8. **Mixed-payment refunds** — Track and refund each payment component separately; use Razorpay refund API
9. **Cart preservation** — Do not clear cart until `/payment/verify-payment` fully succeeds
10. **Daily OTP cap** — Add counter with TTL to limit OTP requests per number per day
11. **Default OTP guard** — Refuse to boot with default OTPs set in production environment

### Medium-term

12. **Coupon cancellation logic** — Exclude cancelled orders from coupon usage count
13. **Max assignment attempts** — Cancel order and notify user after 5 failed franchise assignments
14. **JWT refresh/revocation** — Add refresh token flow and a token blocklist (Redis) for logout
15. **Audit log collection** — Record all status transitions with actor ID, timestamp, and previous state
16. **`orderGroupId` endpoint** — `GET /api/orders?orderGroupId=:id` for split-order queries
17. **Partial fulfillment timing** — Validate order status before allowing flag change

### Architecture

18. **MongoDB transactions** — Wrap the full order-placement flow (wallet deduct + order create + cart clear) in a single MongoDB session transaction
19. **Structured logging** — Replace `console.log` with a structured logger (e.g., `winston`) with PII masking
20. **Schema cleanup** — Remove duplicate `user`/`userId` fields from Order schema

---

## 12. Master Issue Table

| # | ID | Category | Severity | Issue | File |
|---|----|----------|----------|-------|------|
| 1 | BUG-001 | Bug | CRITICAL | Undefined `order` in admin notification | order.controller.js:249 |
| 2 | BUG-002 | Bug | CRITICAL | No atomicity on wallet deduction | order.controller.js:213 |
| 3 | BUG-003 | Bug | CRITICAL | No atomicity on stock deduction | order.controller.js:1247 |
| 4 | BUG-004 | Security | CRITICAL | Payment amount not server-validated | payment.controller.js:17 |
| 5 | HIGH-001 | Validation | HIGH | No idempotency on order placement | order.controller.js:294 |
| 6 | HIGH-002 | Bug | HIGH | Mixed-payment refund loses online amount | order.controller.js:1361 |
| 7 | HIGH-003 | Bug | HIGH | Inventory check not locked | order.controller.js:1073 |
| 8 | HIGH-004 | Security | HIGH | No daily OTP attempt cap | user.auth.js:56 |
| 9 | HIGH-005 | Security | HIGH | Razorpay signature replay attack | payment.controller.js:87 |
| 10 | MED-001 | Validation | MEDIUM | Coupon count includes cancelled orders | checkoutOrderSplit.js:186 |
| 11 | MED-002 | Security | MEDIUM | Delivery auth fallback to user.role | order.controller.js:1051 |
| 12 | MED-003 | Flow | MEDIUM | Franchise rejection loop — no max attempts | order.controller.js:1862 |
| 13 | MED-004 | Flow | MEDIUM | Cart cleared before order fully confirmed | order.controller.js:324 |
| 14 | MED-005 | Validation | MEDIUM | Partial fulfillment approval timing | order.controller.js:924 |
| 15 | MED-006 | UX/Flow | MEDIUM | Razorpay cancel → cart lost | CheckoutScreen.jsx:323 |
| 16 | MED-007 | Validation | MEDIUM | Empty city passes geocode validation | order.controller.js:167 |
| 17 | MED-008 | Security | MEDIUM | No rate limit on order placement | order.controller.js:131 |
| 18 | MED-009 | UX/Flow | MEDIUM | Refund goes to wallet, not original method | order.controller.js:1883 |
| 19 | LOW-001 | Flow | LOW | Bilty generation has no error handling | order.controller.js:1203 |
| 20 | LOW-002 | Flow | LOW | Return pickup orphaned on reassignment | order.controller.js:663 |
| 21 | LOW-003 | Schema | LOW | Duplicate `userId`/`user` on Order schema | order.model.js:109 |
| 22 | LOW-004 | Feature Gap | LOW | No endpoint to query by `orderGroupId` | order.controller.js:137 |
| 23 | LOW-005 | Flow | LOW | "Ready" status bypassed in transition | order.controller.js:978 |
| 24 | LOW-006 | Validation | LOW | Empty `servedCategories` serves all products | order.controller.js:1615 |
| 25 | LOW-007 | Security | LOW | Phone enumeration via OTP endpoint | user.auth.js:38 |
| 26 | LOW-008 | Security | LOW | Default OTPs not gated to development | user.auth.js:45 |
| 27 | LOW-009 | Security | LOW | Verbose payment logs risk PII disclosure | payment.controller.js:50 |

---

*Total issues found: 27 (4 Critical, 5 High, 9 Medium, 9 Low)*  
*This report covers backend controllers, models, middlewares, utils, and frontend checkout/order flow.*
