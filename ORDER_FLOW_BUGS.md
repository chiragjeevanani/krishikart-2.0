# Order Flow — Bug Report & Fix Plan

**Date:** 2026-05-11  
**Investigator:** Claude Code (automated analysis)  
**Scope:** `createOrder`, `verifyPayment`, `updateOrderStatus`, `rejectFranchiseOrder`, related models and utils  
**Total Issues Found:** 21 (4 Critical · 8 High · 7 Medium · 2 Low)

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [High Severity Issues](#high-severity-issues)
3. [Medium Severity Issues](#medium-severity-issues)
4. [Low Severity Issues](#low-severity-issues)
5. [Root Cause Summary](#root-cause-summary)
6. [Recommended Fix Order](#recommended-fix-order)

---

## Critical Issues

---

### BUG-01 — `order` variable used before declaration in Credit payment path

**File:** `backend/app/controllers/order.controller.js:249–260`  
**Severity:** 🔴 Critical  

**What breaks:** Every single order placed with payment method `"Credit"` crashes with `ReferenceError: order is not defined`. The `order` variable is only created inside the `for` loop at line 272, but the notification block at lines 249–260 references `order._id` and `order.totalAmount` before the loop runs.

**Problematic code:**
```js
// Lines 249-260 — BEFORE the order creation loop at line 272
await createAdminNotification({
  message: `${user.fullName} placed order #${order._id.toString().slice(-6)} ...`, // ❌ ReferenceError
  meta: {
    orderId: order._id.toString(),   // ❌ order is undefined here
    amount: order.totalAmount,
  },
});
```

**Why it's intermittent:** It breaks 100% of the time for Credit users, but only Credit users. On machines where testers never used Credit checkout, it appears to work fine.

**Fix:** Remove the premature `createAdminNotification` call from the Credit block entirely. Move it inside the `for` loop, after `await order.save()`:
```js
// INSIDE the order creation for-loop, after order.save():
await createAdminNotification({
  type: "new_order",
  title: "New Order Placed",
  message: `${user.fullName} placed order #${order._id.toString().slice(-6)} for ₹${Number(order.totalAmount || 0).toFixed(2)}.`,
  meta: {
    orderId: order._id.toString(),
    amount: order.totalAmount,
  },
});
```

---

### BUG-02 — No idempotency check in `verifyPayment` — duplicate orders on retry

**File:** `backend/app/controllers/payment.controller.js:251`  
**Severity:** 🔴 Critical  

**What breaks:** If the client retries the `/verify-payment` call (network error, browser back button, double-tap), a second call with the same `razorpay_order_id` and `razorpay_payment_id` will pass signature verification and create a second identical order. The wallet/credit is deducted again, even though the cart may already be empty.

**Problematic code:**
```js
// No guard — Order is always created fresh
const newOrder = new Order({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    // ...
});
await newOrder.save();
```

**Why it's intermittent:** Happens on slow networks, cellular connections, and any user who retries checkout after a timeout.

**Fix:**
```js
// Add at the top of verifyPayment, after signature verification:
const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
if (existingOrder) {
    return handleResponse(res, 200, "Order already placed", {
        order: existingOrder,
        orders: [existingOrder],
    });
}
```
Also add a unique index on the model:
```js
// order.model.js
orderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
```

---

### BUG-03 — No MongoDB transaction — partial order creation leaves corrupt state

**File:** `backend/app/controllers/order.controller.js:263–325`  
`backend/app/controllers/payment.controller.js:242–301`  
**Severity:** 🔴 Critical  

**What breaks:** The checkout write sequence performs multiple independent MongoDB `.save()` calls in sequence:
1. Save each Order document
2. Increment coupon `timesUsed`
3. Save user (wallet/credit changes)
4. Clear cart

If any one of these fails (DB timeout, replica lag, network hiccup), the system ends up in a partially written state: orders may exist but wallet was not deducted; or wallet was deducted but cart was not cleared; or orders were created but coupon count not incremented. There is no rollback.

**Why it's intermittent:** Under load, with slower DB connections (common on other machines or staging), MongoDB timeouts between saves cause this.

**Fix:** Wrap the entire write sequence in a MongoDB session transaction:
```js
const session = await mongoose.startSession();
try {
    await session.withTransaction(async () => {
        // All order saves, coupon save, user save, cart save here
        // Pass { session } to every .save() and .create() call
        await order.save({ session });
        await user.save({ session });
        await cart.save({ session });
    });
} finally {
    await session.endSession();
}
```

---

### BUG-04 — `handleResponse` import mismatch in `payment.controller.js` — named vs default export

**File:** `backend/app/controllers/payment.controller.js:3`  
`backend/app/utils/helper.js:8`  
**Severity:** 🔴 Critical  

**What breaks:** `helper.js` exports `handleResponse` as a **named export**, but `payment.controller.js` imports it as a **default import**. In ES Modules, a named export imported as default will be `undefined`. Every single call to `handleResponse(...)` in the payment controller throws `TypeError: handleResponse is not a function`. Both `/create-razorpay-order` and `/verify-payment` are permanently broken.

**Problematic code:**
```js
// payment.controller.js line 3 — WRONG
import handleResponse from "../utils/helper.js";  // ❌ default import

// helper.js line 8
export const handleResponse = ...  // named export, NOT default
```

**Why it's intermittent:** May work if `helper.js` also has a `module.exports` or CommonJS default export in some environments, or if bundler behavior differs. Fails cleanly in strict ESM.

**Fix:**
```js
// payment.controller.js line 3 — CORRECT
import { handleResponse } from "../utils/helper.js";  // ✅ named import
```

---

## High Severity Issues

---

### BUG-05 — Race condition on wallet balance — concurrent orders can overdraw

**File:** `backend/app/controllers/order.controller.js:213–239`  
`backend/app/controllers/payment.controller.js:177–240`  
**Severity:** 🟠 High  

**What breaks:** The wallet deduction flow is a non-atomic read-modify-write:
1. Read user (get `walletBalance`)
2. Check `walletBalance >= grandTotal`
3. Subtract `walletBalance -= grandTotal` in memory
4. `user.save()`

Two concurrent requests for the same user (two browser tabs, two devices) both read the same balance, both pass the check, both deduct, and both save — last save wins, and the user overdrafts.

**Fix:** Use atomic conditional update:
```js
const updatedUser = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: grandTotal } },
    { $inc: { walletBalance: -grandTotal } },
    { new: true, session }
);
if (!updatedUser) {
    throw new Error("Insufficient wallet balance");
}
```

---

### BUG-06 — Race condition on coupon usage limit — concurrent bypass possible

**File:** `backend/app/utils/checkoutOrderSplit.js:182–215`  
`backend/app/controllers/order.controller.js:317–320`  
**Severity:** 🟠 High  

**What breaks:** Coupon validation reads `timesUsed` and checks the limit at validation time (inside `computeSplitCheckoutPayload`), but the actual increment `couponToIncrement.timesUsed += 1` happens much later — after all orders are created. Two concurrent requests both see `timesUsed = 9`, both pass the `< 10` check, and both get the discount. Similarly, the per-user usage check (`Order.countDocuments(...)`) runs before any order is created for the current request.

**Fix:** Use an atomic `findOneAndUpdate` for the increment:
```js
const updatedCoupon = await Coupon.findOneAndUpdate(
    {
        _id: coupon._id,
        $or: [
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ["$timesUsed", "$usageLimit"] } }
        ]
    },
    { $inc: { timesUsed: 1 } },
    { new: true, session }
);
if (!updatedCoupon) {
    throw new Error("Coupon usage limit reached — try again without the coupon.");
}
```

---

### BUG-07 — Stock deduction is not atomic and can be double-deducted or skipped

**File:** `backend/app/controllers/order.controller.js:1366–1403`  
**Severity:** 🟠 High  

**What breaks:** When an order is marked "Packed":
1. `order.save()` marks status as Packed
2. Inventory is re-fetched separately
3. Stock is decremented in memory and saved

If the inventory save crashes, stock is never deducted but the order is Packed. If two concurrent requests trigger the same Packed transition, both read the same inventory and both decrement — the second save overwrites the first, leaving stock only decremented once for two operations. There is also no guard preventing the same order from being packed twice.

**Fix:**
```js
// Use atomic $inc to prevent overwrite races:
await Inventory.updateOne(
    { franchiseId, "items.productId": item.productId },
    { $inc: { "items.$.currentStock": -quantityToPack } },
    { session }
);

// Add a flag to Order model to prevent double deduction:
isStockDeducted: { type: Boolean, default: false }

// Guard at the top of the Packed transition:
if (order.isStockDeducted) return; // already done
```

---

### BUG-08 — `verifyPayment` does not verify the Razorpay payment amount matches cart total

**File:** `backend/app/controllers/payment.controller.js:86–99`  
**Severity:** 🟠 High  

**What breaks:** Signature verification only confirms the `razorpay_order_id + "|" + razorpay_payment_id` pairing — it does NOT verify the payment amount. An attacker can:
1. Call `/create-razorpay-order` with `amount = 1` (₹0.01)
2. Complete that ₹0.01 payment — get valid Razorpay credentials
3. Call `/verify-payment` — signature passes, orders are created for the full cart total

**Fix:** Call Razorpay API to verify the captured amount server-side:
```js
const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
const expectedAmountPaise = Math.round(onlineAmountPaid * 100);
if (razorpayPayment.amount !== expectedAmountPaise || razorpayPayment.status !== "captured") {
    return handleResponse(res, 400, "Payment amount mismatch or payment not captured");
}
```

---

### BUG-09 — `RAZORPAY_KEY_SECRET` missing env var throws uncaught TypeError, leaks error details

**File:** `backend/app/controllers/payment.controller.js:88–91`  
**Severity:** 🟠 High  

**What breaks:** If `RAZORPAY_KEY_SECRET` is not set (common on a freshly cloned machine or misconfigured `.env`), `crypto.createHmac("sha256", undefined)` throws a raw `TypeError` that is caught by the outer catch and returned verbatim in the 500 response — leaking internal implementation details to the client.

**Fix:**
```js
// Add at the top of verifyPayment (or at server startup):
if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("[FATAL] RAZORPAY_KEY_SECRET is not configured");
    return handleResponse(res, 500, "Payment configuration error. Please contact support.");
}
```
Also add startup env validation in `server.js`:
```js
const REQUIRED_ENV = ["RAZORPAY_KEY_SECRET", "RAZORPAY_KEY_ID", "GOOGLE_MAPS_API_KEY", "MONGO_URI"];
for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`[FATAL] Missing required env var: ${key}`);
        process.exit(1);
    }
}
```

---

### BUG-10 — Cart cleared after user balance saved — partial failure window loses cart without order

**File:** `backend/app/controllers/order.controller.js:317–325`  
`backend/app/controllers/payment.controller.js:293–301`  
**Severity:** 🟠 High  

**What breaks:** The write sequence is:
1. All order saves
2. `coupon.save()`
3. `user.save()` — wallet/credit persisted
4. `cart.save()` — cart cleared

If step 3 succeeds but step 4 fails, the user's money is taken and orders exist, but the cart still shows all items — leading to re-order attempts. If any step before step 4 fails, the user gets orphaned state.

**Fix:** This is the same root cause as BUG-03. Wrapping everything in a MongoDB transaction (BUG-03 fix) resolves this automatically.

---

### BUG-11 — `assignOrderToFranchise` called before `user.save()` and `cart.save()` complete

**File:** `backend/app/controllers/order.controller.js:310–314`  
`backend/app/controllers/payment.controller.js:286–290`  
**Severity:** 🟠 High  

**What breaks:** `assignOrderToFranchise(order._id)` is called inside the order-creation loop, but `user.save()` and `cart.save()` happen after the loop ends. Franchise assignment triggers user notifications even before the payment/cart state is committed. If `user.save()` later fails, the user receives a "Your order was placed" notification for an order that technically failed.

**Fix:** Move all side effects (assignment calls, push notifications) to after all database writes have succeeded:
```js
// Step 1: save all orders, coupon, user, cart (in transaction)
// Step 2: THEN call assignOrderToFranchise for each created order
for (const order of createdOrders) {
    await assignOrderToFranchise(order._id);
}
```

---

### BUG-12 — Missing `await` on `assignDeliveryToOrder` — unhandled promise rejection can crash Node

**File:** `backend/app/controllers/order.controller.js:1922`  
**Severity:** 🟠 High  

**What breaks:** 
```js
assignDeliveryToOrder(order._id); // no await, no try/catch
```
Any error inside `assignDeliveryToOrder` becomes an unhandled promise rejection. In Node.js 15+, unhandled rejections terminate the process — causing the entire server to crash on a failed delivery assignment.

**Fix:**
```js
try {
    await assignDeliveryToOrder(order._id);
} catch (err) {
    console.error("[acceptFranchiseOrder] Delivery assignment failed:", err);
    // Order is still accepted; assignment failure is non-fatal but must be logged
}
```

---

## Medium Severity Issues

---

### BUG-13 — `Wallet + Online` refund missing in `rejectFranchiseOrder` — partial refund on rejection

**File:** `backend/app/controllers/order.controller.js:1998–2051`  
**Severity:** 🟡 Medium  

**What breaks:** When a franchise rejects an order and no other franchise can take it, the refund block handles "Wallet" and "UPI/Card" but has no branch for "Wallet + Online". The online portion is handled (via Razorpay refund), but the wallet component (`walletAmountUsed`) is NOT refunded.

**Fix:** Add the missing branch:
```js
if (freshOrder.paymentMethod === "Wallet + Online") {
    const walletRefund = Number(freshOrder.walletAmountUsed || 0);
    user.walletBalance = Number((user.walletBalance + walletRefund).toFixed(2));
    user.walletTransactions.push({
        type: "refund",
        amount: walletRefund,
        description: "Order cancelled — wallet portion refunded",
        referenceOrderId: freshOrder._id,
    });
}
```

---

### BUG-14 — Loyalty points race condition — same order can earn points twice

**File:** `backend/app/controllers/order.controller.js:1265–1318`  
**Severity:** 🟡 Medium  

**What breaks:** Two concurrent requests marking the same order as "Delivered" will both read the user document before either has saved the loyalty transaction. The `alreadyAwarded` check is an in-memory array scan — both reads return the same empty state and both award points.

**Fix:**
```js
await User.findOneAndUpdate(
    {
        _id: order.userId,
        "walletTransactions.referenceOrderId": { $ne: order._id },
        "walletTransactions.type": { $ne: "Loyalty Bonus" }
    },
    {
        $inc: { loyaltyPoints: pointsToAward },
        $push: { walletTransactions: loyaltyTxn }
    },
    { session }
);
```

---

### BUG-15 — Missing `await` on `sendNotificationToUser` — failed token cleanup silently skipped

**File:** `backend/app/controllers/order.controller.js:804–816, 2197–2212`  
**Severity:** 🟡 Medium  

**What breaks:** `sendNotificationToUser(...)` is called without `await` in `assignReturnPickupDelivery` and `assignDeliveryPartner`. Since the function internally calls `recipient.save()` to clean failed FCM tokens, those saves never complete. Over time, notification arrays accumulate dead tokens, making FCM calls slower and more error-prone.

**Fix:** Add `await` and a non-fatal catch:
```js
try {
    await sendNotificationToUser(partnerId, payload, "delivery");
} catch (notifErr) {
    console.error("[Notification] Push failed (non-fatal):", notifErr);
}
```

---

### BUG-16 — Duplicate `numberOfPackages` field in Order schema

**File:** `backend/app/models/order.js:153, 286`  
**Severity:** 🟡 Medium  

**What breaks:** `numberOfPackages` is declared at both line 153 (root level) and line 286 (likely intended for the `bilty` sub-object but placed at root). Mongoose silently uses the second definition. If the two definitions diverge in a future edit, behavior becomes unpredictable.

**Fix:** Remove the duplicate definition at line 286.

---

### BUG-17 — Strict city validation fails for legitimate addresses with complex formats

**File:** `backend/app/controllers/order.controller.js:166–179`  
`backend/app/controllers/payment.controller.js:135–148`  
**Severity:** 🟡 Medium  

**What breaks:** City is extracted by splitting `shippingAddress` on commas and taking `parts[parts.length - 2]`. For addresses with more than the expected comma count (e.g., `"Flat 4, Building A, Landmark, Area, City, State"`), the extracted segment is "State" not "City", causing legitimate orders to be rejected.

**Fix:** Use the geocoded `resolvedLocation.city` directly, don't parse the address string:
```js
// Don't parse shippingAddress. Use the geocoded city:
const resolvedCity = resolvedLocation.city?.toLowerCase() || "";
const inputCity = orderData?.city?.toLowerCase() || ""; // from a separate city field
```
Consider making this validation a warning log rather than a hard block.

---

### BUG-18 — `geocodeAddress` called on every order with no caching — API rate limits cause intermittent failures

**File:** `backend/app/utils/checkoutOrderSplit.js:41–51`  
**Severity:** 🟡 Medium  

**What breaks:** Every order placement makes a Google Maps Geocoding API call. On machines without `GOOGLE_MAPS_API_KEY`, city validation is silently skipped (inconsistent behavior). On shared machines or in development with a free API key, rate limits cause geocoding to fail, returning `null`, which causes the `resolvedLocation` null check to abort the order.

**Fix:**
- Cache geocoding results with a short TTL (5 minutes) in a simple in-process LRU or Redis.
- Add explicit check on missing API key with a meaningful error.
- Log a warning (not abort) when geocoding fails, unless coordinates are entirely missing.

---

### BUG-19 — `createRazorpayOrder` accepts zero, negative, and non-numeric amounts

**File:** `backend/app/controllers/payment.controller.js:14–36`  
**Severity:** 🟡 Medium  

**What breaks:** The only guard is `if (!amount)` which passes for `0` (falsy), but does not guard against negative values (`-100`), NaN (`"abc" * 100`), or near-zero floats (`0.001` → 0 paise). Razorpay will reject these server-side, but the error handling just returns "Payment initialization failed" with no useful information.

**Fix:**
```js
const amount = Number(req.body.amount);
if (!Number.isFinite(amount) || amount <= 0) {
    return handleResponse(res, 400, "Invalid payment amount");
}
```

---

## Low Severity Issues

---

### BUG-20 — `fs.appendFileSync` debug logging blocks the event loop

**File:** `backend/app/controllers/order.controller.js:1762–1765, 1799–1802`  
**Severity:** 🟢 Low  

**What breaks:** `fs.appendFileSync` is synchronous and blocks Node.js's event loop for all concurrent requests while the disk write happens. If `DEBUG_LOG_TO_FILE=true` is accidentally left on in production or staging, all order update requests become slow. Also writes to a relative path that may be read-only in Docker containers.

**Fix:** Replace with async file write or a proper logger:
```js
// Option A: async
await fs.promises.appendFile(path.join(process.cwd(), "debug_log.txt"), debugInfo);
// Option B: use pino/winston with async file transport
```

---

### BUG-21 — `walletAmountUsed` allows near-zero wallet contribution in Wallet+Online payment

**File:** `backend/app/controllers/payment.controller.js:177–203`  
**Severity:** 🟢 Low  

**What breaks:** A client sending `requestedWalletAmount = 0.001` passes the `> 0` check but results in a virtually zero wallet deduction. The transaction record will misleadingly show wallet usage for a payment that is effectively 100% online.

**Fix:**
```js
if (walletAmountUsed < 1) {
    return handleResponse(res, 400, "Minimum wallet contribution for Wallet+Online is ₹1");
}
```

---

## Root Cause Summary

| Root Cause | Bugs |
|---|---|
| No MongoDB transactions (non-atomic writes) | BUG-03, BUG-10 |
| Read-modify-write race conditions (no atomic ops) | BUG-04, BUG-05, BUG-06, BUG-14, BUG-16 |
| No idempotency / duplicate request guard | BUG-02 |
| Variable used before declaration (logic error) | BUG-01 |
| Wrong ES module import style | BUG-04 |
| Missing `await` on async calls | BUG-12, BUG-15 |
| Side effects before DB writes commit | BUG-11 |
| No server-side payment amount verification | BUG-08 |
| Missing env var validation at startup | BUG-09 |
| Fragile string parsing instead of geocoded data | BUG-17, BUG-18 |
| Incomplete payment method handling in refund | BUG-13 |
| Synchronous I/O on async path | BUG-20 |
| Insufficient input validation | BUG-07, BUG-19, BUG-21 |

---

## Recommended Fix Order

Fix these in order — earlier fixes unblock later ones:

| Priority | Bug | Why First |
|---|---|---|
| 1 | BUG-04 | All payment routes broken until this is fixed |
| 2 | BUG-01 | All Credit payment orders crash |
| 3 | BUG-02 | Duplicate orders possible on every retry |
| 4 | BUG-03 | All orders can leave corrupt DB state |
| 5 | BUG-05 | Wallet overdraft under load |
| 6 | BUG-06 | Coupon limit bypass under load |
| 7 | BUG-07 | Stock deduction inconsistency |
| 8 | BUG-08 | Payment amount fraud vector |
| 9 | BUG-09 | Crashes on misconfigured machines + info leak |
| 10 | BUG-10 | Covered by BUG-03 transaction fix |
| 11 | BUG-11 | Notifications sent for failed orders |
| 12 | BUG-12 | Server can crash on delivery assignment failure |
| 13–21 | Rest | After critical path is stable |
