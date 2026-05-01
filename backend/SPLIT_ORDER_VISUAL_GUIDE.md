# Split Order Tracking - Visual Guide

## 📱 User Journey

### Scenario: User orders 3-4 products from different categories

```
User Cart:
├── 🥬 Vegetables (Tomato, Onion) - Category A
├── 🥛 Dairy (Milk, Paneer) - Category B
└── 🌾 Grains (Rice) - Category C
```

---

## 🔄 Order Flow

### Step 1: Order Placement
```
User clicks "Place Order"
         ↓
System checks product categories
         ↓
Order splits into 3 separate orders
         ↓
All orders get same orderGroupId
```

### Step 2: Order Assignment
```
Order 1 (Vegetables) → Franchise A → Delivery Partner 1
Order 2 (Dairy)      → Franchise B → (Pending assignment)
Order 3 (Grains)     → Franchise C → (Pending assignment)
```

### Step 3: Order Tracking
```
User opens "My Orders"
         ↓
Sees grouped split order
         ↓
Clicks "Track All Orders"
         ↓
Views individual tracking for each order
```

---

## 🎨 UI Mockups

### 1. Order List Screen

```
┌─────────────────────────────────────────────────────┐
│  My Orders                                    🔍 🔔  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🛒 Split Order #ABC123          📅 30 Apr    │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ 📦 3 separate deliveries                     │ │
│  │ 💰 Total: ₹2,450                             │ │
│  │                                               │ │
│  │ ✅ Order 1: Out for Delivery                 │ │
│  │ 📦 Order 2: Packed                           │ │
│  │ ⏳ Order 3: Accepted                         │ │
│  │                                               │ │
│  │           [Track All Orders →]               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📦 Order #XYZ789                📅 29 Apr    │ │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │ ✅ Delivered                                  │ │
│  │ 💰 Total: ₹120                               │ │
│  │                                               │ │
│  │           [View Details →]                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2. Split Order Detail Screen

```
┌─────────────────────────────────────────────────────┐
│  ← Split Order Group                         🔍 ⋮   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Order Group #ABC123                                │
│  3 Orders • ₹2,450 • In Progress                   │
│  Ordered on 30 Apr 2026, 10:30 AM                  │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order 1 of 3 • #...9c0e                     │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                                             │   │
│  │ 🚚 Out for Delivery                         │   │
│  │ 💰 ₹350                                     │   │
│  │                                             │   │
│  │ 🏪 Fulfilled by                             │   │
│  │    Green Valley Franchise                   │   │
│  │    Fresh Vegetables Store                   │   │
│  │    📞 9876543210                            │   │
│  │    📍 456, Market Road, Bangalore           │   │
│  │                                             │   │
│  │ 🛵 Delivery Partner                         │   │
│  │    Amit Singh                               │   │
│  │    📞 9123456789                            │   │
│  │    🚗 KA01AB1234 (Bike)                     │   │
│  │                                             │   │
│  │ 📦 Items                                    │   │
│  │    • Tomato: 5 kg                           │   │
│  │    • Onion: 3 kg                            │   │
│  │                                             │   │
│  │ 📍 Tracking                                 │   │
│  │    ✅ Placed        10:30 AM                │   │
│  │    ✅ Assigned      10:35 AM                │   │
│  │    ✅ Accepted      10:45 AM                │   │
│  │    ✅ Packed        11:30 AM                │   │
│  │    🚚 Out for Delivery  12:15 PM            │   │
│  │                                             │   │
│  │    [Contact Franchise] [Contact Delivery]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order 2 of 3 • #...9c0f                     │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                                             │   │
│  │ 📦 Packed                                   │   │
│  │ 💰 ₹1,450                                   │   │
│  │                                             │   │
│  │ 🏪 Fulfilled by                             │   │
│  │    Milk & More Franchise                    │   │
│  │    Dairy Products Hub                       │   │
│  │    📞 9988776655                            │   │
│  │                                             │   │
│  │ 🛵 Delivery Partner                         │   │
│  │    Not assigned yet                         │   │
│  │                                             │   │
│  │ 📦 Items                                    │   │
│  │    • Milk: 10 liter                         │   │
│  │    • Paneer: 2 kg                           │   │
│  │                                             │   │
│  │ 📍 Tracking                                 │   │
│  │    ✅ Placed        10:30 AM                │   │
│  │    ✅ Assigned      10:36 AM                │   │
│  │    ✅ Accepted      10:50 AM                │   │
│  │    ✅ Packed        11:45 AM                │   │
│  │                                             │   │
│  │    [Contact Franchise]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order 3 of 3 • #...9c10                     │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                                             │   │
│  │ ⏳ Accepted                                 │   │
│  │ 💰 ₹650                                     │   │
│  │                                             │   │
│  │ 🏪 Fulfilled by                             │   │
│  │    Annapurna Franchise                      │   │
│  │    Grains & Pulses Store                    │   │
│  │    📞 9876512345                            │   │
│  │                                             │   │
│  │ 📦 Items                                    │   │
│  │    • Rice: 10 kg                            │   │
│  │                                             │   │
│  │ 📍 Tracking                                 │   │
│  │    ✅ Placed        10:30 AM                │   │
│  │    ✅ Assigned      10:37 AM                │   │
│  │    ✅ Accepted      11:00 AM                │   │
│  │                                             │   │
│  │    [Contact Franchise]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Status Icons Guide

### Order Status Icons
```
✅ Delivered          - Order successfully delivered
🚚 Out for Delivery   - On the way to customer
📦 Packed             - Ready for dispatch
⏳ Accepted           - Franchise accepted order
🔄 Assigned           - Assigned to franchise
📝 Placed             - Order placed by customer
❌ Cancelled          - Order cancelled
```

### Progress Indicators
```
All Delivered:    ✅✅✅
In Progress:      🚚📦⏳
Partially Done:   ✅📦⏳
Has Cancelled:    ✅❌⏳
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Places    │
│   Order     │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Backend: computeSplitCheckoutPayload│
│  - Groups items by category         │
│  - Generates orderGroupId           │
│  - Creates multiple orders          │
└──────┬──────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Database: 3 Orders Created          │
│  ┌────────────────────────────────┐  │
│  │ Order 1                        │  │
│  │ - orderGroupId: ABC123         │  │
│  │ - items: [Tomato, Onion]       │  │
│  │ - franchiseId: Franchise A     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Order 2                        │  │
│  │ - orderGroupId: ABC123         │  │
│  │ - items: [Milk, Paneer]        │  │
│  │ - franchiseId: Franchise B     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Order 3                        │  │
│  │ - orderGroupId: ABC123         │  │
│  │ - items: [Rice]                │  │
│  │ - franchiseId: Franchise C     │  │
│  └────────────────────────────────┘  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  API: GET /orders/my-orders          │
│  - Fetches all user orders           │
│  - Groups by orderGroupId            │
│  - Returns grouped + standalone      │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Frontend: Display Orders            │
│  - Shows split order card            │
│  - Shows standalone order cards      │
└──────┬───────────────────────────────┘
       │
       ↓ (User clicks "Track All Orders")
       │
┌──────────────────────────────────────┐
│  API: GET /orders/group/:groupId     │
│  - Fetches all orders in group       │
│  - Includes franchise details        │
│  - Includes delivery partner details │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Frontend: Display Tracking          │
│  - Shows each order separately       │
│  - Shows tracking timeline           │
│  - Shows contact information         │
└──────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────┐
│   User      │
│   Request   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Middleware: protect                 │
│  - Validates JWT token               │
│  - Extracts user ID                  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Controller: getOrdersByGroupId      │
│  - Fetches orders by groupId         │
│  - Checks if user owns any order     │
└──────┬───────────────────────────────┘
       │
       ├─→ User owns order? ──→ ✅ Return data
       │
       └─→ User doesn't own? ──→ ❌ 403 Forbidden
```

---

## 📱 Mobile App Screens

### Screen 1: Order List
```
┌─────────────────────┐
│  ← My Orders    🔔  │
├─────────────────────┤
│                     │
│  🛒 Split Order     │
│  #ABC123            │
│  ─────────────────  │
│  3 deliveries       │
│  ₹2,450             │
│                     │
│  ✅ 1: Delivering   │
│  📦 2: Packed       │
│  ⏳ 3: Accepted     │
│                     │
│  [Track All →]      │
│                     │
├─────────────────────┤
│                     │
│  📦 Order #XYZ789   │
│  ─────────────────  │
│  ✅ Delivered       │
│  ₹120               │
│                     │
│  [View Details →]   │
│                     │
└─────────────────────┘
```

### Screen 2: Split Order Tracking
```
┌─────────────────────┐
│  ← Order #ABC123    │
├─────────────────────┤
│                     │
│  Order 1 of 3       │
│  ─────────────────  │
│  🚚 Out for Delivery│
│  ₹350               │
│                     │
│  🏪 Green Valley    │
│     Franchise       │
│  📞 9876543210      │
│                     │
│  🛵 Amit Singh      │
│  📞 9123456789      │
│  🚗 KA01AB1234      │
│                     │
│  📦 Items:          │
│  • Tomato: 5 kg     │
│  • Onion: 3 kg      │
│                     │
│  [Contact] [Track]  │
│                     │
├─────────────────────┤
│  Order 2 of 3       │
│  (Scroll for more)  │
└─────────────────────┘
```

---

## 🎨 Color Coding

### Status Colors
```
✅ Delivered          → Green (#4CAF50)
🚚 Out for Delivery   → Blue (#2196F3)
📦 Packed             → Orange (#FF9800)
⏳ Accepted           → Yellow (#FFC107)
🔄 Assigned           → Purple (#9C27B0)
📝 Placed             → Grey (#9E9E9E)
❌ Cancelled          → Red (#F44336)
```

### Card Colors
```
Split Order Card      → Light Blue Background (#E3F2FD)
Standalone Order Card → White Background (#FFFFFF)
Active Order          → Border: Blue (#2196F3)
Completed Order       → Border: Green (#4CAF50)
```

---

## 💡 User Experience Tips

### 1. Clear Communication
```
❌ Bad:  "Order split"
✅ Good: "Your order will arrive in 3 separate deliveries"

❌ Bad:  "Multiple orders"
✅ Good: "3 orders from different stores"
```

### 2. Status Updates
```
❌ Bad:  "Status: Packed"
✅ Good: "Order 1: Out for Delivery (arriving soon!)"
         "Order 2: Being packed at store"
         "Order 3: Accepted by store"
```

### 3. Contact Information
```
❌ Bad:  Show only phone number
✅ Good: Show name, phone, and "Call" button
         "Amit Singh • 📞 9123456789 [Call Now]"
```

### 4. Progress Indication
```
❌ Bad:  Just show current status
✅ Good: Show timeline with completed steps
         ✅ Placed → ✅ Accepted → ✅ Packed → 🚚 Delivering
```

---

## 🚀 Performance Optimization

### API Response Time
```
Target: < 500ms for /my-orders
Target: < 300ms for /group/:id

Optimization:
1. Index on orderGroupId
2. Populate only required fields
3. Limit response size
4. Cache frequently accessed data
```

### Frontend Rendering
```
Optimization:
1. Lazy load order details
2. Virtual scrolling for long lists
3. Image lazy loading
4. Skeleton screens while loading
```

---

## 📈 Analytics to Track

### Key Metrics
```
1. Split Order Rate
   - % of orders that are split
   - Average number of splits per order

2. Delivery Success Rate
   - % of split orders fully delivered
   - Average delivery time per split

3. User Engagement
   - % of users tracking split orders
   - Average time spent on tracking page

4. Support Tickets
   - % of tickets related to split orders
   - Common issues reported
```

---

## ✅ Testing Checklist

### Functional Testing
- [ ] Split orders display correctly in list
- [ ] Individual order tracking works
- [ ] Franchise details show correctly
- [ ] Delivery partner info displays
- [ ] Status updates reflect accurately
- [ ] Authorization works properly
- [ ] Error handling is robust

### UI/UX Testing
- [ ] Cards are visually distinct
- [ ] Icons are clear and meaningful
- [ ] Colors follow design system
- [ ] Responsive on all screen sizes
- [ ] Accessible (screen readers)
- [ ] Loading states are smooth

### Performance Testing
- [ ] API responds within target time
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Images load efficiently
- [ ] Works on slow networks

---

**Visual Guide Version:** 1.0.0  
**Last Updated:** April 30, 2026  
**Status:** ✅ Ready for Implementation
